using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Restaurants.Common;
using FoodOrder.Domain.Common.Errors;

namespace FoodOrder.Application.Restaurants.Commands.Update;

public class UpdateRestaurantCommandHandler : IRequestHandler<UpdateRestaurantCommand, ErrorOr<RestaurantResult>>
{
    private readonly IRestaurantRepository _restaurantRepository;

    public UpdateRestaurantCommandHandler(IRestaurantRepository restaurantRepository)
    {
        _restaurantRepository = restaurantRepository;
    }

    public async Task<ErrorOr<RestaurantResult>> Handle(UpdateRestaurantCommand request, CancellationToken cancellationToken)
    {
        var restaurant = await _restaurantRepository.GetByIdAsync(request.Id);
        if (restaurant is null)
        {
            return Errors.Restaurant.NotFound;
        }

        restaurant.Name = request.Name;
        restaurant.Description = request.Description;
        restaurant.Address = request.Address;

        await _restaurantRepository.UpdateAsync(restaurant);

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

