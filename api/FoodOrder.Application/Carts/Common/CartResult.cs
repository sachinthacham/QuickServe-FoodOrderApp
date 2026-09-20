namespace FoodOrder.Application.Carts.Common;

public record CartResult(
    Guid Id,
    Guid UserId,
    Guid RestaurantId,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<CartItemResult> Items);

public record CartItemResult(
    Guid Id,
    Guid MenuItemId,
    string MenuItemName,
    decimal Price,
    int Quantity)
{
    public string ImageUrl { get; init; } = string.Empty;
}

