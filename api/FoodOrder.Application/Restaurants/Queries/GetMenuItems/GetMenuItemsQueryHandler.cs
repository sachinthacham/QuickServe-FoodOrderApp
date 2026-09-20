using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Restaurants.Common;
using FoodOrder.Domain.Common.Errors;

namespace FoodOrder.Application.Restaurants.Queries.GetMenuItems;

public class GetMenuItemsQueryHandler : IRequestHandler<GetMenuItemsQuery, ErrorOr<List<MenuItemResult>>>
{
    private readonly IMenuItemRepository _menuItemRepository;
    private readonly IRestaurantRepository _restaurantRepository;

    public GetMenuItemsQueryHandler(
        IMenuItemRepository menuItemRepository,
        IRestaurantRepository restaurantRepository)
    {
        _menuItemRepository = menuItemRepository;
        _restaurantRepository = restaurantRepository;
    }

    public async Task<ErrorOr<List<MenuItemResult>>> Handle(GetMenuItemsQuery request, CancellationToken cancellationToken)
    {
        // Validate restaurant exists
        var restaurant = await _restaurantRepository.GetByIdAsync(request.RestaurantId);
        if (restaurant is null)
        {
            return Errors.Restaurant.NotFound;
        }

        var menuItems = await _menuItemRepository.GetByRestaurantIdAsync(request.RestaurantId);

        return menuItems.Select(m => new MenuItemResult(
            m.Id,
            m.RestaurantId,
            m.Name,
            m.Description,
            m.Price) { ImageUrl = m.ImageUrl }).ToList();
    }
}

