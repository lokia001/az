using Backend.Api.Services;
using Backend.Api.Data.Models;
using System.Diagnostics;

namespace Backend.Api.Middleware
{
    public class LoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<LoggingMiddleware> _logger;

        public LoggingMiddleware(RequestDelegate next, ILogger<LoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, ISystemLogService logService)
        {
            var stopwatch = Stopwatch.StartNew();
            var originalResponseBodyStream = context.Response.Body;

            try
            {
                // Continue to next middleware
                await _next(context);

                stopwatch.Stop();

                // Log successful requests (only for important endpoints or errors)
                if (context.Response.StatusCode >= 400 || ShouldLogRequest(context.Request.Path))
                {
                    var level = context.Response.StatusCode >= 500 ? SystemLogLevel.ERROR :
                               context.Response.StatusCode >= 400 ? SystemLogLevel.WARNING :
                               SystemLogLevel.INFO;

                    var message = $"{context.Request.Method} {context.Request.Path} - Status: {context.Response.StatusCode} - Duration: {stopwatch.ElapsedMilliseconds}ms";
                    
                    var userId = context.User?.FindFirst("sub")?.Value ?? context.User?.FindFirst("id")?.Value;
                    var clientIp = context.Connection.RemoteIpAddress?.ToString();
                    var userAgent = context.Request.Headers.UserAgent.ToString();

                    await logService.LogAsync(
                        level,
                        "Backend.ApiRequest",
                        message,
                        userId,
                        null,
                        context.Response.StatusCode >= 500 ? $"Request failed with status {context.Response.StatusCode}" : null,
                        clientIp,
                        userAgent
                    );
                }
            }
            catch (Exception ex)
            {
                stopwatch.Stop();

                // Log unhandled exceptions
                var userId = context.User?.FindFirst("sub")?.Value ?? context.User?.FindFirst("id")?.Value;
                var clientIp = context.Connection.RemoteIpAddress?.ToString();
                var userAgent = context.Request.Headers.UserAgent.ToString();

                await logService.LogErrorAsync(
                    "Backend.UnhandledException",
                    $"Unhandled exception in {context.Request.Method} {context.Request.Path}",
                    userId,
                    null,
                    ex.ToString(),
                    clientIp,
                    userAgent
                );

                throw; // Re-throw the exception
            }
        }

        private static bool ShouldLogRequest(PathString path)
        {
            // Log admin actions, auth operations, and critical business operations
            var pathStr = path.Value?.ToLower() ?? "";
            
            return pathStr.Contains("/admin/") ||
                   pathStr.Contains("/auth/") ||
                   pathStr.Contains("/users/") ||
                   pathStr.Contains("/spaces/") ||
                   pathStr.Contains("/bookings/") ||
                   pathStr.Contains("/communities/");
        }
    }
}
