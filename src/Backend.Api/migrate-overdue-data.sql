-- Migration script to convert old 'Overdue' status to specific overdue statuses
-- This script should be run manually to handle existing data

-- Check existing Overdue records
SELECT Id, Status, StartTime, EndTime, ActualCheckIn, ActualCheckOut, 
       DATETIME('now') as CurrentTime,
       CASE 
           WHEN ActualCheckIn IS NOT NULL AND ActualCheckOut IS NULL THEN 'Should be OverdueCheckedIn'
           WHEN ActualCheckIn IS NULL THEN 'Should be OverdueConfirmed' 
           ELSE 'Should be OverduePending'
       END as RecommendedStatus
FROM Bookings 
WHERE Status = 'Overdue';

-- Update Overdue records to specific statuses based on their actual state
-- 1. If checked in but not checked out -> OverdueCheckedIn
UPDATE Bookings 
SET Status = 'OverdueCheckedIn'
WHERE Status = 'Overdue' 
  AND ActualCheckIn IS NOT NULL 
  AND ActualCheckOut IS NULL;

-- 2. If confirmed but never checked in -> OverdueConfirmed  
UPDATE Bookings 
SET Status = 'OverdueConfirmed'
WHERE Status = 'Overdue' 
  AND ActualCheckIn IS NULL;

-- 3. Any remaining Overdue (should be rare) -> OverduePending as fallback
UPDATE Bookings 
SET Status = 'OverduePending'
WHERE Status = 'Overdue';

-- Verify no more Overdue records exist
SELECT COUNT(*) as RemainingOverdueCount FROM Bookings WHERE Status = 'Overdue';
