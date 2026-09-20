namespace FoodOrder.Application.Users.Common;

public record UserResult(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string Role)
{
    public string AvatarUrl { get; init; } = string.Empty;
}

