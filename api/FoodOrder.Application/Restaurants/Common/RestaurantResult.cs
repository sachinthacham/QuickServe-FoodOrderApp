namespace FoodOrder.Application.Restaurants.Common;

public record RestaurantResult(
    Guid Id,
    string Name,
    string Description,
    string Address,
    List<MenuItemResult> MenuItems)
{
    public string ImageUrl { get; init; } = string.Empty;
}

