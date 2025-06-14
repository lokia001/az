using System.Threading.Tasks;

namespace Backend.Api.Modules.Chatbot.Application
{
    public interface IDialogflowService
    {
        Task<object> DetectIntentAsync(string message, bool isAnonymous = false);
    }
}
