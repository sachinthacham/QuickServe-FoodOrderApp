using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Restaurants.Common;
using FoodOrder.Domain.Common.Errors;

namespace FoodOrder.Application.Restaurants.Queries.GetRestaurantsBySeller;

public class GetRestaurantsBySellerQueryHandler : IRequestHandler<GetRestaurantsBySellerQuery, ErrorOr<List<RestaurantResult>>>
{
    private readonly IRestaurantRepository _restaurantRepository;

    public GetRestaurantsBySellerQueryHandler(IRestaurantRepository restaurantRepository)
    {
        _restaurantRepository = restaurantRepository;
    }

    public async Task<ErrorOr<List<RestaurantResult>>> Handle(GetRestaurantsBySellerQuery request, CancellationToken cancellationToken)
    {
        var restaurants = await _restaurantRepository.GetBySellerIdAsync(request.SellerId);

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

