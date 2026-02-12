# Betting System Tests

This directory contains comprehensive tests for the book club betting system.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- betting.test.ts
```

## Test Coverage

### betting.test.ts

Comprehensive tests for the betting system functionality:

#### Test 1: User finishes first and places bet
- **Purpose**: Verify that a user who finishes reading can successfully place a bet
- **Validates**:
  - User can finish a book
  - Points are properly tracked (300 initial points)
  - User can place a bet on another reader
  - Stake is deducted from user's balance (100 points)
  - Bet is created with PENDING status

#### Test 2: Correct prediction - both users get payout
- **Purpose**: Verify payout when prediction is correct
- **Validates**:
  - Rank multiplier calculation (rank 1 = 1x multiplier)
  - Both bettor and finisher receive payout
  - User1: 300 - 100 (stake) + 100 (win) = 300 points
  - User2: 0 + 100 (win) = 100 points
  - Bet outcome updated to WON
  - Bet resolution timestamp recorded

#### Test 3: Wrong prediction - bettor loses stake, finisher gets payout
- **Purpose**: Verify payout when prediction is incorrect
- **Validates**:
  - Rank multiplier with rank 2 (1.5x multiplier)
  - Bettor loses their stake (not refunded)
  - Wrong finisher receives payout: 100 × 1.5 = 150 points
  - User1: 300 - 100 = 200 points (stake lost)
  - User3: 0 + 150 = 150 points (payout)
  - Bet outcome updated to LOST

#### Test 4: Last finisher before deadline gets bonus
- **Purpose**: Verify bonus awarded to last person to finish
- **Validates**:
  - System detects when all users have finished
  - Last finisher receives 50% of page count as bonus
  - Bonus awarded only if finished before meeting deadline
  - 300-page book → 150-point bonus
  - Transaction recorded with BET_BONUS reason

#### Test 5: Betting after deadline should fail
- **Purpose**: Verify betting window closes after meeting deadline
- **Validates**:
  - Meeting deadline is correctly checked
  - Past meetings prevent new bets
  - Deadline logic: `new Date() > meeting.scheduledAt`
  - Proper error handling in mutation resolver

#### Test 6: Insufficient points for stake
- **Purpose**: Verify validation of user's point balance
- **Validates**:
  - User cannot bet more points than they have
  - Minimum stake calculation (10% of page count = 30 points)
  - Maximum stake calculation (100% of page count = 300 points)
  - User with only 20 points cannot place 100-point bet
  - Proper error message about insufficient funds

#### Test 7: Multiple users finish in sequence - betting chain
- **Purpose**: Verify complex scenario with multiple sequential bets
- **Scenario**:
  1. All 4 users start reading (given 300 points each)
  2. User1 finishes first, bets 100 on User2
  3. User2 finishes next (CORRECT) - both get 100
  4. User2 bets 150 on User3
  5. User3 finishes next (CORRECT) - both get 150
  6. User3 bets 100 on User4
  7. User4 finishes last (CORRECT) - both get 100 + User4 gets 150 bonus

- **Final Balances**:
  - User1: 300 - 100 + 100 = **300 points**
  - User2: 300 - 150 + 100 + 150 = **400 points**
  - User3: 300 - 100 + 150 + 100 = **450 points**
  - User4: 300 + 100 + 150 = **550 points**

- **Validates**:
  - Multiple bets can be placed and resolved
  - Betting chain works correctly
  - Point calculations compound properly
  - Last finisher bonus is applied
  - All bets resolved with WON status

## Betting System Rules (Summary)

### Rank Multipliers
- 1st place: 1.0x
- 2nd place: 1.5x
- 3rd place: 2.0x
- 4th place: 2.5x
- Formula: `1 + (rank - 1) × 0.5`

### Stake Limits
- Minimum: 10% of page count (e.g., 30 for 300-page book)
- Maximum: 100% of page count (e.g., 300 for 300-page book)

### Payouts
- **Correct prediction**: Both bettor AND finisher get `stake × multiplier`
- **Wrong prediction**: Bettor loses stake, actual finisher gets `stake × multiplier`
- **Last finisher bonus**: Additional 50% of page count if finished before deadline

## Test Data Setup

Each test creates:
- 4 test users (user1, user2, user3, user4)
- 1 test club (all users are members)
- 1 test book (300 pages)
- 1 test meeting (scheduled 2 days in future)

Data is cleaned up before each test and after all tests complete.

## Database Interactions

Tests directly interact with Prisma client to:
- Create and manipulate test data
- Verify database state changes
- Test business logic implementation
- Ensure data integrity

This provides confidence that the actual database operations work correctly, not just the API layer.
