namespace Backend.Api.Modules.SpaceBooking.Domain.Enums
{
    public enum SyncStatus
    {
        None = 0,
        Success = 1,
        Failed = 2,
        ConflictDetected = 3,
        InProgress = 4
    }
}
