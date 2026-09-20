using MediatR;
using ErrorOr;
using FoodOrder.Application.Users.Common;

namespace FoodOrder.Application.Users.Queries.GetCurrentUser;

public record GetCurrentUserQuery(Guid UserId) : IRequest<ErrorOr<UserResult>>;
