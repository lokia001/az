// MinimumAgeAuthorizationHandler.cs
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Backend.Api.Security;

public class MinimumAgeAuthorizationHandler : AuthorizationHandler<MinimumAgeRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, MinimumAgeRequirement requirement)
    {
        var ageClaim = context.User.FindFirst(ClaimTypes.DateOfBirth); //Sửa lại claim tương ứng

        if (ageClaim == null)
        {
            return Task.CompletedTask; //Không có claim age, không thoả mãn
        }

        //Convert claim age to int
        DateTime birthDate;
        if (!DateTime.TryParse(ageClaim.Value, out birthDate))
        {
            return Task.CompletedTask; //Không convert dc, không thoả mãn
        }

        int age = DateTime.Today.Year - birthDate.Year;
        if (birthDate > DateTime.Today.AddYears(-age))
        {
            age--;
        }

        if (age >= requirement.MinimumAge)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}