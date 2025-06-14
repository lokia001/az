using System.Threading.Tasks;
using Google.Cloud.Dialogflow.V2;
using Google.Apis.Auth.OAuth2;
using Google.Api.Gax.Grpc;
using System.IO;
using System;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using Backend.Api.Modules.Chatbot.Application;

namespace Backend.Api.Modules.Chatbot.Infrastructure
{
    public class DialogflowService : IDialogflowService
    {
        private readonly string _projectId;
        private readonly string _credentialsPath;
        private readonly ILogger<DialogflowService> _logger;
        private static readonly string[] _requiredScopes = new[]
        {
            "https://www.googleapis.com/auth/cloud-platform",
            "https://www.googleapis.com/auth/dialogflow"
        };

        private const int MaxRetries = 3;
        private const int RetryDelayMs = 1000;

        public DialogflowService(
            string projectId,
            string locationId, // không cần nhưng giữ lại để không phải thay đổi DI
            string agentId,    // không cần nhưng giữ lại để không phải thay đổi DI
            string credentialsPath,
            ILogger<DialogflowService> logger)
        {
            _projectId = projectId;
            _credentialsPath = credentialsPath;
            _logger = logger;

            _logger.LogInformation(
                "DialogflowService initialized with ProjectId: {ProjectId}, CredentialsPath: {CredentialsPath}",
                _projectId,
                _credentialsPath);
        }

        public async Task<object> DetectIntentAsync(string message, bool isAnonymous = false)
        {
            Exception? lastException = null;

            _logger.LogInformation("Starting DetectIntent for message: {Message}, Anonymous: {IsAnonymous}", message, isAnonymous);

            for (int attempt = 0; attempt < MaxRetries; attempt++)
            {
                try
                {
                    _logger.LogInformation("Attempt {Attempt} of {MaxRetries}", attempt + 1, MaxRetries);

                    GoogleCredential credential;

                    // Try to load from file first
                    if (!string.IsNullOrEmpty(_credentialsPath) && File.Exists(_credentialsPath))
                    {
                        _logger.LogInformation("Loading credentials from file: {CredentialsPath}", _credentialsPath);
                        using (var stream = new FileStream(_credentialsPath, FileMode.Open, FileAccess.Read))
                        {
                            credential = GoogleCredential.FromStream(stream)
                                .CreateScoped(_requiredScopes);
                        }
                    }
                    else
                    {
                        _logger.LogWarning("Credentials file not found, falling back to application default credentials");
                        credential = await GoogleCredential.GetApplicationDefaultAsync();
                        if (credential.IsCreateScopedRequired)
                        {
                            credential = credential.CreateScoped(_requiredScopes);
                        }
                    }

                    var builder = new SessionsClientBuilder
                    {
                        Credential = credential
                    };

                    _logger.LogInformation("Building SessionsClient");
                    var sessionsClient = await builder.BuildAsync();

                    var sessionId = Guid.NewGuid().ToString();
                    var sessionPath = SessionName.FromProjectSession(_projectId, sessionId);

                    _logger.LogInformation("Created session path: {SessionPath}", sessionPath);

                    var queryInput = new QueryInput
                    {
                        Text = new TextInput
                        {
                            Text = message,
                            LanguageCode = "vi"
                        }
                    };

                    var request = new DetectIntentRequest
                    {
                        Session = sessionPath.ToString(),
                        QueryInput = queryInput
                    };

                    // For anonymous users, we'll add context about being anonymous
                    if (isAnonymous)
                    {
                        request.QueryParams = new QueryParameters
                        {
                            Contexts =
                            {
                                new Context
                                {
                                    Name = $"{sessionPath}/contexts/anonymous_user",
                                    LifespanCount = 5,
                                    Parameters = new Google.Protobuf.WellKnownTypes.Struct
                                    {
                                        Fields =
                                        {
                                            ["isAnonymous"] = new Google.Protobuf.WellKnownTypes.Value { BoolValue = true }
                                        }
                                    }
                                }
                            }
                        };
                    }

                    _logger.LogInformation("Sending request to Dialogflow");
                    var response = await sessionsClient.DetectIntentAsync(request);
                    _logger.LogInformation("Received response from Dialogflow: {Response}",
                        response.QueryResult.FulfillmentText);

                    // For anonymous users, we might want to modify or filter the response
                    if (isAnonymous && !string.IsNullOrEmpty(response.QueryResult.Intent?.DisplayName))
                    {
                        // List of intents that require authentication
                        var restrictedIntents = new[] {
                            "booking_create", "booking_cancel", "booking_view",
                            "user_profile", "payment_information",
                            "personal_history"
                        };

                        if (Array.Exists(restrictedIntents, intent => intent == response.QueryResult.Intent.DisplayName))
                        {
                            _logger.LogInformation("Anonymous user attempted to access restricted intent: {Intent}",
                                response.QueryResult.Intent.DisplayName);

                            return new
                            {
                                intent = "require_auth",
                                parameters = response.QueryResult.Parameters?.Fields,
                                fulfillmentText = "Để sử dụng tính năng này, bạn cần đăng nhập trước. Vui lòng đăng nhập để tiếp tục.",
                                queryText = response.QueryResult.QueryText,
                                languageCode = response.QueryResult.LanguageCode,
                                attemptedIntent = response.QueryResult.Intent.DisplayName
                            };
                        }
                    }

                    return new
                    {
                        intent = response.QueryResult.Intent?.DisplayName,
                        parameters = response.QueryResult.Parameters?.Fields,
                        fulfillmentText = response.QueryResult.FulfillmentText,
                        queryText = response.QueryResult.QueryText,
                        languageCode = response.QueryResult.LanguageCode
                    };
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error on attempt {Attempt}: {Message}", attempt + 1, ex.Message);
                    lastException = ex;
                    if (attempt < MaxRetries - 1)
                    {
                        await Task.Delay(RetryDelayMs * (attempt + 1));
                        continue;
                    }
                }
            }

            var credentialsExist = !string.IsNullOrEmpty(_credentialsPath) && File.Exists(_credentialsPath);

            if (lastException != null)
            {
                _logger.LogError(lastException,
                    "All attempts failed. CredentialsExist: {CredentialsExist}, ProjectId: {ProjectId}",
                    credentialsExist,
                    _projectId);
            }
            else
            {
                _logger.LogError("All attempts failed with no specific exception. CredentialsExist: {CredentialsExist}, ProjectId: {ProjectId}",
                    credentialsExist,
                    _projectId);
            }

            return new
            {
                intent = "error",
                parameters = new Dictionary<string, string>(),
                fulfillmentText = "Xin lỗi, tôi đang gặp một chút vấn đề kỹ thuật. Bạn vui lòng thử lại sau nhé!",
                queryText = message,
                languageCode = "vi"
            };
        }
    }
}
