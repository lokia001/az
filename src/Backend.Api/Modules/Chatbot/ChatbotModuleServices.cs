using Microsoft.Extensions.DependencyInjection;
using Backend.Api.Modules.Chatbot.Application;
using Backend.Api.Modules.Chatbot.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;

namespace Backend.Api.Modules.Chatbot
{
    public static class ChatbotModuleServices
    {
        public static IServiceCollection AddChatbotServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Đọc cấu hình từ appsettings, user secrets hoặc biến môi trường
            var projectId = configuration["Dialogflow:ProjectId"];
            var locationId = configuration["Dialogflow:LocationId"] ?? "us-central1";
            var agentId = configuration["Dialogflow:AgentId"];
            var credentialsPath = configuration["Dialogflow:CredentialsPath"];

            // Kiểm tra và log cảnh báo nếu thiếu thông tin cấu hình
            if (string.IsNullOrEmpty(projectId) || 
                projectId.StartsWith("<YOUR_") || 
                string.IsNullOrEmpty(credentialsPath) || 
                credentialsPath.StartsWith("<YOUR_"))
            {
                var logger = services.BuildServiceProvider().GetRequiredService<ILogger<IDialogflowService>>();
                logger.LogWarning("Dialogflow configuration is missing or using placeholders. Set actual values via User Secrets or Environment Variables:");
                logger.LogWarning("- For Development: Use dotnet user-secrets");
                logger.LogWarning("  dotnet user-secrets set \"Dialogflow:ProjectId\" \"your-project-id\"");
                logger.LogWarning("  dotnet user-secrets set \"Dialogflow:CredentialsPath\" \"path/to/credentials.json\"");
                logger.LogWarning("- For Production: Use Environment Variables");
                logger.LogWarning("  export Dialogflow__ProjectId=\"your-project-id\"");
                logger.LogWarning("  export Dialogflow__CredentialsPath=\"path/to/credentials.json\"");
            }

            services.AddScoped<IDialogflowService>(sp =>
            {
                var logger = sp.GetRequiredService<ILogger<DialogflowService>>();
                return new DialogflowService(projectId ?? "", locationId, agentId ?? "", credentialsPath ?? "", logger);
            });
            
            services.AddScoped<IPersonalizedSuggestionService, PersonalizedSuggestionService>();
            return services;
        }
    }
}
