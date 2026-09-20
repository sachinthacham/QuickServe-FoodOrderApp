using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Restaurants.Common;
using FoodOrder.Domain.Entities;
using FoodOrder.Domain.Common;

namespace FoodOrder.Application.Restaurants.Commands.Create
{
    public class CreateRestaurantCommandHandler : IRequestHandler<CreateRestaurantCommand, ErrorOr<RestaurantResult>>
    {
        private readonly IRestaurantRepository _restaurantRepository;

        public CreateRestaurantCommandHandler(IRestaurantRepository restaurantRepository)
        {
            _restaurantRepository = restaurantRepository;
        }

        public async Task<ErrorOr<RestaurantResult>> Handle(CreateRestaurantCommand request, CancellationToken cancellationToken)
        {
            var restaurant = new Restaurant
            {
                Name = request.Name,
                Description = request.Description,
                Address = request.Address,
                ImageUrl = StockImages.ForRestaurant(request.Name),
                SellerId = request.SellerId
            };

            await _restaurantRepository.AddAsync(restaurant);

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
}