using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Restaurants.Common;
using FoodOrder.Domain.Common.Errors;
using FoodOrder.Domain.Entities;
using FoodOrder.Domain.Common;

namespace FoodOrder.Application.Restaurants.Commands.Create;

public class CreateMenuItemCommandHandler : IRequestHandler<CreateMenuItemCommand, ErrorOr<MenuItemResult>>
{
    private readonly IMenuItemRepository _menuItemRepository;
    private readonly IRestaurantRepository _restaurantRepository;

    public CreateMenuItemCommandHandler(
        IMenuItemRepository menuItemRepository,
        IRestaurantRepository restaurantRepository)
    {
        _menuItemRepository = menuItemRepository;
        _restaurantRepository = restaurantRepository;
    }

    public async Task<ErrorOr<MenuItemResult>> Handle(CreateMenuItemCommand request, CancellationToken cancellationToken)
    {
        // Validate restaurant exists
        var restaurant = await _restaurantRepository.GetByIdAsync(request.RestaurantId);
        if (restaurant is null)
        {
            return Errors.Restaurant.NotFound;
        }

        // Validate price
        if (request.Price <= 0)
        {
            return Errors.MenuItem.InvalidPrice;
        }

        var menuItem = new MenuItem
        {
            RestaurantId = request.RestaurantId,
            Name = request.Name,
            Description = request.Description,
            ImageUrl = StockImages.ForFood(request.Name),
            Price = request.Price
        };

        await _menuItemRepository.AddAsync(menuItem);

        return new MenuItemResult(
            menuItem.Id,
            menuItem.RestaurantId,
            menuItem.Name,
            menuItem.Description,
            menuItem.Price) { ImageUrl = menuItem.ImageUrl };
    }
}

