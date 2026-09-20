using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Carts.Common;
using FoodOrder.Domain.Common.Errors;

namespace FoodOrder.Application.Carts.Commands.RemoveItem;

public class RemoveCartItemCommandHandler : IRequestHandler<RemoveCartItemCommand, ErrorOr<CartResult>>
{
    private readonly ICartRepository _cartRepository;

    public RemoveCartItemCommandHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<ErrorOr<CartResult>> Handle(RemoveCartItemCommand request, CancellationToken cancellationToken)
    {
        var cart = await _cartRepository.GetByUserIdAsync(request.UserId);
        if (cart is null)
        {
            return Errors.Order.NotFound; // Cart not found
        }

        var cartItem = cart.Items.FirstOrDefault(i => i.Id == request.CartItemId);
        if (cartItem is null)
        {
            return Errors.Order.NotFound; // Cart item not found
        }

        cart.Items.Remove(cartItem);
        await _cartRepository.UpdateAsync(cart);

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

