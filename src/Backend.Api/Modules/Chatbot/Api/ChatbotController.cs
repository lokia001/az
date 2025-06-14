using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Backend.Api.Modules.Chatbot.Application;

namespace Backend.Api.Modules.Chatbot.Api
{
    [ApiController]
    [Route("chatbot")]
    [Authorize]
    public class ChatbotController : ControllerBase
    {
        private readonly IDialogflowService _dialogflowService;
        private readonly IPersonalizedSuggestionService _personalizedSuggestionService;
        private readonly ILogger<ChatbotController> _logger;

        public ChatbotController(
            IDialogflowService dialogflowService,
            IPersonalizedSuggestionService personalizedSuggestionService,
            ILogger<ChatbotController> logger)
        {
            _dialogflowService = dialogflowService;
            _personalizedSuggestionService = personalizedSuggestionService;
            _logger = logger;
        }

        [HttpPost("dialogflow-webhook")]
        public async Task<IActionResult> DialogflowWebhook([FromBody] DialogflowWebhookRequest request)
        {
            // Log authentication information
            _logger.LogInformation("Received chatbot webhook request. User authenticated: {IsAuthenticated}",
                User?.Identity?.IsAuthenticated ?? false);

            // Validate input
            if (request == null || string.IsNullOrEmpty(request.LastMessage))
            {
                _logger.LogWarning("Invalid request: Request is null or LastMessage is null or empty");
                return BadRequest(new { error = "Message content is required" });
            }

            try
            {
                // Use the DialogflowService with isAnonymous = false since this is the authenticated endpoint
                var result = await _dialogflowService.DetectIntentAsync(request.LastMessage, false);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing dialogflow webhook request");
                return StatusCode(500, new { error = "An error occurred processing your request" });
            }
        }

        [HttpPost("personalized-suggestions")]
        [AllowAnonymous]  // Allow anonymous access for better user experience
        public async Task<IActionResult> PersonalizedSuggestions([FromBody] PersonalizedSuggestionRequest request)
        {
            // If user is not authenticated, the userId will be null or "anonymous-user"
            var isAnonymous = !User?.Identity?.IsAuthenticated ?? true;
            var userId = isAnonymous ? "anonymous-user" : request.UserId;

            _logger.LogInformation("Personalized suggestions requested. IsAuthenticated: {IsAuthenticated}, UserId: {UserId}",
                !isAnonymous, userId);

            var suggestions = await _personalizedSuggestionService.GetSuggestionsAsync(userId);
            return Ok(suggestions);
        }

        [HttpGet("status")]
        [AllowAnonymous]
        public IActionResult GetChatbotStatus()
        {
            return Ok(new
            {
                status = "online",
                authenticated = User?.Identity?.IsAuthenticated ?? false,
                message = "Chatbot system is operational",
                requiresAuth = true
            });
        }

        [HttpPost("dialogflow-public")]
        [AllowAnonymous]
        public async Task<IActionResult> DialogflowPublic([FromBody] DialogflowWebhookRequest request)
        {
            // Log that this is a public/anonymous access
            _logger.LogInformation("Received public chatbot request (anonymous access)");

            // Validate input
            if (request == null || string.IsNullOrEmpty(request.LastMessage))
            {
                _logger.LogWarning("Invalid public request: Request is null or LastMessage is null or empty");
                return BadRequest(new { error = "Message content is required" });
            }

            try
            {
                // Use DialogflowService with isAnonymous flag set to true
                var result = await _dialogflowService.DetectIntentAsync(request.LastMessage, true);
                _logger.LogInformation("Public dialogflow response processed successfully");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing public dialogflow webhook request");
                return StatusCode(500, new { error = "An error occurred processing your request" });
            }
        }

        [HttpGet("debug")]
        [AllowAnonymous]
        public IActionResult DebugRoutes()
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var pathBase = Request.PathBase.Value ?? "";
            var path = Request.Path.Value ?? "";

            return Ok(new
            {
                baseUrl = baseUrl,
                pathBase = pathBase,
                path = path,
                fullUrl = $"{baseUrl}{pathBase}{path}",
                controllerRoute = "api/chatbot",
                expectedRoutes = new
                {
                    status = $"{baseUrl}{pathBase}/api/chatbot/status",
                    dialogflowPublic = $"{baseUrl}{pathBase}/api/chatbot/dialogflow-public",
                    dialogflowWebhook = $"{baseUrl}{pathBase}/api/chatbot/dialogflow-webhook",
                    debug = $"{baseUrl}{pathBase}/api/chatbot/debug"
                }
            });
        }
    }

    public class DialogflowWebhookRequest
    {
        public string? UserId { get; set; }
        public string LastMessage { get; set; } = string.Empty;
    }

    public class PersonalizedSuggestionRequest
    {
        public string UserId { get; set; } = string.Empty;
    }
}
