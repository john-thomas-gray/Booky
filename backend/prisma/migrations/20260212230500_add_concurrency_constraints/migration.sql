-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN "currentBettorId" TEXT;

-- AlterTable
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_clubId_bookId_userId_key" UNIQUE ("clubId", "bookId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "unique_pending_bet_per_race" ON "Bet"("clubId", "bookId", "meetingId") WHERE "outcome" = 'PENDING';

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_currentBettorId_fkey" FOREIGN KEY ("currentBettorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
