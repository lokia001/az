using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Backend.Api.Data;
using Backend.Api.Modules.Chatbot.Application;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;

namespace Backend.Api.Modules.Chatbot.Infrastructure
{
    public class PersonalizedSuggestionService : IPersonalizedSuggestionService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PersonalizedSuggestionService> _logger;

        public PersonalizedSuggestionService(AppDbContext context, ILogger<PersonalizedSuggestionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<object>> GetSuggestionsAsync(string userId)
        {
            var suggestions = new List<object>();
            var isAnonymous = string.IsNullOrEmpty(userId) || userId == "anonymous-user";

            _logger.LogInformation("Getting suggestions for user: {UserId}, Anonymous: {IsAnonymous}",
                userId, isAnonymous);

            // For anonymous users or when ID is invalid, return general suggestions
            if (isAnonymous)
            {
                _logger.LogInformation("Providing general suggestions for anonymous user");
                return GetGeneralSuggestions();
            }

            // For authenticated users, try to get personalized suggestions
            try
            {
                // Lấy lịch sử đặt chỗ của user
                var userBookings = await _context.Bookings
                    .Where(b => b.UserId.ToString() == userId)
                    .Include(b => b.Space)
                    .OrderByDescending(b => b.CreatedAt)
                    .Take(5)
                    .ToListAsync();

                if (!userBookings.Any())
                {
                    // Nếu user chưa có lịch sử, đề xuất các không gian phổ biến
                    var popularSpaces = await _context.Bookings
                        .GroupBy(b => b.SpaceId)
                        .Select(g => new { SpaceId = g.Key, Count = g.Count() })
                        .OrderByDescending(x => x.Count)
                        .Take(3)
                        .ToListAsync();

                    foreach (var space in popularSpaces)
                    {
                        var spaceDetails = await _context.Set<Space>()
                            .Where(s => s.Id == space.SpaceId)
                            .Select(s => new
                            {
                                s.Name,
                                s.Address,
                                s.Capacity,
                                s.PricePerHour
                            })
                            .FirstOrDefaultAsync();

                        if (spaceDetails != null)
                        {
                            suggestions.Add(new
                            {
                                type = "popular",
                                suggestion = $"{spaceDetails.Name} ({spaceDetails.Capacity} người) - {spaceDetails.PricePerHour:N0}đ/giờ",
                                details = spaceDetails
                            });
                        }
                    }
                }
                else
                {
                    // Đề xuất dựa trên lịch sử đặt chỗ
                    var userPreferences = userBookings
                        .GroupBy(b => b.Space.Type)
                        .OrderByDescending(g => g.Count())
                        .First();

                    var similarSpaces = await _context.Set<Space>()
                        .Where(s => s.Type == userPreferences.Key &&
                                   !userBookings.Select(b => b.SpaceId).Contains(s.Id))
                        .Take(3)
                        .Select(s => new
                        {
                            s.Name,
                            s.Address,
                            s.Capacity,
                            s.PricePerHour
                        })
                        .ToListAsync();

                    foreach (var space in similarSpaces)
                    {
                        suggestions.Add(new
                        {
                            type = "personalized",
                            suggestion = $"{space.Name} ({space.Capacity} người) - {space.PricePerHour:N0}đ/giờ",
                            details = space
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting personalized suggestions for user {UserId}, falling back to general suggestions", userId);
                return GetGeneralSuggestions();
            }

            return suggestions;
        }

        // Helper method to get general, non-personalized suggestions for anonymous users
        private IEnumerable<object> GetGeneralSuggestions()
        {
            var suggestions = new List<object>
            {
                new
                {
                    type = "general",
                    category = "workspace",
                    suggestion = "Không gian làm việc yên tĩnh",
                    details = new { description = "Không gian làm việc yên tĩnh, phù hợp cho công việc cần tập trung" }
                },
                new
                {
                    type = "general",
                    category = "meeting",
                    suggestion = "Phòng họp chuyên nghiệp",
                    details = new { description = "Phòng họp được trang bị đầy đủ thiết bị hiện đại, phù hợp cho các cuộc họp quan trọng" }
                },
                new
                {
                    type = "general",
                    category = "event",
                    suggestion = "Không gian tổ chức sự kiện",
                    details = new { description = "Không gian linh hoạt, phù hợp cho các sự kiện từ nhỏ đến lớn" }
                },
                new
                {
                    type = "general",
                    category = "info",
                    suggestion = "Đăng nhập để xem đề xuất cá nhân hóa",
                    details = new { description = "Đăng nhập để nhận được những đề xuất phù hợp với nhu cầu của bạn" }
                }
            };

            return suggestions;
        }
    }
}
