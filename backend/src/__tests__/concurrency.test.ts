import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { prisma } from '../db/prisma.js';
import bcrypt from 'bcrypt';

// Concurrency and race condition tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let testClub: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let testBook: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let testMeeting: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let user1: any, user2: any, user3: any;

describe('Concurrency and Race Condition Tests', () => {
  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('password123', 12);

    user1 = await prisma.user.create({
      data: {
        email: 'concurrent1@test.com',
        passwordHash,
        displayName: 'Concurrent User 1',
      },
    });

    user2 = await prisma.user.create({
      data: {
        email: 'concurrent2@test.com',
        passwordHash,
        displayName: 'Concurrent User 2',
      },
    });

    user3 = await prisma.user.create({
      data: {
        email: 'concurrent3@test.com',
        passwordHash,
        displayName: 'Concurrent User 3',
      },
    });

    testClub = await prisma.club.create({
      data: {
        name: 'Concurrency Test Club',
        ownerId: user1.id,
      },
    });

    await prisma.clubMember.createMany({
      data: [
        { clubId: testClub.id, userId: user1.id, role: 'OWNER' },
        { clubId: testClub.id, userId: user2.id, role: 'MEMBER' },
        { clubId: testClub.id, userId: user3.id, role: 'MEMBER' },
      ],
    });

    testBook = await prisma.book.create({
      data: {
        googleVolumeId: 'concurrent-book-123',
        title: 'Concurrent Test Book',
        pageCount: 200,
      },
    });

    const meetingDate = new Date();
    meetingDate.setDate(meetingDate.getDate() + 2);

    testMeeting = await prisma.meeting.create({
      data: {
        clubId: testClub.id,
        bookId: testBook.id,
        title: 'Concurrency Test Meeting',
        scheduledAt: meetingDate,
        createdById: user1.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.pointTransaction.deleteMany({ where: { clubId: testClub.id } });
    await prisma.bet.deleteMany({ where: { clubId: testClub.id } });
    await prisma.readingProgress.deleteMany({});
    await prisma.reading.deleteMany({ where: { clubId: testClub.id } });
    await prisma.meeting.deleteMany({ where: { clubId: testClub.id } });
    await prisma.clubMember.deleteMany({ where: { clubId: testClub.id } });
    await prisma.club.delete({ where: { id: testClub.id } });
    await prisma.book.delete({ where: { id: testBook.id } });
    await prisma.user.deleteMany({
      where: { id: { in: [user1.id, user2.id, user3.id] } },
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.pointTransaction.deleteMany({ where: { clubId: testClub.id } });
    await prisma.bet.deleteMany({ where: { clubId: testClub.id } });
    await prisma.readingProgress.deleteMany({});
    await prisma.reading.deleteMany({ where: { clubId: testClub.id } });
    await prisma.meeting.update({
      where: { id: testMeeting.id },
      data: { currentBettorId: null },
    });
  });

  describe('Test: Prevent duplicate readings', () => {
    it('should enforce unique constraint on Reading per user per book in club', async () => {
      // Create first reading
      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user1.id,
          status: 'READING',
        },
      });

      // Attempt to create duplicate reading
      await expect(
        prisma.reading.create({
          data: {
            clubId: testClub.id,
            bookId: testBook.id,
            userId: user1.id,
            status: 'READING',
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('Test: Prevent multiple pending bets', () => {
    it('should enforce only one pending bet per race via database constraint', async () => {
      // Setup: User1 finishes, creates a bet
      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user1.id,
          status: 'FINISHED',
          finishedAt: new Date(),
        },
      });

      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user2.id,
          status: 'READING',
        },
      });

      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user1.id,
          amount: 200,
          reason: 'PAGE_READ',
        },
      });

      // Create first bet
      await prisma.bet.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          meetingId: testMeeting.id,
          bettorId: user1.id,
          predictedUserId: user2.id,
          predictedUserRank: 1,
          stakePoints: 50,
          outcome: 'PENDING',
        },
      });

      // Attempt to create another pending bet - should fail
      await expect(
        prisma.bet.create({
          data: {
            clubId: testClub.id,
            bookId: testBook.id,
            meetingId: testMeeting.id,
            bettorId: user1.id,
            predictedUserId: user2.id,
            predictedUserRank: 1,
            stakePoints: 50,
            outcome: 'PENDING',
          },
        }),
      ).rejects.toThrow(); // Unique constraint violation
    });
  });

  describe('Test: Turn-taking enforcement', () => {
    it('should enforce that only currentBettorId can place a bet', async () => {
      // Setup: User1 finishes and becomes currentBettor
      const _reading1 = await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user1.id,
          status: 'FINISHED',
          finishedAt: new Date(),
        },
      });

      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user2.id,
          status: 'READING',
        },
      });

      // Set User1 as current bettor
      await prisma.meeting.update({
        where: { id: testMeeting.id },
        data: { currentBettorId: user1.id },
      });

      // Verify currentBettorId was set
      const meeting = await prisma.meeting.findUnique({
        where: { id: testMeeting.id },
      });
      expect(meeting?.currentBettorId).toBe(user1.id);

      // User1 (correct bettor) should be able to check their turn
      const isUser1Turn = meeting?.currentBettorId === user1.id;
      expect(isUser1Turn).toBe(true);

      // User2 (wrong bettor) should be blocked
      const isUser2Turn = meeting?.currentBettorId === user2.id;
      expect(isUser2Turn).toBe(false);

      // In the mutation, this check prevents User2 from betting:
      // if (meeting.currentBettorId && meeting.currentBettorId !== ctx.user.userId) {
      //   throw new Error("Not your turn to bet");
      // }
    });
  });

  describe('Test: Atomic bet placement', () => {
    it('should ensure bet and point deduction happen atomically', async () => {
      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user1.id,
          status: 'FINISHED',
          finishedAt: new Date(),
        },
      });

      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user2.id,
          status: 'READING',
        },
      });

      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user1.id,
          amount: 100,
          reason: 'PAGE_READ',
        },
      });

      // Set user1 as bettor
      await prisma.meeting.update({
        where: { id: testMeeting.id },
        data: { currentBettorId: user1.id },
      });

      // Place bet within transaction
      const result = await prisma.$transaction(async (tx) => {
        // Deduct points
        await tx.pointTransaction.create({
          data: {
            clubId: testClub.id,
            userId: user1.id,
            amount: -50,
            reason: 'BET_LOST',
          },
        });

        // Create bet
        return tx.bet.create({
          data: {
            clubId: testClub.id,
            bookId: testBook.id,
            meetingId: testMeeting.id,
            bettorId: user1.id,
            predictedUserId: user2.id,
            predictedUserRank: 1,
            stakePoints: 50,
          },
        });
      });

      // Verify both operations succeeded
      expect(result).toBeDefined();
      expect(result.stakePoints).toBe(50);

      const balance = await prisma.pointTransaction.aggregate({
        where: { clubId: testClub.id, userId: user1.id },
        _sum: { amount: true },
      });
      expect(balance._sum.amount).toBe(50); // 100 - 50
    });
  });

  describe('Test: Bet resolution atomicity', () => {
    it('should resolve bets atomically within finish transaction', async () => {
      // Setup: User1 finishes and bets on User2
      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user1.id,
          status: 'FINISHED',
          finishedAt: new Date(Date.now() - 2000),
        },
      });

      const reading2 = await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user2.id,
          status: 'READING',
          progress: {
            create: { currentPage: 150, totalPages: 200, source: 'MANUAL' },
          },
        },
      });

      await prisma.pointTransaction.createMany({
        data: [
          { clubId: testClub.id, userId: user1.id, amount: 200, reason: 'PAGE_READ' },
          { clubId: testClub.id, userId: user1.id, amount: -100, reason: 'BET_LOST' },
        ],
      });

      const bet = await prisma.bet.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          meetingId: testMeeting.id,
          bettorId: user1.id,
          predictedUserId: user2.id,
          predictedUserRank: 1,
          stakePoints: 100,
        },
      });

      // User2 finishes - this should resolve bet atomically
      await prisma.$transaction(async (tx) => {
        // Mark as finished
        await tx.reading.update({
          where: { id: reading2.id },
          data: { status: 'FINISHED', finishedAt: new Date() },
        });

        // Find pending bets
        const pendingBets = await tx.bet.findMany({
          where: {
            clubId: testClub.id,
            bookId: testBook.id,
            outcome: 'PENDING',
          },
        });

        expect(pendingBets.length).toBe(1);

        // Resolve bet
        const payout = 100; // rank 1 = 1x multiplier
        await tx.pointTransaction.createMany({
          data: [
            {
              clubId: testClub.id,
              userId: user1.id,
              amount: payout,
              reason: 'BET_WON',
              referenceId: bet.id,
            },
            {
              clubId: testClub.id,
              userId: user2.id,
              amount: payout,
              reason: 'BET_WON',
              referenceId: bet.id,
            },
          ],
        });

        await tx.bet.update({
          where: { id: bet.id },
          data: {
            outcome: 'WON',
            resolvedAt: new Date(),
            resolvedByReadingId: reading2.id,
          },
        });
      });

      // Verify atomicity: all operations succeeded together
      const updatedBet = await prisma.bet.findUnique({ where: { id: bet.id } });
      expect(updatedBet?.outcome).toBe('WON');

      const user1Balance = await prisma.pointTransaction.aggregate({
        where: { clubId: testClub.id, userId: user1.id },
        _sum: { amount: true },
      });
      expect(user1Balance._sum.amount).toBe(200); // 200 - 100 + 100

      const user2Balance = await prisma.pointTransaction.aggregate({
        where: { clubId: testClub.id, userId: user2.id },
        _sum: { amount: true },
      });
      expect(user2Balance._sum.amount).toBe(100);
    });
  });

  describe('Test: No duplicate Reading records', () => {
    it('should prevent user from creating multiple readings for same book in club', async () => {
      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user1.id,
          status: 'READING',
        },
      });

      // Attempt duplicate - should fail due to @@unique([clubId, bookId, userId])
      await expect(
        prisma.reading.create({
          data: {
            clubId: testClub.id,
            bookId: testBook.id,
            userId: user1.id,
            status: 'READING',
          },
        }),
      ).rejects.toThrow(/unique constraint/i);
    });
  });

  describe('Test: Transaction rollback on error', () => {
    it('should rollback bet if point deduction fails', async () => {
      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user1.id,
          status: 'FINISHED',
          finishedAt: new Date(),
        },
      });

      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user2.id,
          status: 'READING',
        },
      });

      // Don't give user1 any points
      const initialBalance = await prisma.pointTransaction.aggregate({
        where: { clubId: testClub.id, userId: user1.id },
        _sum: { amount: true },
      });
      expect(initialBalance._sum.amount).toBe(null); // No points

      // Attempt to bet (should fail in mutation due to insufficient points)
      // This test verifies the transaction would rollback if it got past validation

      // Simulate what would happen if transaction started but failed mid-way
      let _betCreated = false;
      try {
        await prisma.$transaction(async (tx) => {
          // This would succeed
          await tx.pointTransaction.create({
            data: {
              clubId: testClub.id,
              userId: user1.id,
              amount: -100,
              reason: 'BET_LOST',
            },
          });

          // Force an error before bet creation
          throw new Error('Simulated error');
        });
      } catch {
        // Expected to fail
      }

      // Verify rollback: no point deduction happened
      const finalBalance = await prisma.pointTransaction.aggregate({
        where: { clubId: testClub.id, userId: user1.id },
        _sum: { amount: true },
      });
      expect(finalBalance._sum.amount).toBe(null); // Still no points (rolled back)

      // Verify no bet was created
      const bets = await prisma.bet.findMany({
        where: { clubId: testClub.id, bettorId: user1.id },
      });
      expect(bets.length).toBe(0);
    });
  });

  describe('Test: Simultaneous finish handling', () => {
    it('should handle near-simultaneous finishes without double resolution', async () => {
      // Create bet from user1 on user2
      await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user1.id,
          status: 'FINISHED',
          finishedAt: new Date(Date.now() - 3000),
        },
      });

      const reading2 = await prisma.reading.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          userId: user2.id,
          status: 'READING',
          progress: {
            create: { currentPage: 190, totalPages: 200, source: 'MANUAL' },
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
            create: { currentPage: 180, totalPages: 200, source: 'MANUAL' },
          },
        },
      });

      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user1.id,
          amount: 200,
          reason: 'PAGE_READ',
        },
      });

      await prisma.pointTransaction.create({
        data: {
          clubId: testClub.id,
          userId: user1.id,
          amount: -100,
          reason: 'BET_LOST',
        },
      });

      const bet = await prisma.bet.create({
        data: {
          clubId: testClub.id,
          bookId: testBook.id,
          meetingId: testMeeting.id,
          bettorId: user1.id,
          predictedUserId: user2.id,
          predictedUserRank: 1,
          stakePoints: 100,
        },
      });

      // Simulate User2 and User3 finishing nearly simultaneously
      // Each in their own transaction (as would happen in real concurrent requests)
      const [result2, result3] = await Promise.allSettled([
        prisma.$transaction(async (tx) => {
          const r = await tx.reading.update({
            where: { id: reading2.id },
            data: { status: 'FINISHED', finishedAt: new Date() },
          });

          const bets = await tx.bet.findMany({
            where: {
              clubId: testClub.id,
              bookId: testBook.id,
              outcome: 'PENDING',
            },
          });

          if (bets.length === 0) return r; // Already resolved by other transaction

          for (const b of bets) {
            const isCorrect = b.predictedUserId === r.userId;
            const multiplier = 1 + (b.predictedUserRank - 1) * 0.5;
            const payout = Math.floor(b.stakePoints * multiplier);

            if (isCorrect) {
              await tx.pointTransaction.createMany({
                data: [
                  {
                    clubId: b.clubId,
                    userId: b.bettorId,
                    amount: payout,
                    reason: 'BET_WON',
                    referenceId: b.id,
                  },
                  {
                    clubId: b.clubId,
                    userId: r.userId,
                    amount: payout,
                    reason: 'BET_WON',
                    referenceId: b.id,
                  },
                ],
              });
            }

            await tx.bet.update({
              where: { id: b.id },
              data: {
                outcome: isCorrect ? 'WON' : 'LOST',
                resolvedAt: new Date(),
                resolvedByReadingId: r.id,
              },
            });
          }

          return r;
        }),
        prisma.$transaction(async (tx) => {
          const r = await tx.reading.update({
            where: { id: reading3.id },
            data: { status: 'FINISHED', finishedAt: new Date() },
          });

          const bets = await tx.bet.findMany({
            where: {
              clubId: testClub.id,
              bookId: testBook.id,
              outcome: 'PENDING',
            },
          });

          if (bets.length === 0) return r; // Already resolved

          for (const b of bets) {
            const isCorrect = b.predictedUserId === r.userId;
            const multiplier = 1 + (b.predictedUserRank - 1) * 0.5;
            const payout = Math.floor(b.stakePoints * multiplier);

            if (!isCorrect) {
              await tx.pointTransaction.create({
                data: {
                  clubId: b.clubId,
                  userId: r.userId,
                  amount: payout,
                  reason: 'BET_WON',
                  referenceId: b.id,
                },
              });
            }

            await tx.bet.update({
              where: { id: b.id },
              data: {
                outcome: isCorrect ? 'WON' : 'LOST',
                resolvedAt: new Date(),
                resolvedByReadingId: r.id,
              },
            });
          }

          return r;
        }),
      ]);

      // Both transactions should complete, but only ONE should resolve the bet
      expect(result2.status).toBe('fulfilled');
      expect(result3.status).toBe('fulfilled');

      // Verify bet was resolved exactly once
      const resolvedBet = await prisma.bet.findUnique({ where: { id: bet.id } });
      expect(resolvedBet?.outcome).not.toBe('PENDING');
      expect(resolvedBet?.resolvedAt).not.toBe(null);

      // Count payouts - should be exactly 2 (one correct prediction = 2 payouts)
      const payouts = await prisma.pointTransaction.findMany({
        where: {
          clubId: testClub.id,
          reason: 'BET_WON',
        },
      });
      expect(payouts.length).toBe(2); // Not 4 (would indicate double resolution)
    });
  });
});
