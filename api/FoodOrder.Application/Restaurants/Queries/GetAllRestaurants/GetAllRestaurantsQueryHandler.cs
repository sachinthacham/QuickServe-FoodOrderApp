using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Restaurants.Common;

namespace FoodOrder.Application.Restaurants.Queries.GetAllRestaurants;

public class GetAllRestaurantsQueryHandler : IRequestHandler<GetAllRestaurantsQuery, ErrorOr<List<RestaurantResult>>>
{
    private readonly IRestaurantRepository _restaurantRepository;

    public GetAllRestaurantsQueryHandler(IRestaurantRepository restaurantRepository)
    {
        _restaurantRepository = restaurantRepository;
    }

    public async Task<ErrorOr<List<RestaurantResult>>> Handle(GetAllRestaurantsQuery request, CancellationToken cancellationToken)
    {
        var restaurants = await _restaurantRepository.GetAllAsync();

        return restaurants.Select(r => new RestaurantResult(
            r.Id,
            r.Name,
            r.Description,
            r.Address,
            r.MenuItems.Select(m => new MenuItemResult(
                m.Id,
                m.RestaurantId,
                m.Name,
                m.Description,
                m.Price) { ImageUrl = m.ImageUrl }).ToList()) { ImageUrl = r.ImageUrl }).ToList();
    }
}

