namespace FoodOrder.Application.Orders.Common;

public record OrderResult(
    Guid Id,
    Guid UserId,
    Guid RestaurantId,
    DateTime OrderDateTime,
    decimal TotalAmount,
    string Status,
    List<OrderItemResult> Items);

public record OrderItemResult(
    Guid Id,
    Guid MenuItemId,
    string Name,
    decimal Price,
    int Quantity)
{
    public string ImageUrl { get; init; } = string.Empty;
}

