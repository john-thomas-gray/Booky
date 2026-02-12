# Testing Documentation

## Overview

Comprehensive test suite for the book club betting system using Jest and Prisma.

## Setup

### Dependencies Installed
- `jest` - Testing framework
- `@jest/globals` - Jest global functions
- `@types/jest` - TypeScript definitions
- `ts-jest` - TypeScript support for Jest

### Configuration Files

**jest.config.js**
- Configured for ESM modules with TypeScript
- Test timeout: 30 seconds
- Force exit enabled for clean shutdown
- Pattern matching for test files

**package.json scripts**
```json
{
  "test": "NODE_OPTIONS=--experimental-vm-modules jest",
  "test:watch": "NODE_OPTIONS=--experimental-vm-modules jest --watch",
  "test:coverage": "NODE_OPTIONS=--experimental-vm-modules jest --coverage"
}
```

## Test Suite: Betting System

**Location**: `src/__tests__/betting.test.ts`

### Test Results
```
PASS src/__tests__/betting.test.ts
  Betting System Tests
    ✓ Test 1: User finishes first and places bet (60 ms)
    ✓ Test 2: Correct prediction - both users get payout (35 ms)
    ✓ Test 3: Wrong prediction - bettor loses stake, finisher gets payout (36 ms)
    ✓ Test 4: Last finisher before deadline gets bonus (29 ms)
    ✓ Test 5: Betting after deadline should fail (23 ms)
    ✓ Test 6: Insufficient points for stake (15 ms)
    ✓ Test 7: Multiple users finish in sequence - betting chain (77 ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Time:        3.592 s
```

### Test Coverage

#### 1. Basic Betting Flow
Tests the fundamental betting mechanism where a user finishes first and places a bet.

**Verified**:
- Reading completion tracking
- Point balance management
- Bet creation with proper attributes
- Stake deduction from bettor's balance

#### 2. Correct Predictions
Tests successful bet resolution when prediction is accurate.

**Verified**:
- Rank multiplier calculation (1x for 1st place)
- Payout to both bettor and finisher
- Bet status update (PENDING → WON)
- Point transaction creation with BET_WON reason

**Example**:
- Bettor stakes 100 points on rank 1 (multiplier 1x)
- Both bettor and finisher receive 100 points
- Net result: Bettor breaks even, finisher gains 100

#### 3. Wrong Predictions
Tests bet resolution when prediction is incorrect.

**Verified**:
- Bettor loses stake (not refunded)
- Actual finisher receives payout with multiplier
- Bet status update (PENDING → LOST)
- Correct point calculations

**Example**:
- Bettor stakes 100 on User2 (rank 2, multiplier 1.5x)
- User3 finishes instead
- User3 receives: 100 × 1.5 = 150 points
- Bettor loses: 100 points (already deducted)

#### 4. Last Finisher Bonus
Tests bonus system for last person to complete.

**Verified**:
- Detection of last finisher (all others finished)
- Deadline checking (before meeting time)
- Bonus calculation (50% of page count)
- Transaction creation with BET_BONUS reason

**Example**:
- 300-page book
- Last finisher before deadline
- Bonus: 300 × 0.5 = 150 points

#### 5. Deadline Enforcement
Tests that betting window closes after meeting deadline.

**Verified**:
- Meeting deadline comparison
- Prevention of bets after deadline
- Proper error handling
- Meeting scheduling logic

#### 6. Stake Validation
Tests point balance requirements for placing bets.

**Verified**:
- Insufficient balance detection
- Minimum stake calculation (10% of pages)
- Maximum stake calculation (100% of pages)
- Error messages for insufficient points

**Example**:
- User has 20 points
- Min stake: 30 points (10% of 300)
- Max stake: 300 points (100% of 300)
- Cannot place 100-point bet

#### 7. Complex Betting Chains
Tests realistic scenario with multiple sequential bets and resolutions.

**Scenario**: 4 users, 3 sequential bets, all correct predictions

**Flow**:
1. User1 finishes, bets 100 on User2 (rank 1) → User2 finishes ✓
2. User2 finishes, bets 150 on User3 (rank 1) → User3 finishes ✓
3. User3 finishes, bets 100 on User4 (rank 1) → User4 finishes ✓
4. User4 is last finisher → receives 150 bonus

**Final Point Distribution**:
- User1: 300 (break even on bet)
- User2: 400 (net +100)
- User3: 450 (net +150)
- User4: 550 (net +250, includes bonus)

**Verified**:
- Sequential bet placement
- Multiple bet resolutions
- Compounding point calculations
- Last finisher bonus application
- Complete betting lifecycle

## Running the Tests

### Run all tests
```bash
npm test
```

### Run specific test file
```bash
npm test -- betting.test.ts
```

### Run in watch mode (for development)
```bash
npm run test:watch
```

### Run with coverage report
```bash
npm run test:coverage
```

### Run with additional Jest flags
```bash
npm test -- --verbose
npm test -- --detectOpenHandles
npm test -- --runInBand
```

## Test Database Setup

Tests use the same database configuration as the application (via Prisma).

**Setup per test suite**:
1. Create 4 test users
2. Create test club with all members
3. Create test book (300 pages)
4. Create test meeting (2 days future)

**Cleanup**:
- Before each test: Clean readings, bets, point transactions
- After all tests: Remove all test data
- Proper Prisma disconnection

## Betting System Rules (Tested)

### Multipliers
- Rank 1: 1.0x
- Rank 2: 1.5x
- Rank 3: 2.0x
- Rank 4: 2.5x
- Formula: `1 + (rank - 1) × 0.5`

### Payouts
| Scenario | Bettor | Finisher |
|----------|--------|----------|
| Correct  | stake × multiplier | stake × multiplier |
| Wrong    | loses stake | stake × multiplier |

### Special Rules
- **Stake range**: 10%-100% of page count
- **Last finisher**: +50% bonus if before deadline
- **Deadline**: No betting after meeting time
- **Balance**: Must have sufficient points

## Future Test Additions

Potential areas for expanded testing:

1. **GraphQL Integration Tests**
   - Test actual GraphQL mutations and queries
   - Apollo Server testing with test client

2. **Edge Cases**
   - Multiple simultaneous finishers
   - Bet on already finished user
   - Negative point scenarios
   - Invalid rank calculations

3. **Performance Tests**
   - Large number of users
   - Many sequential bets
   - Concurrent bet placement

4. **Error Handling**
   - Database connection failures
   - Transaction rollbacks
   - Invalid data scenarios

5. **Integration with Reading Progress**
   - Auto-awarding points for pages read
   - Progress tracking with betting

## Maintenance

### Updating Tests
When modifying betting logic:
1. Update affected test cases
2. Add new test cases for new features
3. Run full test suite before committing
4. Update this documentation

### CI/CD Integration
Tests can be integrated into CI/CD pipelines:
```yaml
test:
  script:
    - npm install
    - npm test
```

## Troubleshooting

### Common Issues

**Jest not exiting**
- Already handled with `forceExit: true` in config
- Use `--detectOpenHandles` to debug

**Database connection errors**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify test database exists

**TypeScript errors**
- Run `npx prisma generate` after schema changes
- Check tsconfig.json settings
- Clear Jest cache: `npx jest --clearCache`

**Test timeouts**
- Increase timeout in jest.config.js
- Check for async operations not completing
- Verify database performance
