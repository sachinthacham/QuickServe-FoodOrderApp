using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Orders.Common;
using FoodOrder.Domain.Common;

namespace FoodOrder.Application.Orders.Queries.GetAllOrders;

public class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, ErrorOr<List<OrderResult>>>
{
    private readonly IOrderRepository _orderRepository;

    public GetAllOrdersQueryHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<ErrorOr<List<OrderResult>>> Handle(GetAllOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await _orderRepository.GetAllAsync();

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

