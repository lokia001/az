namespace Backend.Api.Modules.SpaceBooking.Domain.Enums
{
    public enum SyncStatus
    {
        NotStarted = 0,
        InProgress = 1,
        Completed = 2,
        Failed = 3,
        ConflictDetected = 4
    }
}
