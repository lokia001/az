using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Backend.Api.Modules.Chatbot;
using Backend.Api.Modules.Chatbot.Api;
using Backend.Api.Modules.Chatbot.Application;
using Backend.Api.Modules.Chatbot.Infrastructure;
using Microsoft.Extensions.Configuration;

namespace Backend.Api.Modules.Chatbot
{
    public static class ChatbotModule
    {
        public static IServiceCollection AddChatbotModule(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddChatbotServices(configuration);
            return services;
        }

        public static IApplicationBuilder UseChatbotModule(this IApplicationBuilder app)
        {
            // Add middleware if needed
            return app;
        }
    }
}
