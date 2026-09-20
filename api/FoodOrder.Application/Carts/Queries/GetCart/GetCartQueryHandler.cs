using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Carts.Common;
using FoodOrder.Domain.Common.Errors;
using FoodOrder.Domain.Entities;

namespace FoodOrder.Application.Carts.Queries.GetCart;

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, ErrorOr<CartResult>>
{
    private readonly ICartRepository _cartRepository;

    public GetCartQueryHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<ErrorOr<CartResult>> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        var cart = await _cartRepository.GetByUserIdAsync(request.UserId);
        
        if (cart is null)
        {
            // Return empty cart result
            return new CartResult(
                Guid.Empty,
                request.UserId,
                Guid.Empty,
                DateTime.UtcNow,
                DateTime.UtcNow,
                new List<CartItemResult>());
        }

        return new CartResult(
            cart.Id,
            cart.UserId,
            cart.RestaurantId,
            cart.CreatedAt,
            cart.UpdatedAt,
            cart.Items.Select(i => new CartItemResult(
                i.Id,
                i.MenuItemId,
                i.MenuItemName,
                i.Price,
                i.Quantity) { ImageUrl = i.ImageUrl }).ToList());
    }
}

