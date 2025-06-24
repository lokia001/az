using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Services;
using Microsoft.Extensions.Logging;
using Quartz;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Jobs
{
    [DisallowConcurrentExecution]
    public class IcalSyncJob : IJob
    {
        private readonly IIcalSyncService _syncService;
        private readonly ILogger<IcalSyncJob> _logger;

        public IcalSyncJob(IIcalSyncService syncService, ILogger<IcalSyncJob> logger)
        {
            _syncService = syncService;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            _logger.LogInformation("Starting scheduled iCal sync job");
            await _syncService.SyncAllSpacesAsync();
            _logger.LogInformation("Completed scheduled iCal sync job");
        }
    }
}
