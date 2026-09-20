using ErrorOr;
using MediatR;
using FoodOrder.Application.common.Interfaces.Persistence;
using FoodOrder.Application.Restaurants.Common;
using FoodOrder.Domain.Common.Errors;

namespace FoodOrder.Application.Restaurants.Commands.Update;

public class UpdateMenuItemCommandHandler : IRequestHandler<UpdateMenuItemCommand, ErrorOr<MenuItemResult>>
{
    private readonly IMenuItemRepository _menuItemRepository;

    public UpdateMenuItemCommandHandler(IMenuItemRepository menuItemRepository)
    {
        _menuItemRepository = menuItemRepository;
    }

    public async Task<ErrorOr<MenuItemResult>> Handle(UpdateMenuItemCommand request, CancellationToken cancellationToken)
    {
        var menuItem = await _menuItemRepository.GetByIdAsync(request.Id);
        if (menuItem is null)
        {
            return Errors.MenuItem.NotFound;
        }

        if (request.Price <= 0)
        {
            return Errors.MenuItem.InvalidPrice;
        }

        menuItem.Name = request.Name;
        menuItem.Description = request.Description;
        menuItem.Price = request.Price;

        await _menuItemRepository.UpdateAsync(menuItem);

        return new MenuItemResult(
            menuItem.Id,
            menuItem.RestaurantId,
            menuItem.Name,
            menuItem.Description,
            menuItem.Price) { ImageUrl = menuItem.ImageUrl };
    }
}

