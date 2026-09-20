using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Orders.Common;
using FoodOrder.Domain.Common.Errors;
using FoodOrder.Domain.Common;

namespace FoodOrder.Application.Orders.Queries.GetOrder;

public class GetOrderQueryHandler : IRequestHandler<GetOrderQuery, ErrorOr<OrderResult>>
{
    private readonly IOrderRepository _orderRepository;

    public GetOrderQueryHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<ErrorOr<OrderResult>> Handle(GetOrderQuery request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.Id);
        if (order is null)
        {
            return Errors.Order.NotFound;
        }

        // Authorization check: User can only view their own orders unless they have special roles
        // This check should be done in the controller, but we validate here as well for security
        if (request.UserId.HasValue && order.UserId != request.UserId.Value)
        {
            return Errors.Order.NotFound; // Return NotFound instead of Forbidden to prevent information leakage
        }

        return new OrderResult(
            order.Id,
            order.UserId,
            order.RestaurantId,
            order.OrderDateTime,
            order.TotalAmount,
            order.Status.ToString(),
            order.Items.Select(i => new OrderItemResult(
                i.Id,
                i.MenuItemId,
                i.Name,
                i.Price,
                i.Quantity) { ImageUrl = i.ImageUrl }).ToList());
    }
}

