// File: Backend.Api/Modules/Engagement/EngagementModuleServices.cs
namespace Backend.Api.Modules.Engagement;

using Backend.Api.Modules.Engagement.Application.Contracts.Services;
using Backend.Api.Modules.Engagement.Application.Services;
using Backend.Api.Modules.Engagement.Domain.Interfaces.Repositories;
using Backend.Api.Modules.Engagement.Infrastructure.Persistence.Repositories;
using Microsoft.Extensions.DependencyInjection;


public static class EngagementModuleServices
{
    public static IServiceCollection AddEngagementModule(this IServiceCollection services)
    {
        // Đăng ký Repositories
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<ICommentRepository, CommentRepository>();
        services.AddScoped<IReactionRepository, ReactionRepository>();

        // Đăng ký Application Services
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<ICommentService, CommentService>();
        services.AddScoped<IReactionService, ReactionService>();

        // Nếu có các Infrastructure Services khác dành riêng cho module này, đăng ký ở đây

        return services;
    }
}
