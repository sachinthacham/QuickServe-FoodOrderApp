using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Restaurants.Common;
using FoodOrder.Domain.Common.Errors;

namespace FoodOrder.Application.Restaurants.Queries.GetRestaurant;

public class GetRestaurantQueryHandler : IRequestHandler<GetRestaurantQuery, ErrorOr<RestaurantResult>>
{
    private readonly IRestaurantRepository _restaurantRepository;

    public GetRestaurantQueryHandler(IRestaurantRepository restaurantRepository)
    {
        _restaurantRepository = restaurantRepository;
    }

    public async Task<ErrorOr<RestaurantResult>> Handle(GetRestaurantQuery request, CancellationToken cancellationToken)
    {
        var restaurant = await _restaurantRepository.GetByIdAsync(request.Id);
        if (restaurant is null)
        {
            return Errors.Restaurant.NotFound;
        }

        return new RestaurantResult(
            restaurant.Id,
            restaurant.Name,
            restaurant.Description,
            restaurant.Address,
            restaurant.MenuItems.Select(m => new MenuItemResult(
                m.Id,
                m.RestaurantId,
                m.Name,
                m.Description,
                m.Price) { ImageUrl = m.ImageUrl }).ToList()) { ImageUrl = restaurant.ImageUrl };
    }
}

