namespace Backend.Api.Modules.UserRelated.Domain.Enums
{
    /// <summary>
    /// Status of an owner registration request
    /// </summary>
    public enum OwnerRegistrationStatus
    {
        /// <summary>
        /// Request is pending approval from SysAdmin
        /// </summary>
        Pending = 0,

        /// <summary>
        /// Request has been approved by SysAdmin and user role has been changed to Owner
        /// </summary>
        Approved = 1,

        /// <summary>
        /// Request has been rejected by SysAdmin
        /// </summary>
        Rejected = 2,

        /// <summary>
        /// Request was cancelled by the user before processing
        /// </summary>
        Cancelled = 3
    }
}
