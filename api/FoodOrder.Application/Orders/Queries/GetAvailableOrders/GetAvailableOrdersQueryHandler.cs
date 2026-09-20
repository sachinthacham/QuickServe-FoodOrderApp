using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Orders.Common;
using FoodOrder.Domain.Common;

namespace FoodOrder.Application.Orders.Queries.GetAvailableOrders;

public class GetAvailableOrdersQueryHandler : IRequestHandler<GetAvailableOrdersQuery, ErrorOr<List<OrderResult>>>
{
    private readonly IOrderRepository _orderRepository;

    public GetAvailableOrdersQueryHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<ErrorOr<List<OrderResult>>> Handle(GetAvailableOrdersQuery request, CancellationToken cancellationToken)
    {
        // Get orders that are READY for delivery (not yet assigned)
        var orders = await _orderRepository.GetByStatusAsync(OrderStatus.READY);
        
        // Filter out orders that are already assigned to a delivery boy
        var availableOrders = orders.Where(o => o.DeliveryBoyId == null).ToList();

        return availableOrders.Select(o => new OrderResult(
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

