using ErrorOr;
using MediatR;
using FoodOrder.Application.Common.Interfaces.Persistence;
using FoodOrder.Application.Users.Common;

namespace FoodOrder.Application.Users.Queries.GetCurrentUser;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, ErrorOr<UserResult>>
{
    private readonly IUserRepository _userRepository;

    public GetCurrentUserQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<ErrorOr<UserResult>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId);

        if (user is null)
        {
            return Error.NotFound(description: "User not found.");
        }

        return new UserResult(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            user.Role)
        { AvatarUrl = user.AvatarUrl };
    }
}
