import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import jwt from "jsonwebtoken";
import { prisma } from "./db/prisma.js";
import bcrypt from "bcrypt";
import {
  searchGoogleBooks,
  fetchGoogleVolume,
  mapVolumeToBookCreate,
} from "./services/googleBooks.js";

type JwtUser = { userId: string };

type GraphQLContext = {
  user: JwtUser | null;
  prisma: typeof prisma;
};

const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    displayName: String!
    createdAt: String!
  }

  type Club {
    id: ID!
    name: String!
    description: String
    ownerId: ID!
    createdAt: String!
  }

  type ClubMember {
    id: ID!
    clubId: ID!
    userId: ID!
    role: String!
    joinedAt: String!
    leftAt: String
  }

  type Meeting {
    id: ID!
    clubId: ID!
    bookId: ID!
    title: String!
    description: String
    location: String
    scheduledAt: String!
    createdById: ID!
    currentBettorId: ID
    createdAt: String!
  }


  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    hello: String
    me: User
    clubs: [Club!]!
    club(id: ID!): Club
    searchBooks(query: String!): [BookSearchResult!]!
    myReadings(clubId: ID): [Reading!]!
    reading(id: ID!): Reading
    clubReadings(clubId: ID!, bookId: ID): [Reading!]!
    meetings(clubId: ID!): [Meeting!]!
    meeting(id: ID!): Meeting
    pointBalance(clubId: ID!): PointBalance!
    pointTransactions(clubId: ID!, userId: ID): [PointTransaction!]!
    clubLeaderboard(clubId: ID!): [LeaderboardEntry!]!
    bettingContext(clubId: ID!, bookId: ID!): BettingContext!
    bookBets(clubId: ID!, bookId: ID!): [Bet!]!
    myBets(clubId: ID!): [Bet!]!
  }

  type Mutation {
    signup(email: String!, password: String!, displayName: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    createClub(name: String!, description: String): Club!
    joinClub(clubId: ID!): ClubMember!
    leaveClub(clubId: ID!): Boolean!

    addBookFromGoogleVolume(volumeId: String!): Book!
    createMeeting(clubId: ID!, bookId: ID!, title: String!, description: String, location: String, scheduledAt: String!): Meeting!

    startReading(clubId: ID!, bookId: ID!, meetingId: ID): Reading!
    updateReadingProgress(readingId: ID!, currentPage: Int!): ReadingProgress!
    finishReading(readingId: ID!): Reading!
    updateReadingStatus(readingId: ID!, status: ReadingStatus!): Reading!

    placeBet(clubId: ID!, bookId: ID!, predictedUserId: ID!, stakePoints: Int!): Bet!
  }

  type Book {
    id: ID!
    googleVolumeId: String!
    title: String!
    authors: String
    pageCount: Int
    thumbnailUrl: String
    description: String
    publishedDate: String
  }

  type BookSearchResult {
    googleVolumeId: String!
    title: String!
    authors: String
    pageCount: Int
    thumbnailUrl: String
    description: String
    publishedDate: String
  }

  enum ReadingStatus {
    PLANNED
    READING
    FINISHED
    ABANDONED
  }

  type Reading {
    id: ID!
    clubId: ID!
    meetingId: ID
    userId: ID!
    bookId: ID!
    status: ReadingStatus!
    startedAt: String
    finishedAt: String
    createdAt: String!
    book: Book
    progress: ReadingProgress
  }

  type ReadingProgress {
    id: ID!
    readingId: ID!
    currentPage: Int!
    totalPages: Int
    source: String!
    updatedAt: String!
  }

  type PointTransaction {
    id: ID!
    clubId: ID!
    userId: ID!
    amount: Int!
    reason: String!
    referenceId: String
    createdAt: String!
  }

  type PointBalance {
    userId: ID!
    clubId: ID!
    totalPoints: Int!
  }

  type LeaderboardEntry {
    userId: ID!
    displayName: String!
    totalPoints: Int!
    rank: Int!
  }

  type Bet {
    id: ID!
    clubId: ID!
    meetingId: ID
    bookId: ID!
    bettorId: ID!
    predictedUserId: ID!
    predictedUserRank: Int!
    stakePoints: Int!
    placedAt: String!
    resolvedAt: String
    outcome: String!
    resolvedByReadingId: ID
    bettor: User
    predictedUser: User
  }

  type RaceStanding {
    userId: ID!
    displayName: String!
    currentPage: Int!
    totalPages: Int!
    rank: Int!
    hasFinished: Boolean!
  }

  type BettingContext {
    canBet: Boolean!
    mustBet: Boolean!
    yourTurn: Boolean!
    minStake: Int!
    maxStake: Int!
    currentStandings: [RaceStanding!]!
    activeBet: Bet
  }
`;

function signToken(userId: string): string {
  if (!jwtSecret) throw new Error("JWT_SECRET not set");
  return jwt.sign({ userId }, jwtSecret, { expiresIn: "7d" });
}

async function getRaceStandings(clubId: string, bookId: string) {
  const readings = await prisma.reading.findMany({
    where: { clubId, bookId },
    include: { progress: true, user: true },
  });

  // Sort by: finished users first (by finishedAt), then by currentPage desc
  const sorted = readings.sort((a, b) => {
    if (a.status === "FINISHED" && b.status !== "FINISHED") return -1;
    if (b.status === "FINISHED" && a.status !== "FINISHED") return 1;
    if (a.status === "FINISHED" && b.status === "FINISHED") {
      return a.finishedAt! < b.finishedAt! ? -1 : 1;
    }
    return (b.progress?.currentPage || 0) - (a.progress?.currentPage || 0);
  });

  // Assign ranks (only to unfinished users)
  let rank = 1;
  return sorted.map((reading) => ({
    userId: reading.userId,
    displayName: reading.user.displayName,
    currentPage: reading.progress?.currentPage || 0,
    totalPages: reading.progress?.totalPages || 0,
    rank: reading.status === "FINISHED" ? 0 : rank++,
    hasFinished: reading.status === "FINISHED",
    finishedAt: reading.finishedAt,
  }));
}

async function getPointBalance(clubId: string, userId: string): Promise<number> {
  const result = await prisma.pointTransaction.aggregate({
    where: { clubId, userId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

const resolvers = {
  Query: {
    hello: (_: unknown, __: unknown, ctx: GraphQLContext) =>
      ctx.user
        ? `Bookclub API running (user: ${ctx.user.userId})`
        : "Bookclub API running",

    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.user) return null;
      return ctx.prisma.user.findUnique({
        where: { id: ctx.user.userId },
      });
    },

    clubs: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const memberships = await ctx.prisma.clubMember.findMany({
        where: { userId: ctx.user.userId, leftAt: null },
        select: { clubId: true },
      });

      const clubIds = memberships.map((m) => m.clubId);

      return ctx.prisma.club.findMany({
        where: { id: { in: clubIds } },
      });
    },

    club: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const member = await ctx.prisma.clubMember.findFirst({
        where: {
          clubId: args.id,
          userId: ctx.user.userId,
          leftAt: null,
        },
      });

      if (!member) throw new Error("Not a member of this club");

      return ctx.prisma.club.findUnique({
        where: { id: args.id },
      });
    },
    searchBooks: async (
      _: unknown,
      args: { query: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const q = args.query.trim();
      if (!q) return [];
      return searchGoogleBooks(q, 10);
    },

    myReadings: async (
      _: unknown,
      args: { clubId?: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const where: any = { userId: ctx.user.userId };
      if (args.clubId) {
        where.clubId = args.clubId;
      }

      return ctx.prisma.reading.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    },

    reading: async (
      _: unknown,
      args: { id: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const reading = await ctx.prisma.reading.findUnique({
        where: { id: args.id },
      });

      if (!reading) return null;

      // Verify the user owns this reading
      if (reading.userId !== ctx.user.userId) {
        throw new Error("Not authorized to view this reading");
      }

      return reading;
    },

    clubReadings: async (
      _: unknown,
      args: { clubId: string; bookId?: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      // Verify user is a member of the club
      const member = await ctx.prisma.clubMember.findFirst({
        where: {
          clubId: args.clubId,
          userId: ctx.user.userId,
          leftAt: null,
        },
      });

      if (!member) throw new Error("Not a member of this club");

      const where: any = { clubId: args.clubId };
      if (args.bookId) {
        where.bookId = args.bookId;
      }

      return ctx.prisma.reading.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    },

    meetings: async (
      _: unknown,
      args: { clubId: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      // Verify user is a member of the club
      const member = await ctx.prisma.clubMember.findFirst({
        where: {
          clubId: args.clubId,
          userId: ctx.user.userId,
          leftAt: null,
        },
      });

      if (!member) throw new Error("Not a member of this club");

      return ctx.prisma.meeting.findMany({
        where: { clubId: args.clubId },
        orderBy: { scheduledAt: "asc" },
      });
    },

    meeting: async (
      _: unknown,
      args: { id: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const meeting = await ctx.prisma.meeting.findUnique({
        where: { id: args.id },
      });

      if (!meeting) return null;

      // Verify user is a member of the club
      const member = await ctx.prisma.clubMember.findFirst({
        where: {
          clubId: meeting.clubId,
          userId: ctx.user.userId,
          leftAt: null,
        },
      });

      if (!member) throw new Error("Not a member of this club");

      return meeting;
    },

    pointBalance: async (
      _: unknown,
      args: { clubId: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      // Verify user is a member of the club
      const member = await ctx.prisma.clubMember.findFirst({
        where: {
          clubId: args.clubId,
          userId: ctx.user.userId,
          leftAt: null,
        },
      });

      if (!member) throw new Error("Not a member of this club");

      // Sum all point transactions for the user in this club
      const result = await ctx.prisma.pointTransaction.aggregate({
        where: {
          clubId: args.clubId,
          userId: ctx.user.userId,
        },
        _sum: {
          amount: true,
        },
      });

      return {
        userId: ctx.user.userId,
        clubId: args.clubId,
        totalPoints: result._sum.amount ?? 0,
      };
    },

    pointTransactions: async (
      _: unknown,
      args: { clubId: string; userId?: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      // Verify user is a member of the club
      const member = await ctx.prisma.clubMember.findFirst({
        where: {
          clubId: args.clubId,
          userId: ctx.user.userId,
          leftAt: null,
        },
      });

      if (!member) throw new Error("Not a member of this club");

      // Determine which user's transactions to fetch
      const targetUserId = args.userId ?? ctx.user.userId;

      // If requesting another user's transactions, verify requester is admin or owner
      if (targetUserId !== ctx.user.userId) {
        if (member.role !== "ADMIN" && member.role !== "OWNER") {
          throw new Error("Only admins can view other users' transactions");
        }
      }

      return ctx.prisma.pointTransaction.findMany({
        where: {
          clubId: args.clubId,
          userId: targetUserId,
        },
        orderBy: { createdAt: "desc" },
      });
    },

    clubLeaderboard: async (
      _: unknown,
      args: { clubId: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      // Verify user is a member of the club
      const member = await ctx.prisma.clubMember.findFirst({
        where: {
          clubId: args.clubId,
          userId: ctx.user.userId,
          leftAt: null,
        },
      });

      if (!member) throw new Error("Not a member of this club");

      // Get all active club members
      const members = await ctx.prisma.clubMember.findMany({
        where: {
          clubId: args.clubId,
          leftAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      });

      // Calculate points for each member
      const leaderboardData = await Promise.all(
        members.map(async (member) => {
          const result = await ctx.prisma.pointTransaction.aggregate({
            where: {
              clubId: args.clubId,
              userId: member.userId,
            },
            _sum: {
              amount: true,
            },
          });

          return {
            userId: member.userId,
            displayName: member.user.displayName,
            totalPoints: result._sum.amount ?? 0,
          };
        }),
      );

      // Sort by points descending and assign ranks
      leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);

      return leaderboardData.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
    },

    bettingContext: async (
      _: unknown,
      args: { clubId: string; bookId: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      // Get user's reading for this book
      const reading = await ctx.prisma.reading.findFirst({
        where: {
          clubId: args.clubId,
          bookId: args.bookId,
          userId: ctx.user.userId,
        },
        include: { book: true },
      });

      if (!reading) {
        return {
          canBet: false,
          mustBet: false,
          yourTurn: false,
          minStake: 0,
          maxStake: 0,
          currentStandings: [],
          activeBet: null,
        };
      }

      // Get standings
      const standings = await getRaceStandings(args.clubId, args.bookId);

      // Check if user has finished
      const hasFinished = reading.status === "FINISHED";

      // Check if user has active bet
      const activeBet = await ctx.prisma.bet.findFirst({
        where: {
          clubId: args.clubId,
          bookId: args.bookId,
          bettorId: ctx.user.userId,
          outcome: "PENDING",
        },
      });

      // Check if meeting deadline has passed
      const meeting = await ctx.prisma.meeting.findFirst({
        where: { clubId: args.clubId, bookId: args.bookId },
      });

      const deadlinePassed = meeting && new Date() > meeting.scheduledAt;

      const pageCount = reading.book.pageCount || 100;
      const minStake = Math.ceil(pageCount * 0.1);
      const maxStake = pageCount;

      return {
        canBet: hasFinished && !activeBet && !deadlinePassed,
        mustBet: hasFinished && !activeBet && !deadlinePassed,
        yourTurn: hasFinished && !activeBet,
        minStake,
        maxStake,
        currentStandings: standings,
        activeBet,
      };
    },

    bookBets: async (
      _: unknown,
      args: { clubId: string; bookId: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      // Verify user is a member of the club
      const member = await ctx.prisma.clubMember.findFirst({
        where: {
          clubId: args.clubId,
          userId: ctx.user.userId,
          leftAt: null,
        },
      });

      if (!member) throw new Error("Not a member of this club");

      return ctx.prisma.bet.findMany({
        where: {
          clubId: args.clubId,
          bookId: args.bookId,
        },
        orderBy: { placedAt: "desc" },
      });
    },

    myBets: async (
      _: unknown,
      args: { clubId: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      // Verify user is a member of the club
      const member = await ctx.prisma.clubMember.findFirst({
        where: {
          clubId: args.clubId,
          userId: ctx.user.userId,
          leftAt: null,
        },
      });

      if (!member) throw new Error("Not a member of this club");

      return ctx.prisma.bet.findMany({
        where: {
          clubId: args.clubId,
          bettorId: ctx.user.userId,
        },
        orderBy: { placedAt: "desc" },
      });
    },
  },
  Mutation: {
    signup: async (
      _: unknown,
      args: { email: string; password: string; displayName: string },
      ctx: GraphQLContext,
    ) => {
      const email = args.email.trim().toLowerCase();
      const displayName = args.displayName.trim();

      if (args.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const existing = await ctx.prisma.user.findUnique({ where: { email } });
      if (existing) throw new Error("Email already in use");

      const passwordHash = await bcrypt.hash(args.password, 12);

      const user = await ctx.prisma.user.create({
        data: { email, passwordHash, displayName },
        select: {
          id: true,
          email: true,
          displayName: true,
          createdAt: true,
        },
      });

      const token = signToken(user.id);
      return { token, user };
    },

    login: async (
      _: unknown,
      args: { email: string; password: string },
      ctx: GraphQLContext,
    ) => {
      const email = args.email.trim().toLowerCase();

      // Need passwordHash for verification, then return a safe user shape
      const userWithHash = await ctx.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          displayName: true,
          createdAt: true,
          passwordHash: true,
        },
      });

      if (!userWithHash) throw new Error("Invalid email or password");

      const ok = await bcrypt.compare(args.password, userWithHash.passwordHash);
      if (!ok) throw new Error("Invalid email or password");

      const { passwordHash: _ph, ...user } = userWithHash;
      const token = signToken(user.id);

      return { token, user };
    },
    createClub: async (
      _: unknown,
      args: { name: string; description?: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      return ctx.prisma.club.create({
        data: {
          name: args.name.trim(),
          description: args.description ?? null,
          ownerId: ctx.user.userId,
          members: {
            create: {
              userId: ctx.user.userId,
              role: "OWNER",
            },
          },
        },
      });
    },
    joinClub: async (
      _: unknown,
      args: { clubId: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      // 1) Ensure the club exists (otherwise Prisma create can fail with FK error)
      const club = await ctx.prisma.club.findUnique({
        where: { id: args.clubId },
        select: { id: true },
      });
      if (!club) throw new Error("Club not found");

      // 2) If already an active member, return that row
      const existing = await ctx.prisma.clubMember.findFirst({
        where: {
          clubId: args.clubId,
          userId: ctx.user.userId,
          leftAt: null,
        },
      });
      if (existing) return existing;

      // 3) Create membership and RETURN it
      return ctx.prisma.clubMember.create({
        data: {
          clubId: args.clubId,
          userId: ctx.user.userId,
          role: "MEMBER",
        },
      });
    },

    leaveClub: async (
      _: unknown,
      args: { clubId: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const membership = await ctx.prisma.clubMember.findFirst({
        where: {
          clubId: args.clubId,
          userId: ctx.user.userId,
          leftAt: null,
        },
      });

      if (!membership) return true;

      await ctx.prisma.clubMember.update({
        where: { id: membership.id },
        data: { leftAt: new Date() },
      });

      return true;
    },
    addBookFromGoogleVolume: async (
      _: unknown,
      args: { volumeId: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const volumeId = args.volumeId.trim();
      if (!volumeId) throw new Error("volumeId is required");

      const volume = await fetchGoogleVolume(volumeId);
      const data = mapVolumeToBookCreate(volume);

      // Idempotent: if it already exists, you’ll just update fields and return it
      return ctx.prisma.book.upsert({
        where: { googleVolumeId: data.googleVolumeId },
        create: data,
        update: {
          title: data.title,
          authors: data.authors,
          pageCount: data.pageCount,
          thumbnailUrl: data.thumbnailUrl,
          publishedDate: data.publishedDate,
          description: data.description,
          metadataJson: data.metadataJson,
        },
      });
    },

    createMeeting: async (
      _: unknown,
      args: {
        clubId: string;
        bookId: string;
        title: string;
        description?: string;
        location?: string;
        scheduledAt: string;
      },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      // Verify user is a member of the club
      const member = await ctx.prisma.clubMember.findFirst({
        where: {
          clubId: args.clubId,
          userId: ctx.user.userId,
          leftAt: null,
        },
      });

      if (!member) throw new Error("Not a member of this club");

      // Verify book exists
      const book = await ctx.prisma.book.findUnique({
        where: { id: args.bookId },
      });

      if (!book) throw new Error("Book not found");

      // Parse and validate scheduledAt
      const scheduledAt = new Date(args.scheduledAt);
      if (isNaN(scheduledAt.getTime())) {
        throw new Error("Invalid scheduledAt date");
      }

      return ctx.prisma.meeting.create({
        data: {
          clubId: args.clubId,
          bookId: args.bookId,
          title: args.title.trim(),
          description: args.description?.trim() ?? null,
          location: args.location?.trim() ?? null,
          scheduledAt,
          createdById: ctx.user.userId,
        },
      });
    },

    startReading: async (
      _: unknown,
      args: { clubId: string; bookId: string; meetingId?: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      // Verify user is a member of the club
      const member = await ctx.prisma.clubMember.findFirst({
        where: {
          clubId: args.clubId,
          userId: ctx.user.userId,
          leftAt: null,
        },
      });

      if (!member) throw new Error("Not a member of this club");

      // Verify book exists
      const book = await ctx.prisma.book.findUnique({
        where: { id: args.bookId },
      });

      if (!book) throw new Error("Book not found");

      // Verify meeting exists if provided
      if (args.meetingId) {
        const meeting = await ctx.prisma.meeting.findUnique({
          where: { id: args.meetingId },
        });
        if (!meeting) throw new Error("Meeting not found");
        if (meeting.clubId !== args.clubId)
          throw new Error("Meeting does not belong to this club");
      }

      // Create reading with progress
      return ctx.prisma.reading.create({
        data: {
          clubId: args.clubId,
          userId: ctx.user.userId,
          bookId: args.bookId,
          meetingId: args.meetingId ?? null,
          status: "READING",
          startedAt: new Date(),
          progress: {
            create: {
              currentPage: 0,
              totalPages: book.pageCount,
              source: "MANUAL",
            },
          },
        },
      });
    },

    updateReadingProgress: async (
      _: unknown,
      args: { readingId: string; currentPage: number },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      if (args.currentPage < 0) {
        throw new Error("currentPage must be >= 0");
      }

      // Verify the reading exists and belongs to the user
      const reading = await ctx.prisma.reading.findUnique({
        where: { id: args.readingId },
        include: { progress: true, book: true },
      });

      if (!reading) throw new Error("Reading not found");
      if (reading.userId !== ctx.user.userId) {
        throw new Error("Not authorized to update this reading");
      }

      if (reading.status === "ABANDONED") {
        throw new Error("Cannot update progress for abandoned readings");
      }

      // Get old page count for points calculation
      const oldPage = reading.progress?.currentPage ?? 0;
      const newPage = args.currentPage;
      const pagesRead = newPage - oldPage;

      // Create or update progress
      let updatedProgress;
      if (reading.progress) {
        updatedProgress = await ctx.prisma.readingProgress.update({
          where: { id: reading.progress.id },
          data: { currentPage: args.currentPage },
        });
      } else {
        updatedProgress = await ctx.prisma.readingProgress.create({
          data: {
            readingId: args.readingId,
            currentPage: args.currentPage,
            totalPages: reading.book.pageCount,
            source: "MANUAL",
          },
        });
      }

      // Award points if pages were read forward (prevent gaming by going backwards)
      if (pagesRead > 0) {
        await ctx.prisma.pointTransaction.create({
          data: {
            clubId: reading.clubId,
            userId: reading.userId,
            amount: pagesRead,
            reason: "PAGE_READ",
            referenceId: args.readingId,
          },
        });
      }

      return updatedProgress;
    },

    finishReading: async (
      _: unknown,
      args: { readingId: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const userId = ctx.user.userId; // Capture for transaction scope

      // Use transaction to ensure atomicity and prevent race conditions
      return await ctx.prisma.$transaction(async (tx) => {
        // 1. Verify and lock the reading
        const reading = await tx.reading.findUnique({
          where: { id: args.readingId },
          include: { book: true },
        });

        if (!reading) throw new Error("Reading not found");
        if (reading.userId !== userId) {
          throw new Error("Not authorized to update this reading");
        }
        if (reading.status === "FINISHED") {
          throw new Error("Reading already finished");
        }

        // 2. Mark as finished
        const finishedReading = await tx.reading.update({
          where: { id: args.readingId },
          data: {
            status: "FINISHED",
            finishedAt: new Date(),
          },
          include: { book: true },
        });

        // 3. Find and resolve ANY pending bets for this race
        const pendingBets = await tx.bet.findMany({
          where: {
            clubId: finishedReading.clubId,
            bookId: finishedReading.bookId,
            outcome: "PENDING",
          },
        });

        // 4. Resolve bets within same transaction
        for (const bet of pendingBets) {
          const isCorrect = bet.predictedUserId === finishedReading.userId;
          const multiplier = 1 + (bet.predictedUserRank - 1) * 0.5;
          const payout = Math.floor(bet.stakePoints * multiplier);

          if (isCorrect) {
            // CORRECT PREDICTION: Both bettor and finisher get payout
            await tx.pointTransaction.createMany({
              data: [
                {
                  clubId: bet.clubId,
                  userId: bet.bettorId,
                  amount: payout,
                  reason: "BET_WON",
                  referenceId: bet.id,
                },
                {
                  clubId: bet.clubId,
                  userId: finishedReading.userId,
                  amount: payout,
                  reason: "BET_WON",
                  referenceId: bet.id,
                },
              ],
            });
          } else {
            // WRONG PREDICTION: Only finisher gets payout
            await tx.pointTransaction.create({
              data: {
                clubId: bet.clubId,
                userId: finishedReading.userId,
                amount: payout,
                reason: "BET_WON",
                referenceId: bet.id,
              },
            });
          }

          // Update bet outcome
          await tx.bet.update({
            where: { id: bet.id },
            data: {
              outcome: isCorrect ? "WON" : "LOST",
              resolvedAt: new Date(),
              resolvedByReadingId: finishedReading.id,
            },
          });
        }

        // 5. Update meeting to set finisher as next bettor
        const meeting = await tx.meeting.findFirst({
          where: {
            clubId: finishedReading.clubId,
            bookId: finishedReading.bookId,
          },
        });

        if (meeting) {
          // Set this finisher as the next bettor
          await tx.meeting.update({
            where: { id: meeting.id },
            data: { currentBettorId: finishedReading.userId },
          });
        }

        // 6. Check if this is the last person to finish
        const allReadings = await tx.reading.findMany({
          where: {
            clubId: finishedReading.clubId,
            bookId: finishedReading.bookId,
          },
        });

        const unfinishedCount = allReadings.filter(
          (r) => r.status !== "FINISHED",
        ).length;

        if (unfinishedCount === 0 && meeting) {
          // Award bonus if finished before deadline
          if (finishedReading.finishedAt! <= meeting.scheduledAt) {
            const bonusAmount = Math.floor(
              (finishedReading.book.pageCount || 100) * 0.5,
            );
            await tx.pointTransaction.create({
              data: {
                clubId: finishedReading.clubId,
                userId: finishedReading.userId,
                amount: bonusAmount,
                reason: "BET_BONUS",
                referenceId: args.readingId,
              },
            });
          }

          // Clear currentBettorId since betting is done
          await tx.meeting.update({
            where: { id: meeting.id },
            data: { currentBettorId: null },
          });
        }

        return finishedReading;
      });
    },

    updateReadingStatus: async (
      _: unknown,
      args: { readingId: string; status: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const validStatuses = ["PLANNED", "READING", "FINISHED", "ABANDONED"];
      if (!validStatuses.includes(args.status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
      }

      const reading = await ctx.prisma.reading.findUnique({
        where: { id: args.readingId },
      });

      if (!reading) throw new Error("Reading not found");
      if (reading.userId !== ctx.user.userId) {
        throw new Error("Not authorized to update this reading");
      }

      const updateData: any = { status: args.status };

      // Set timestamps based on status transitions
      if (args.status === "READING" && !reading.startedAt) {
        updateData.startedAt = new Date();
      }
      if (args.status === "FINISHED" && !reading.finishedAt) {
        updateData.finishedAt = new Date();
      }

      return ctx.prisma.reading.update({
        where: { id: args.readingId },
        data: updateData,
      });
    },

    placeBet: async (
      _: unknown,
      args: {
        clubId: string;
        bookId: string;
        predictedUserId: string;
        stakePoints: number;
      },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const userId = ctx.user.userId; // Capture for transaction scope

      // Use transaction to ensure atomicity
      return await ctx.prisma.$transaction(async (tx) => {
        // 1. Validate user is member of club and get their reading
        const reading = await tx.reading.findFirst({
          where: {
            clubId: args.clubId,
            bookId: args.bookId,
            userId: userId,
          },
          include: { book: true },
        });

        if (!reading) throw new Error("You are not reading this book");
        if (reading.status !== "FINISHED") {
          throw new Error("You must finish the book before betting");
        }

        // 2. Check if betting window is still open and enforce turn-taking
        const meeting = await tx.meeting.findFirst({
          where: { clubId: args.clubId, bookId: args.bookId },
        });

        if (!meeting) {
          throw new Error("No meeting found for this book");
        }

        if (new Date() > meeting.scheduledAt) {
          throw new Error("Betting window closed - meeting has passed");
        }

        // CRITICAL: Enforce turn-taking
        if (meeting.currentBettorId && meeting.currentBettorId !== userId) {
          throw new Error("Not your turn to bet");
        }

        // 3. Check if there's already a pending bet (database constraint will also prevent this)
        const existingPendingBet = await tx.bet.findFirst({
          where: {
            clubId: args.clubId,
            bookId: args.bookId,
            meetingId: meeting.id,
            outcome: "PENDING",
          },
        });

        if (existingPendingBet) {
          throw new Error("A pending bet already exists for this race");
        }

        // 4. Validate stake amount (min: 0.1 × pageCount, max: 1.0 × pageCount)
        const pageCount = reading.book.pageCount || 100;
        const minStake = Math.ceil(pageCount * 0.1);
        const maxStake = pageCount;

        if (args.stakePoints < minStake || args.stakePoints > maxStake) {
          throw new Error(`Stake must be between ${minStake} and ${maxStake}`);
        }

        // 5. Check user has enough points
        const balanceResult = await tx.pointTransaction.aggregate({
          where: { clubId: args.clubId, userId: userId },
          _sum: { amount: true },
        });
        const balance = balanceResult._sum.amount ?? 0;

        if (balance < args.stakePoints) {
          throw new Error(
            `Insufficient points. You have ${balance}, need ${args.stakePoints}`,
          );
        }

        // 6. Validate predicted user exists and hasn't finished
        const predictedReading = await tx.reading.findFirst({
          where: {
            clubId: args.clubId,
            bookId: args.bookId,
            userId: args.predictedUserId,
          },
        });

        if (!predictedReading) throw new Error("Predicted user not found");
        if (predictedReading.status === "FINISHED") {
          throw new Error("Cannot bet on user who has already finished");
        }

        // 7. Calculate predicted user's rank
        const allReadings = await tx.reading.findMany({
          where: { clubId: args.clubId, bookId: args.bookId },
          include: { progress: true, user: true },
        });

        const sorted = allReadings.sort((a, b) => {
          if (a.status === "FINISHED" && b.status !== "FINISHED") return -1;
          if (b.status === "FINISHED" && a.status !== "FINISHED") return 1;
          if (a.status === "FINISHED" && b.status === "FINISHED") {
            return a.finishedAt! < b.finishedAt! ? -1 : 1;
          }
          return (b.progress?.currentPage || 0) - (a.progress?.currentPage || 0);
        });

        let rank = 1;
        const standings = sorted.map((r) => ({
          userId: r.userId,
          rank: r.status === "FINISHED" ? 0 : rank++,
        }));

        const predictedStanding = standings.find(
          (s) => s.userId === args.predictedUserId,
        );
        const predictedRank = predictedStanding?.rank || 1;

        // 8. Atomically deduct stake and create bet
        await tx.pointTransaction.create({
          data: {
            clubId: args.clubId,
            userId: userId,
            amount: -args.stakePoints,
            reason: "BET_LOST",
            referenceId: null,
          },
        });

        const bet = await tx.bet.create({
          data: {
            clubId: args.clubId,
            bookId: args.bookId,
            meetingId: meeting.id,
            bettorId: userId,
            predictedUserId: args.predictedUserId,
            predictedUserRank: predictedRank,
            stakePoints: args.stakePoints,
          },
        });

        return bet;
      });
    },
  },
  Reading: {
    book: async (parent: any, _: unknown, ctx: GraphQLContext) => {
      return ctx.prisma.book.findUnique({
        where: { id: parent.bookId },
      });
    },
    progress: async (parent: any, _: unknown, ctx: GraphQLContext) => {
      return ctx.prisma.readingProgress.findUnique({
        where: { readingId: parent.id },
      });
    },
  },
  Bet: {
    bettor: async (parent: any, _: unknown, ctx: GraphQLContext) => {
      return ctx.prisma.user.findUnique({
        where: { id: parent.bettorId },
      });
    },
    predictedUser: async (parent: any, _: unknown, ctx: GraphQLContext) => {
      return ctx.prisma.user.findUnique({
        where: { id: parent.predictedUserId },
      });
    },
  },
};

const server = new ApolloServer<GraphQLContext>({ typeDefs, resolvers });

const port = Number(process.env.PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET;

function getBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token.length ? token : null;
}

async function startServer() {
  if (!jwtSecret) {
    // You can choose to hard-fail instead; this just logs and continues unauthenticated.
    console.warn(
      "JWT_SECRET not set; all requests will be treated as unauthenticated.",
    );
  }

  const { url } = await startStandaloneServer(server, {
    listen: { port },
    context: async ({ req }): Promise<GraphQLContext> => {
      const token = getBearerToken(req.headers.authorization);

      if (!token || !jwtSecret) return { prisma, user: null };

      try {
        const decoded = jwt.verify(token, jwtSecret);
        if (typeof decoded === "string") return { prisma, user: null };

        const userId = (decoded as any).userId;
        if (typeof userId !== "string") return { prisma, user: null };

        return { prisma, user: { userId } };
      } catch {
        return { prisma, user: null };
      }
    },
  });

  console.log(`Server running on ${url}`);
}

void startServer();
