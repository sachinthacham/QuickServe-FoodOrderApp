using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Orders.Common;
using FoodOrder.Domain.Common.Errors;
using FoodOrder.Domain.Entities;
using FoodOrder.Domain.Common;

namespace FoodOrder.Application.Orders.Commands.Create
{
    public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, ErrorOr<OrderResult>>
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IRestaurantRepository _restaurantRepository;
        private readonly ICartRepository _cartRepository;

        public CreateOrderCommandHandler(
            IOrderRepository orderRepository, 
            IRestaurantRepository restaurantRepository,
            ICartRepository cartRepository)
        {
            _orderRepository = orderRepository;
            _restaurantRepository = restaurantRepository;
            _cartRepository = cartRepository;
        }

        public async Task<ErrorOr<OrderResult>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            // 1. Fetch Restaurant to validate items and prices
            var restaurant = await _restaurantRepository.GetByIdAsync(request.RestaurantId);
            if (restaurant is null)
            {
                return Errors.Order.RestaurantNotFound;
            }

            // 2. Validate items are not empty
            if (request.Items == null || !request.Items.Any())
            {
                return Errors.Order.EmptyItems;
            }

            var order = new Order
            {
                UserId = request.UserId,
                RestaurantId = request.RestaurantId,
                OrderDateTime = DateTime.UtcNow,
                Status = OrderStatus.PLACED
            };

            foreach (var itemCommand in request.Items)
            {
                var menuItem = restaurant.MenuItems.FirstOrDefault(m => m.Id == itemCommand.MenuItemId);
                if (menuItem is not null)
                {
                    order.Items.Add(new OrderItem
                    {
                        OrderId = order.Id,
                        MenuItemId = menuItem.Id,
                        Name = menuItem.Name,
                        ImageUrl = menuItem.ImageUrl,
                        Price = menuItem.Price,
                        Quantity = itemCommand.Quantity
                    });
                }
            }

            if (!order.Items.Any())
            {
                return Errors.Order.EmptyItems;
            }

            order.TotalAmount = order.Items.Sum(i => i.Price * i.Quantity);

            await _orderRepository.AddAsync(order);

            // Note: Cart will be cleared after payment confirmation

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
}
