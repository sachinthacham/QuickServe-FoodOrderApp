using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Users.Common;
using FoodOrder.Application.Common.Interfaces.Persistence;

namespace FoodOrder.Application.Users.Queries.GetAllUsers;

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, ErrorOr<List<UserResult>>>
{
    private readonly IUserRepository _userRepository;

    public GetAllUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<ErrorOr<List<UserResult>>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync();

        return users.Select(u => new UserResult(
            u.Id,
            u.FirstName,
            u.LastName,
            u.Email,
            u.Role) { AvatarUrl = u.AvatarUrl }).ToList();
    }
}

