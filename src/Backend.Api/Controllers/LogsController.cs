using Backend.Api.Services;
using Backend.Api.Modules.Logging.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Roles = "SysAdmin")] // Chỉ SysAdmin mới có thể truy cập
    public class LogsController : ControllerBase
    {
        private readonly ISystemLogService _logService;
        private readonly ILogger<LogsController> _logger;

        public LogsController(ISystemLogService logService, ILogger<LogsController> logger)
        {
            _logService = logService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetLogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 100,
            [FromQuery] string? level = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                if (pageSize > 1000) pageSize = 1000; // Limit max page size
                
                var logs = await _logService.GetLogsAsync(page, pageSize, level, fromDate, toDate);
                var totalCount = await _logService.GetLogsCountAsync(level, fromDate, toDate);
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                // Log admin action
                var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
                await _logService.LogAdminActionAsync(
                    "AdminController.GetLogs", 
                    $"Admin viewed system logs. Filters: level={level}, page={page}, pageSize={pageSize}",
                    currentUserId,
                    null,
                    clientIp,
                    Request.Headers.UserAgent.ToString()
                );

                return Ok(new
                {
                    logs = logs,
                    pagination = new
                    {
                        currentPage = page,
                        pageSize = pageSize,
                        totalCount = totalCount,
                        totalPages = totalPages,
                        hasNextPage = page < totalPages,
                        hasPreviousPage = page > 1
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving system logs");
                return StatusCode(500, new { message = "Error retrieving system logs" });
            }
        }

        [HttpPost("cleanup")]
        public async Task<ActionResult> CleanupOldLogs()
        {
            try
            {
                await _logService.CleanupOldLogsAsync();

                // Log admin action
                var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
                await _logService.LogAdminActionAsync(
                    "AdminController.CleanupOldLogs", 
                    "Admin triggered cleanup of old system logs",
                    currentUserId,
                    null,
                    clientIp,
                    Request.Headers.UserAgent.ToString()
                );

                return Ok(new { message = "Old logs cleanup completed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during log cleanup");
                return StatusCode(500, new { message = "Error during log cleanup" });
            }
        }

        [HttpGet("levels")]
        public ActionResult<object> GetLogLevels()
        {
            return Ok(new
            {
                levels = new[]
                {
                    SystemLogLevel.DEBUG,
                    SystemLogLevel.INFO,
                    SystemLogLevel.WARNING,
                    SystemLogLevel.ERROR,
                    SystemLogLevel.ADMIN_ACTION
                }
            });
        }

        [HttpGet("export")]
        public async Task<ActionResult> ExportLogs(
            [FromQuery] string? level = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] string format = "json")
        {
            try
            {
                // Get all logs matching criteria (no pagination for export)
                var logs = await _logService.GetLogsAsync(1, int.MaxValue, level, fromDate, toDate);

                // Log admin action
                var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
                await _logService.LogAdminActionAsync(
                    "AdminController.ExportLogs", 
                    $"Admin exported {logs.Count} system logs. Format: {format}",
                    currentUserId,
                    null,
                    clientIp,
                    Request.Headers.UserAgent.ToString()
                );

                if (format.ToLower() == "csv")
                {
                    var csv = "Timestamp,Level,Source,Message,UserId,RelatedEntityId,IpAddress,UserAgent\n";
                    foreach (var log in logs)
                    {
                        csv += $"\"{log.Timestamp:yyyy-MM-dd HH:mm:ss}\",\"{log.Level}\",\"{log.Source}\",\"{log.Message?.Replace("\"", "\"\"")}\",\"{log.UserId}\",\"{log.RelatedEntityId}\",\"{log.IpAddress}\",\"{log.UserAgent?.Replace("\"", "\"\"")}\"\n";
                    }
                    
                    var fileName = $"system_logs_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
                    return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", fileName);
                }
                else
                {
                    // Default to JSON
                    var fileName = $"system_logs_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";
                    return File(System.Text.Json.JsonSerializer.SerializeToUtf8Bytes(logs), "application/json", fileName);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting system logs");
                return StatusCode(500, new { message = "Error exporting system logs" });
            }
        }

        // Test endpoint - Remove this in production
        [HttpGet("test")]
        [AllowAnonymous]
        public async Task<ActionResult> TestLogs()
        {
            try
            {
                var logs = await _logService.GetLogsAsync(1, 10);
                return Ok(new
                {
                    message = "Logs API is working",
                    logsCount = logs.Count,
                    sampleLogs = logs.Take(3).Select(l => new
                    {
                        l.Timestamp,
                        l.Level,
                        l.Source,
                        l.Message
                    })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error testing logs", error = ex.Message });
            }
        }
    }
}
