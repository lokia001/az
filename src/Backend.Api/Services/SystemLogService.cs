using Backend.Api.Data;
using Backend.Api.Modules.Logging.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Services
{
    public interface ISystemLogService
    {
        Task LogAsync(string level, string source, string message, string? userId = null, string? relatedEntityId = null, string? errorDetails = null, string? ipAddress = null, string? userAgent = null);
        Task LogInfoAsync(string source, string message, string? userId = null, string? relatedEntityId = null, string? ipAddress = null, string? userAgent = null);
        Task LogWarningAsync(string source, string message, string? userId = null, string? relatedEntityId = null, string? ipAddress = null, string? userAgent = null);
        Task LogErrorAsync(string source, string message, string? userId = null, string? relatedEntityId = null, string? errorDetails = null, string? ipAddress = null, string? userAgent = null);
        Task LogAdminActionAsync(string source, string message, string? userId = null, string? relatedEntityId = null, string? ipAddress = null, string? userAgent = null);
        Task LogDebugAsync(string source, string message, string? userId = null, string? relatedEntityId = null, string? ipAddress = null, string? userAgent = null);
        Task<List<SystemLog>> GetLogsAsync(int page = 1, int pageSize = 100, string? level = null, DateTime? fromDate = null, DateTime? toDate = null);
        Task<int> GetLogsCountAsync(string? level = null, DateTime? fromDate = null, DateTime? toDate = null);
        Task CleanupOldLogsAsync();
    }

    public class SystemLogService : ISystemLogService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<SystemLogService> _logger;

        public SystemLogService(AppDbContext context, ILogger<SystemLogService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task LogAsync(string level, string source, string message, string? userId = null, string? relatedEntityId = null, string? errorDetails = null, string? ipAddress = null, string? userAgent = null)
        {
            try
            {
                var log = new SystemLog
                {
                    Level = level,
                    Source = source,
                    Message = message,
                    UserId = userId,
                    RelatedEntityId = relatedEntityId,
                    ErrorDetails = errorDetails,
                    IpAddress = ipAddress,
                    UserAgent = userAgent,
                    Timestamp = DateTime.UtcNow
                };

                _context.SystemLogs.Add(log);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Fallback to built-in logging if database logging fails
                _logger.LogError(ex, "Failed to save system log to database. Original log: {Level} {Source} {Message}", level, source, message);
            }
        }

        public async Task LogInfoAsync(string source, string message, string? userId = null, string? relatedEntityId = null, string? ipAddress = null, string? userAgent = null)
        {
            await LogAsync(SystemLogLevel.INFO, source, message, userId, relatedEntityId, null, ipAddress, userAgent);
        }

        public async Task LogWarningAsync(string source, string message, string? userId = null, string? relatedEntityId = null, string? ipAddress = null, string? userAgent = null)
        {
            await LogAsync(SystemLogLevel.WARNING, source, message, userId, relatedEntityId, null, ipAddress, userAgent);
        }

        public async Task LogErrorAsync(string source, string message, string? userId = null, string? relatedEntityId = null, string? errorDetails = null, string? ipAddress = null, string? userAgent = null)
        {
            await LogAsync(SystemLogLevel.ERROR, source, message, userId, relatedEntityId, errorDetails, ipAddress, userAgent);
        }

        public async Task LogAdminActionAsync(string source, string message, string? userId = null, string? relatedEntityId = null, string? ipAddress = null, string? userAgent = null)
        {
            await LogAsync(SystemLogLevel.ADMIN_ACTION, source, message, userId, relatedEntityId, null, ipAddress, userAgent);
        }

        public async Task LogDebugAsync(string source, string message, string? userId = null, string? relatedEntityId = null, string? ipAddress = null, string? userAgent = null)
        {
            await LogAsync(SystemLogLevel.DEBUG, source, message, userId, relatedEntityId, null, ipAddress, userAgent);
        }

        public async Task<List<SystemLog>> GetLogsAsync(int page = 1, int pageSize = 100, string? level = null, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.SystemLogs.AsQueryable();

            if (!string.IsNullOrEmpty(level))
            {
                query = query.Where(l => l.Level == level);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(l => l.Timestamp >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(l => l.Timestamp <= toDate.Value);
            }

            return await query
                .OrderByDescending(l => l.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetLogsCountAsync(string? level = null, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.SystemLogs.AsQueryable();

            if (!string.IsNullOrEmpty(level))
            {
                query = query.Where(l => l.Level == level);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(l => l.Timestamp >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(l => l.Timestamp <= toDate.Value);
            }

            return await query.CountAsync();
        }

        public async Task CleanupOldLogsAsync()
        {
            var now = DateTime.UtcNow;

            // Delete DEBUG logs older than 7 days
            var debugCutoff = now.AddDays(-7);
            await _context.SystemLogs
                .Where(l => l.Level == SystemLogLevel.DEBUG && l.Timestamp < debugCutoff)
                .ExecuteDeleteAsync();

            // Delete INFO logs older than 30 days
            var infoCutoff = now.AddDays(-30);
            await _context.SystemLogs
                .Where(l => l.Level == SystemLogLevel.INFO && l.Timestamp < infoCutoff)
                .ExecuteDeleteAsync();

            // Delete WARNING and frontend ERROR logs older than 90 days
            var warningCutoff = now.AddDays(-90);
            await _context.SystemLogs
                .Where(l => (l.Level == SystemLogLevel.WARNING || (l.Level == SystemLogLevel.ERROR && l.Source.Contains("Frontend"))) && l.Timestamp < warningCutoff)
                .ExecuteDeleteAsync();

            // Delete backend ERROR logs older than 180 days (6 months)
            var errorCutoff = now.AddDays(-180);
            await _context.SystemLogs
                .Where(l => l.Level == SystemLogLevel.ERROR && !l.Source.Contains("Frontend") && l.Timestamp < errorCutoff)
                .ExecuteDeleteAsync();

            // Delete ADMIN_ACTION logs older than 365 days (1 year)
            var adminCutoff = now.AddDays(-365);
            await _context.SystemLogs
                .Where(l => l.Level == SystemLogLevel.ADMIN_ACTION && l.Timestamp < adminCutoff)
                .ExecuteDeleteAsync();

            await _context.SaveChangesAsync();
        }
    }
}
