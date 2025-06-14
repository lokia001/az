
namespace Backend.Api.Modules.CommunityContent;

using Backend.Api.Modules.CommunityContent.Application.Contracts.Services;
using Backend.Api.Modules.CommunityContent.Application.Services;
using Backend.Api.Modules.CommunityContent.Domain.Interfaces.Repositories;
using Backend.Api.Modules.CommunityContent.Infrastructure.Persistence.Repositories;
using Microsoft.Extensions.DependencyInjection;

public static class CommunityContentModuleServices
{
    public static IServiceCollection AddCommunityContentModule(this IServiceCollection services)
    {
        // Repositories
        services.AddScoped<ICommunityRepository, CommunityRepository>();
        services.AddScoped<ICommunityMemberRepository, CommunityMemberRepository>();
        services.AddScoped<IPostRepository, PostRepository>();

        // Services
        services.AddScoped<ICommunityService, CommunityService>();
        services.AddScoped<ICommunityMemberService, CommunityMemberService>(); // << ĐĂNG KÝ Ở ĐÂY
        services.AddScoped<IPostService, PostService>();

        return services;
    }
}
