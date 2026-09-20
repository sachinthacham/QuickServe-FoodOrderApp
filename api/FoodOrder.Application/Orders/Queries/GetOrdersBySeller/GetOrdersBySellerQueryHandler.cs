using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Orders.Common;
using FoodOrder.Application.Common.Interfaces.Persistence;

namespace FoodOrder.Application.Orders.Queries.GetOrdersBySeller;

public class GetOrdersBySellerQueryHandler : IRequestHandler<GetOrdersBySellerQuery, ErrorOr<List<OrderResult>>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IRestaurantRepository _restaurantRepository;

    public GetOrdersBySellerQueryHandler(
        IOrderRepository orderRepository,
        IRestaurantRepository restaurantRepository)
    {
        _orderRepository = orderRepository;
        _restaurantRepository = restaurantRepository;
    }

    public async Task<ErrorOr<List<OrderResult>>> Handle(GetOrdersBySellerQuery request, CancellationToken cancellationToken)
    {
        // Get all restaurants owned by the seller
        var restaurants = await _restaurantRepository.GetBySellerIdAsync(request.SellerId);
        var restaurantIds = restaurants.Select(r => r.Id).ToList();

        if (!restaurantIds.Any())
        {
            return new List<OrderResult>();
        }

        // Get all orders for these restaurants
        var orders = await _orderRepository.GetByRestaurantIdsAsync(restaurantIds);

        return orders.Select(o => new OrderResult(
            o.Id,
            o.UserId,
            o.RestaurantId,
            o.OrderDateTime,
            o.TotalAmount,
            o.Status.ToString(),
            o.Items.Select(i => new OrderItemResult(
                i.Id,
                i.MenuItemId,
                i.Name,
                i.Price,
                i.Quantity) { ImageUrl = i.ImageUrl }).ToList())).ToList();
    }
}

