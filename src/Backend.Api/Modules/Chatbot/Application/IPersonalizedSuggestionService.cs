using System.Threading.Tasks;
using System.Collections.Generic;

namespace Backend.Api.Modules.Chatbot.Application
{
    public interface IPersonalizedSuggestionService
    {
        Task<IEnumerable<object>> GetSuggestionsAsync(string userId);
    }
}
