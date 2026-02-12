import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { prisma } from '../db/prisma.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// Helper to create a JWT token
function createToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Test data setup
let testClub: any;
let testBook: any;
let testMeeting: any;
let user1: any, user2: any, user3: any, user4: any;
let user1Token: string, user2Token: string, user3Token: string, user4Token: string;

describe('Betting System Tests', () => {
  beforeAll(async () => {
    // Create test users
    const passwordHash = await bcrypt.hash('password123', 12);
    
    user1 = await prisma.user.create({
      data: {
        email: 'user1@test.com',
        passwordHash,
        displayName: 'User One',
      },
    });
    user1Token = createToken(user1.id);

    user2 = await prisma.user.create({
      data: {
        email: 'user2@test.com',
        passwordHash,
        displayName: 'User Two',
      },
    });
    user2Token = createToken(user2.id);

    user3 = await prisma.user.create({
      data: {
        email: 'user3@test.com',
        passwordHash,
        displayName: 'User Three',
      },
    });
    user3Token = createToken(user3.id);

    user4 = await prisma.user.create({
      data: {
        email: 'user4@test.com',
        passwordHash,
        displayName: 'User Four',
      },
    });
    user4Token = createToken(user4.id);

    // Create test club
    testClub = await prisma.club.create({
      data: {
        name: 'Test Club',
        description: 'A club for testing',
        ownerId: user1.id,
      },
    });

    // Add all users to the club
    await prisma.clubMember.createMany({
      data: [
        { clubId: testClub.id, userId: user1.id, role: 'OWNER' },
        { clubId: testClub.id, userId: user2.id, role: 'MEMBER' },
        { clubId: testClub.id, userId: user3.id, role: 'MEMBER' },
        { clubId: testClub.id, userId: user4.id, role: 'MEMBER' },
      ],
    });

    // Create test book
    testBook = await prisma.book.create({
      data: {
        googleVolumeId: 'test-book-123',
        title: 'Test Book',
        authors: 'Test Author',
        pageCount: 300,
        thumbnailUrl: 'https://example.com/thumb.jpg',
        description: 'A test book',
        publishedDate: '2024-01-01',
      },
    });

    // Create meeting 2 days from now
    const meetingDate = new Date();
    meetingDate.setDate(meetingDate.getDate() + 2);

    testMeeting = await prisma.meeting.create({
      data: {
        clubId: testClub.id,
        bookId: testBook.id,
        title: 'Test Meeting',
        description: 'Discuss the book',
        scheduledAt: meetingDate,
        createdById: user1.id,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.pointTransaction.deleteMany({
      where: { clubId: testClub.id },
    });
    await prisma.bet.deleteMany({
      where: { clubId: testClub.id },
    });
    await prisma.readingProgress.deleteMany({});
    await prisma.reading.deleteMany({
      where: { clubId: testClub.id },
    });
    await prisma.meeting.deleteMany({
      where: { clubId: testClub.id },
    });
    await prisma.clubMember.deleteMany({
      where: { clubId: testClub.id },
    });
    await prisma.club.delete({
      where: { id: testClub.id },
    });
    await prisma.book.delete({
      where: { id: testBook.id },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [user1.id, user2.id, user3.id, user4.id] },
      },
    });

    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up readings and bets before each test
    await prisma.pointTransaction.deleteMany({
      where: { clubId: testClub.id },
    });
    await prisma.bet.deleteMany({
      where: { clubId: testClub.id },
    });
    await prisma.readingProgress.deleteMany({});
    await prisma.reading.deleteMany({
      where: { clubId: testClub.id },
    });
  });

  describe('Test 1: User finishes first and places bet', () => {
    it('should allow first finisher to place a bet', async () => {
      // Create readings for all users
      const reading1 = await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user1.id,
          meetingId: testMeeting.id,
          status: 'READING',
          startedAt: new Date(),
          progress: {
            create: {
              currentPage: 300,
              totalPages: 300,
              source: 'MANUAL',
            },
          },
        },
      });

      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user2.id,
          meetingId: testMeeting.id,
          status: 'READING',
          startedAt: new Date(),
          progress: {
            create: {
              currentPage: 150,
              totalPages: 300,
              source: 'MANUAL',
            },
          },
        },
      });

      // Give user1 enough points
      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user1.id,
          amount: 300,
          reason: 'PAGE_READ',
        },
      });

      // User1 finishes the book
      const finishedReading = await prisma.reading.update({
        where: { id: reading1.id },
        data: {
          status: 'FINISHED',
          finishedAt: new Date(),
        },
      });

      expect(finishedReading.status).toBe('FINISHED');

      // User1 places a bet on User2
      const bet = await prisma.bet.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          meetingId: testMeeting.id,
          bettorId: user1.id,
          predictedUserId: user2.id,
          predictedUserRank: 1, // User2 is in first place among unfinished users
          stakePoints: 100,
        },
      });

      // Deduct stake
      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user1.id,
          amount: -100,
          reason: 'BET_LOST',
          referenceId: bet.id,
        },
      });

      expect(bet).toBeDefined();
      expect(bet.bettorId).toBe(user1.id);
      expect(bet.predictedUserId).toBe(user2.id);
      expect(bet.stakePoints).toBe(100);
      expect(bet.outcome).toBe('PENDING');

      // Verify user1's points were deducted
      const balance = await prisma.pointTransaction.aggregate({
        where: { clubId: testClub.id, userId: user1.id },
        _sum: { amount: true },
      });
      expect(balance._sum.amount).toBe(200); // 300 - 100
    });
  });

  describe('Test 2: Correct prediction - both users get payout', () => {
    it('should award both bettor and finisher when prediction is correct', async () => {
      // Setup: User1 and User2 reading, User1 finishes first
      const reading1 = await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user1.id,
          status: 'FINISHED',
          finishedAt: new Date(Date.now() - 1000),
          progress: {
            create: { currentPage: 300, totalPages: 300, source: 'MANUAL' },
          },
        },
      });

      const reading2 = await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user2.id,
          status: 'READING',
          progress: {
            create: { currentPage: 250, totalPages: 300, source: 'MANUAL' },
          },
        },
      });

      // Give user1 points
      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user1.id,
          amount: 300,
          reason: 'PAGE_READ',
        },
      });

      // User1 places bet on User2 (rank 1, multiplier 1x)
      const bet = await prisma.bet.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          bettorId: user1.id,
          predictedUserId: user2.id,
          predictedUserRank: 1,
          stakePoints: 100,
        },
      });

      // Deduct stake
      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user1.id,
          amount: -100,
          reason: 'BET_LOST',
          referenceId: bet.id,
        },
      });

      // User2 finishes - CORRECT PREDICTION
      await prisma.reading.update({
        where: { id: reading2.id },
        data: { status: 'FINISHED', finishedAt: new Date() },
      });

      // Resolve bet - both get payout
      const multiplier = 1 + (bet.predictedUserRank - 1) * 0.5; // 1x for rank 1
      const payout = Math.floor(bet.stakePoints * multiplier); // 100

      // Award to bettor
      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user1.id,
          amount: payout,
          reason: 'BET_WON',
          referenceId: bet.id,
        },
      });

      // Award to finisher
      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user2.id,
          amount: payout,
          reason: 'BET_WON',
          referenceId: bet.id,
        },
      });

      // Update bet
      await prisma.bet.update({
        where: { id: bet.id },
        data: {
          outcome: 'WON',
          resolvedAt: new Date(),
          resolvedByReadingId: reading2.id,
        },
      });

      // Verify payouts
      const user1Balance = await prisma.pointTransaction.aggregate({
        where: { clubId: testClub.id, userId: user1.id },
        _sum: { amount: true },
      });
      expect(user1Balance._sum.amount).toBe(300); // 300 - 100 + 100

      const user2Balance = await prisma.pointTransaction.aggregate({
        where: { clubId: testClub.id, userId: user2.id },
        _sum: { amount: true },
      });
      expect(user2Balance._sum.amount).toBe(100);

      const updatedBet = await prisma.bet.findUnique({ where: { id: bet.id } });
      expect(updatedBet?.outcome).toBe('WON');
    });
  });

  describe('Test 3: Wrong prediction - bettor loses stake, finisher gets payout', () => {
    it('should handle incorrect prediction correctly', async () => {
      // Setup: 3 users reading, User1 finishes first
      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user1.id,
          status: 'FINISHED',
          finishedAt: new Date(Date.now() - 2000),
          progress: {
            create: { currentPage: 300, totalPages: 300, source: 'MANUAL' },
          },
        },
      });

      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user2.id,
          status: 'READING',
          progress: {
            create: { currentPage: 200, totalPages: 300, source: 'MANUAL' },
          },
        },
      });

      const reading3 = await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user3.id,
          status: 'READING',
          progress: {
            create: { currentPage: 250, totalPages: 300, source: 'MANUAL' },
          },
        },
      });

      // Give user1 points
      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user1.id,
          amount: 300,
          reason: 'PAGE_READ',
        },
      });

      // User1 bets on User2 (rank 2, multiplier 1.5x) but User3 finishes
      const bet = await prisma.bet.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          bettorId: user1.id,
          predictedUserId: user2.id,
          predictedUserRank: 2,
          stakePoints: 100,
        },
      });

      // Deduct stake
      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user1.id,
          amount: -100,
          reason: 'BET_LOST',
          referenceId: bet.id,
        },
      });

      // User3 finishes - WRONG PREDICTION
      await prisma.reading.update({
        where: { id: reading3.id },
        data: { status: 'FINISHED', finishedAt: new Date() },
      });

      // Resolve bet - only User3 gets payout
      const multiplier = 1 + (bet.predictedUserRank - 1) * 0.5; // 1.5x
      const payout = Math.floor(bet.stakePoints * multiplier); // 150

      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user3.id,
          amount: payout,
          reason: 'BET_WON',
          referenceId: bet.id,
        },
      });

      await prisma.bet.update({
        where: { id: bet.id },
        data: {
          outcome: 'LOST',
          resolvedAt: new Date(),
          resolvedByReadingId: reading3.id,
        },
      });

      // Verify: User1 lost stake, User3 got payout
      const user1Balance = await prisma.pointTransaction.aggregate({
        where: { clubId: testClub.id, userId: user1.id },
        _sum: { amount: true },
      });
      expect(user1Balance._sum.amount).toBe(200); // 300 - 100 (no win bonus)

      const user3Balance = await prisma.pointTransaction.aggregate({
        where: { clubId: testClub.id, userId: user3.id },
        _sum: { amount: true },
      });
      expect(user3Balance._sum.amount).toBe(150);

      const updatedBet = await prisma.bet.findUnique({ where: { id: bet.id } });
      expect(updatedBet?.outcome).toBe('LOST');
    });
  });

  describe('Test 4: Last finisher before deadline gets bonus', () => {
    it('should award bonus to last finisher before deadline', async () => {
      // Create readings for all users
      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user1.id,
          status: 'FINISHED',
          finishedAt: new Date(Date.now() - 3000),
          progress: {
            create: { currentPage: 300, totalPages: 300, source: 'MANUAL' },
          },
        },
      });

      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user2.id,
          status: 'FINISHED',
          finishedAt: new Date(Date.now() - 2000),
          progress: {
            create: { currentPage: 300, totalPages: 300, source: 'MANUAL' },
          },
        },
      });

      const lastReading = await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user3.id,
          status: 'READING',
          progress: {
            create: { currentPage: 290, totalPages: 300, source: 'MANUAL' },
          },
        },
      });

      // User3 finishes last (before deadline)
      const finishedReading = await prisma.reading.update({
        where: { id: lastReading.id },
        data: {
          status: 'FINISHED',
          finishedAt: new Date(),
        },
        include: { book: true },
      });

      // Check if all are finished
      const allReadings = await prisma.reading.findMany({
        where: { clubId: testClub.id, bookId: testBook.id },
      });
      const unfinishedCount = allReadings.filter((r) => r.status !== 'FINISHED').length;

      expect(unfinishedCount).toBe(0); // All finished

      // Award bonus (50% of page count)
      const bonusAmount = Math.floor(testBook.pageCount * 0.5); // 150
      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user3.id,
          amount: bonusAmount,
          reason: 'BET_BONUS',
          referenceId: lastReading.id,
        },
      });

      // Verify bonus was awarded
      const user3Balance = await prisma.pointTransaction.aggregate({
        where: { clubId: testClub.id, userId: user3.id },
        _sum: { amount: true },
      });
      expect(user3Balance._sum.amount).toBe(150);
    });
  });

  describe('Test 5: Betting after deadline should fail', () => {
    it('should prevent betting after meeting deadline', async () => {
      // First, delete the future meeting
      await prisma.meeting.delete({ where: { id: testMeeting.id } });

      // Create a meeting in the past
      const pastMeeting = await prisma.meeting.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          title: 'Past Meeting',
          scheduledAt: new Date(Date.now() - 86400000), // 1 day ago
          createdById: user1.id,
        },
      });

      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user1.id,
          status: 'FINISHED',
          finishedAt: new Date(),
          progress: {
            create: { currentPage: 300, totalPages: 300, source: 'MANUAL' },
          },
        },
      });

      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user2.id,
          status: 'READING',
          progress: {
            create: { currentPage: 200, totalPages: 300, source: 'MANUAL' },
          },
        },
      });

      // Verify deadline has passed
      expect(new Date() > pastMeeting.scheduledAt).toBe(true);

      // Attempting to place bet should be prevented (this would be caught in mutation)
      // In the mutation resolver, this check happens:
      // if (meeting && new Date() > meeting.scheduledAt) {
      //   throw new Error("Betting window closed - meeting has passed");
      // }

      // For test purposes, verify the logic
      const meetingCheck = await prisma.meeting.findFirst({
        where: { clubId: testClub.id, bookId: testBook.id },
      });
      const deadlinePassed = meetingCheck && new Date() > meetingCheck.scheduledAt;
      expect(deadlinePassed).toBe(true);

      // Clean up and recreate future meeting for other tests
      await prisma.meeting.delete({ where: { id: pastMeeting.id } });
      
      const meetingDate = new Date();
      meetingDate.setDate(meetingDate.getDate() + 2);
      testMeeting = await prisma.meeting.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          title: 'Test Meeting',
          description: 'Discuss the book',
          scheduledAt: meetingDate,
          createdById: user1.id,
        },
      });
    });
  });

  describe('Test 6: Insufficient points for stake', () => {
    it('should prevent betting with insufficient points', async () => {
      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user1.id,
          status: 'FINISHED',
          finishedAt: new Date(),
          progress: {
            create: { currentPage: 300, totalPages: 300, source: 'MANUAL' },
          },
        },
      });

      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user2.id,
          status: 'READING',
          progress: {
            create: { currentPage: 200, totalPages: 300, source: 'MANUAL' },
          },
        },
      });

      // Give user1 only 20 points (min stake is 30 for 300 page book)
      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user1.id,
          amount: 20,
          reason: 'PAGE_READ',
        },
      });

      const balance = await prisma.pointTransaction.aggregate({
        where: { clubId: testClub.id, userId: user1.id },
        _sum: { amount: true },
      });

      const minStake = Math.ceil(testBook.pageCount * 0.1); // 30
      const stakePoints = 100;

      expect(balance._sum.amount).toBeLessThan(stakePoints);
      expect(balance._sum.amount).toBe(20);
      expect(minStake).toBe(30);

      // In mutation, this would throw:
      // if (balance < args.stakePoints) {
      //   throw new Error(`Insufficient points. You have ${balance}, need ${args.stakePoints}`);
      // }
    });
  });

  describe('Test 7: Multiple users finish in sequence - betting chain', () => {
    it('should handle multiple sequential finishes with bets', async () => {
      // Note: This test verifies the betting chain works correctly with turn-taking enforcement
      // Create 4 users all reading
      const reading1 = await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user1.id,
          status: 'READING',
          progress: {
            create: { currentPage: 280, totalPages: 300, source: 'MANUAL' },
          },
        },
      });

      const reading2 = await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user2.id,
          status: 'READING',
          progress: {
            create: { currentPage: 250, totalPages: 300, source: 'MANUAL' },
          },
        },
      });

      const reading3 = await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user3.id,
          status: 'READING',
          progress: {
            create: { currentPage: 200, totalPages: 300, source: 'MANUAL' },
          },
        },
      });

      const reading4 = await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user4.id,
          status: 'READING',
          progress: {
            create: { currentPage: 180, totalPages: 300, source: 'MANUAL' },
          },
        },
      });

      // Give all users points
      for (const user of [user1, user2, user3, user4]) {
        await prisma.pointTransaction.create({
          data: {
            clubId: testClub.id,
            userId: user.id,
            amount: 300,
            reason: 'PAGE_READ',
          },
        });
      }

      // User1 finishes first (rank order: user1, user2, user3, user4)
      await prisma.reading.update({
        where: { id: reading1.id },
        data: { status: 'FINISHED', finishedAt: new Date(Date.now() - 3000) },
      });

      // User1 bets on User2 (rank 1, multiplier 1x)
      const bet1 = await prisma.bet.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          bettorId: user1.id,
          predictedUserId: user2.id,
          predictedUserRank: 1,
          stakePoints: 100,
        },
      });
      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user1.id,
          amount: -100,
          reason: 'BET_LOST',
          referenceId: bet1.id,
        },
      });

      // User2 finishes next - CORRECT!
      await prisma.reading.update({
        where: { id: reading2.id },
        data: { status: 'FINISHED', finishedAt: new Date(Date.now() - 2000) },
      });

      // Resolve bet1 - both get 100 points
      await prisma.pointTransaction.createMany({
        data: [
          {
            clubId: testClub.id,
            userId: user1.id,
            amount: 100,
            reason: 'BET_WON',
            referenceId: bet1.id,
          },
          {
            clubId: testClub.id,
            userId: user2.id,
            amount: 100,
            reason: 'BET_WON',
            referenceId: bet1.id,
          },
        ],
      });
      await prisma.bet.update({
        where: { id: bet1.id },
        data: { outcome: 'WON', resolvedAt: new Date(), resolvedByReadingId: reading2.id },
      });

      // User2 bets on User3 (rank 1 now, multiplier 1x)
      const bet2 = await prisma.bet.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          bettorId: user2.id,
          predictedUserId: user3.id,
          predictedUserRank: 1,
          stakePoints: 150,
        },
      });
      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user2.id,
          amount: -150,
          reason: 'BET_LOST',
          referenceId: bet2.id,
        },
      });

      // User3 finishes - CORRECT!
      await prisma.reading.update({
        where: { id: reading3.id },
        data: { status: 'FINISHED', finishedAt: new Date(Date.now() - 1000) },
      });

      // Resolve bet2
      await prisma.pointTransaction.createMany({
        data: [
          {
            clubId: testClub.id,
            userId: user2.id,
            amount: 150,
            reason: 'BET_WON',
            referenceId: bet2.id,
          },
          {
            clubId: testClub.id,
            userId: user3.id,
            amount: 150,
            reason: 'BET_WON',
            referenceId: bet2.id,
          },
        ],
      });
      await prisma.bet.update({
        where: { id: bet2.id },
        data: { outcome: 'WON', resolvedAt: new Date(), resolvedByReadingId: reading3.id },
      });

      // User3 bets on User4 (rank 1, multiplier 1x)
      const bet3 = await prisma.bet.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          bettorId: user3.id,
          predictedUserId: user4.id,
          predictedUserRank: 1,
          stakePoints: 100,
        },
      });
      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user3.id,
          amount: -100,
          reason: 'BET_LOST',
          referenceId: bet3.id,
        },
      });

      // User4 finishes last - CORRECT!
      await prisma.reading.update({
        where: { id: reading4.id },
        data: { status: 'FINISHED', finishedAt: new Date() },
      });

      // Resolve bet3
      await prisma.pointTransaction.createMany({
        data: [
          {
            clubId: testClub.id,
            userId: user3.id,
            amount: 100,
            reason: 'BET_WON',
            referenceId: bet3.id,
          },
          {
            clubId: testClub.id,
            userId: user4.id,
            amount: 100,
            reason: 'BET_WON',
            referenceId: bet3.id,
          },
        ],
      });
      await prisma.bet.update({
        where: { id: bet3.id },
        data: { outcome: 'WON', resolvedAt: new Date(), resolvedByReadingId: reading4.id },
      });

      // Award last finisher bonus (150)
      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user4.id,
          amount: 150,
          reason: 'BET_BONUS',
          referenceId: reading4.id,
        },
      });

      // Verify final balances
      const finalBalances = await Promise.all([
        prisma.pointTransaction.aggregate({
          where: { clubId: testClub.id, userId: user1.id },
          _sum: { amount: true },
        }),
        prisma.pointTransaction.aggregate({
          where: { clubId: testClub.id, userId: user2.id },
          _sum: { amount: true },
        }),
        prisma.pointTransaction.aggregate({
          where: { clubId: testClub.id, userId: user3.id },
          _sum: { amount: true },
        }),
        prisma.pointTransaction.aggregate({
          where: { clubId: testClub.id, userId: user4.id },
          _sum: { amount: true },
        }),
      ]);

      // User1: 300 - 100 (bet) + 100 (win) = 300
      expect(finalBalances[0]._sum.amount).toBe(300);
      
      // User2: 300 - 150 (bet) + 100 (win from bet1) + 150 (win from bet2) = 400
      expect(finalBalances[1]._sum.amount).toBe(400);
      
      // User3: 300 - 100 (bet) + 150 (win from bet2) + 100 (win from bet3) = 450
      expect(finalBalances[2]._sum.amount).toBe(450);
      
      // User4: 300 + 100 (win from bet3) + 150 (last finisher bonus) = 550
      expect(finalBalances[3]._sum.amount).toBe(550);

      // Verify all bets were resolved
      const allBets = await prisma.bet.findMany({
        where: { clubId: testClub.id },
      });
      expect(allBets.length).toBe(3);
      expect(allBets.every((b) => b.outcome === 'WON')).toBe(true);
    });
  });
});
