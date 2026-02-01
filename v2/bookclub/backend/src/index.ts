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
  }

  type Mutation {
    signup(email: String!, password: String!, displayName: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    createClub(name: String!, description: String): Club!
    joinClub(clubId: ID!): ClubMember!
    leaveClub(clubId: ID!): Boolean!

    addBookFromGoogleVolume(volumeId: String!): Book!
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
`;

function signToken(userId: string): string {
  if (!jwtSecret) throw new Error("JWT_SECRET not set");
  return jwt.sign({ userId }, jwtSecret, { expiresIn: "7d" });
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
      ctx: GraphQLContext
    ) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const q = args.query.trim();
      if (!q) return [];
      return searchGoogleBooks(q, 10);
    },
  },
  Mutation: {
    signup: async (
      _: unknown,
      args: { email: string; password: string; displayName: string },
      ctx: GraphQLContext
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
      ctx: GraphQLContext
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
      ctx: GraphQLContext
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
      ctx: GraphQLContext
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
      ctx: GraphQLContext
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
      ctx: GraphQLContext
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
      "JWT_SECRET not set; all requests will be treated as unauthenticated."
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
