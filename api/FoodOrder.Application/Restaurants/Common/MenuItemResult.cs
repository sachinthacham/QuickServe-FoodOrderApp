namespace FoodOrder.Application.Restaurants.Common;

public record MenuItemResult(
    Guid Id,
    Guid RestaurantId,
    string Name,
    string Description,
    decimal Price)
{
    public string ImageUrl { get; init; } = string.Empty;
}

