using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using FoodOrder.Application.Users.Queries.GetAllUsers;
using FoodOrder.Application.Users.Queries.GetCurrentUser;
using FoodOrder.Api.Controllers;
using ErrorOr;
using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;

namespace FoodOrder.Api.Controllers;

[Route("users")]
[Authorize]
public class UsersController : ApiController
{
    private readonly ISender _mediator;

    public UsersController(ISender mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers()
    {
        var query = new GetAllUsersQuery();
        var result = await _mediator.Send(query);

        return result.Match(
            users => Ok(users),
            errors => Problem(errors)
        );
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdString = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var result = await _mediator.Send(new GetCurrentUserQuery(userId));

        return result.Match(
            user => Ok(user),
            errors => Problem(errors)
        );
    }
}
