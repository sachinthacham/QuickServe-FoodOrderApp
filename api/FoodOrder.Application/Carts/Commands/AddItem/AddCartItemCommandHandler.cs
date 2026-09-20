using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Carts.Common;
using FoodOrder.Domain.Common.Errors;
using FoodOrder.Domain.Entities;

namespace FoodOrder.Application.Carts.Commands.AddItem;

public class AddCartItemCommandHandler : IRequestHandler<AddCartItemCommand, ErrorOr<CartResult>>
{
    private readonly ICartRepository _cartRepository;
    private readonly IMenuItemRepository _menuItemRepository;
    private readonly IRestaurantRepository _restaurantRepository;

    public AddCartItemCommandHandler(
        ICartRepository cartRepository,
        IMenuItemRepository menuItemRepository,
        IRestaurantRepository restaurantRepository)
    {
        _cartRepository = cartRepository;
        _menuItemRepository = menuItemRepository;
        _restaurantRepository = restaurantRepository;
    }

    public async Task<ErrorOr<CartResult>> Handle(AddCartItemCommand request, CancellationToken cancellationToken)
    {
        try
        {
            Console.WriteLine($"AddCartItemCommandHandler: UserId={request.UserId}, MenuItemId={request.MenuItemId}, Quantity={request.Quantity}");

            // 1. Get menu item
            var menuItem = await _menuItemRepository.GetByIdAsync(request.MenuItemId);
            if (menuItem is null)
            {
                Console.WriteLine($"MenuItem {request.MenuItemId} not found");
                return Errors.MenuItem.NotFound;
            }
            Console.WriteLine($"MenuItem found: {menuItem.Name}, RestaurantId: {menuItem.RestaurantId}");

            // 2. Get restaurant
            var restaurant = await _restaurantRepository.GetByIdAsync(menuItem.RestaurantId);
            if (restaurant is null)
            {
                Console.WriteLine($"Restaurant {menuItem.RestaurantId} not found");
                return Errors.Order.RestaurantNotFound;
            }
            Console.WriteLine($"Restaurant found: {restaurant.Name}");

            // 3. Get existing cart for user
            var cart = await _cartRepository.GetByUserIdAsync(request.UserId);
            bool isNewCart = cart is null;
            
            if (cart is null)
            {
                Console.WriteLine($"Creating new cart for user {request.UserId}");
                // Create new cart and prepare to persist together with items
                cart = new Cart
                {
                    Id = Guid.NewGuid(),
                    UserId = request.UserId,
                    RestaurantId = menuItem.RestaurantId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Items = new List<CartItem>()
                };
                Console.WriteLine($"New cart created with ID: {cart.Id}");
            }
            else
            {
                Console.WriteLine($"Existing cart found: {cart.Id}, Restaurant: {cart.RestaurantId}");
                
                // Check if trying to add from different restaurant
                if (cart.RestaurantId != menuItem.RestaurantId)
                {
                    Console.WriteLine($"Switching restaurant from {cart.RestaurantId} to {menuItem.RestaurantId}");
                    
                    // Ensure items collection exists before clearing
                    cart.Items ??= new List<CartItem>();
                    
                    // Clear existing items and switch restaurant
                    cart.Items.Clear();
                    cart.RestaurantId = menuItem.RestaurantId;
                    cart.UpdatedAt = DateTime.UtcNow;
                }
            }

            // 4. Check if item already exists in cart
            // Ensure Items is initialized
            if (cart.Items == null)
            {
                cart.Items = new List<CartItem>();
            }
            
            var existingItem = cart.Items.FirstOrDefault(i => i.MenuItemId == request.MenuItemId);
            
            if (existingItem is not null)
            {
                Console.WriteLine($"Updating existing item quantity from {existingItem.Quantity} to {existingItem.Quantity + request.Quantity}");
                // Update quantity
                existingItem.Quantity += request.Quantity;
                existingItem.Price = menuItem.Price; // Update price in case it changed
                existingItem.MenuItemName = menuItem.Name; // Update name in case it changed
            }
            else
            {
                Console.WriteLine($"Adding new item: {menuItem.Name}, Price: {menuItem.Price}");
                // Add new item
                var newCartItem = new CartItem
                {
                    Id = Guid.NewGuid(),
                    CartId = cart.Id,
                    MenuItemId = menuItem.Id,
                    MenuItemName = menuItem.Name,
                    ImageUrl = menuItem.ImageUrl,
                    Price = menuItem.Price,
                    Quantity = request.Quantity
                };
                cart.Items.Add(newCartItem);
            }

            // 5. Calculate total
            cart.TotalAmount = cart.Items.Sum(i => i.Price * i.Quantity);
            cart.UpdatedAt = DateTime.UtcNow;
            Console.WriteLine($"Cart total: {cart.TotalAmount}");

            // 6. Save cart
            if (isNewCart)
            {
                Console.WriteLine($"Persisting new cart with item(s)");
                await _cartRepository.AddAsync(cart);
            }
            else
            {
                Console.WriteLine($"Updating existing cart in database");
                await _cartRepository.UpdateAsync(cart);
            }

            Console.WriteLine($"Successfully added item to cart");
            
            // 7. Return result
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
        catch (Exception ex)
        {
            Console.WriteLine($"EXCEPTION in AddCartItemCommandHandler:");
            Console.WriteLine($"Message: {ex.Message}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"InnerException: {ex.InnerException.Message}");
            }
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            
            return Error.Unexpected(
                code: "Cart.AddItemFailed",
                description: $"An error occurred: {ex.Message}"
            );
        }
    }
}