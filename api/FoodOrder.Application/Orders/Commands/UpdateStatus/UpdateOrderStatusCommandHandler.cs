using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Orders.Common;
using FoodOrder.Domain.Common.Errors;
using FoodOrder.Domain.Common;
using FoodOrder.Domain.Entities;

namespace FoodOrder.Application.Orders.Commands.UpdateStatus;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, ErrorOr<OrderResult>>
{
    private readonly IOrderRepository _orderRepository;

    public UpdateOrderStatusCommandHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<ErrorOr<OrderResult>> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.Id);
        if (order is null)
        {
            return Errors.Order.NotFound;
        }

        // Cannot update if already delivered
        if (order.Status == OrderStatus.DELIVERED)
        {
            return Errors.Order.InvalidStatus;
        }

        // Parse the requested status
        if (!Enum.TryParse<OrderStatus>(request.Status, ignoreCase: true, out var newStatus))
        {
            return Errors.Order.InvalidStatus;
        }

        // Validate and apply state transition based on role
        var validationError = ValidateAndApplyTransition(order, newStatus, request.UserRole, request.UserId);
        if (validationError is not null)
        {
            return Errors.Order.InvalidStatus; // there is a error here
        }

        await _orderRepository.UpdateAsync(order);

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

    private Error? ValidateAndApplyTransition(Order order, OrderStatus newStatus, string userRole, Guid? userId)
    {
        // Define valid transitions based on role
        var validTransitions = GetValidTransitions(order.Status, userRole);

        if (!validTransitions.Contains(newStatus))
        {
            return Errors.Order.InvalidStatus;
        }

        // Handle automatic transitions
        if (newStatus == OrderStatus.CONFIRMED)
        {
            // Automatically transition to PREPARING after CONFIRMED
            order.Status = OrderStatus.PREPARING;
        }
        else if (newStatus == OrderStatus.PICKED_UP)
        {
            // Automatically transition to ON_THE_WAY after PICKED_UP
            order.Status = OrderStatus.ON_THE_WAY;
            // Assign delivery boy when order is picked up
            if (userId.HasValue)
            {
                order.DeliveryBoyId = userId.Value;
            }
        }
        else
        {
            // Apply the transition directly
            order.Status = newStatus;
        }

        return null; // No error
    }

    private HashSet<OrderStatus> GetValidTransitions(OrderStatus currentStatus, string userRole)
    {
        var transitions = new HashSet<OrderStatus>();

        switch (currentStatus)
        {
            case OrderStatus.PLACED:
                // Restaurant (Seller/Admin) can confirm
                if (userRole == "Seller" || userRole == "Admin")
                {
                    transitions.Add(OrderStatus.CONFIRMED);
                }
                break;

            case OrderStatus.CONFIRMED:
                // System automatically transitions to PREPARING
                // Restaurant can mark as READY
                if (userRole == "Seller" || userRole == "Admin")
                {
                    transitions.Add(OrderStatus.READY);
                }
                break;

            case OrderStatus.PREPARING:
                // Restaurant can mark as READY
                if (userRole == "Seller" || userRole == "Admin")
                {
                    transitions.Add(OrderStatus.READY);
                }
                break;

            case OrderStatus.READY:
                // Delivery boy can pick up
                if (userRole == "DeliveryBoy" || userRole == "Admin")
                {
                    transitions.Add(OrderStatus.PICKED_UP);
                }
                break;

            case OrderStatus.PICKED_UP:
                // System automatically transitions to ON_THE_WAY
                // Delivery boy can mark as DELIVERED
                if (userRole == "DeliveryBoy" || userRole == "Admin")
                {
                    transitions.Add(OrderStatus.DELIVERED);
                }
                break;

            case OrderStatus.ON_THE_WAY:
                // Delivery boy can mark as DELIVERED
                if (userRole == "DeliveryBoy" || userRole == "Admin")
                {
                    transitions.Add(OrderStatus.DELIVERED);
                }
                break;
        }

        return transitions;
    }
}
