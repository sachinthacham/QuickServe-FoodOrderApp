using Bogus;
using FoodOrder.Domain.Common;
using FoodOrder.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FoodOrder.Infrastructure.Persistence;

public static class DataSeeder
{
    public static void SeedData(FoodOrderDbContext context)
    {
        if (context.Users.Count() >= 30)
        {
            return; // DB already has 30+ users
        }

        Randomizer.Seed = new Random(8675309);

        // 1. Users
        var userFaker = new Faker<User>()
            .RuleFor(u => u.Id, f => Guid.NewGuid())
            .RuleFor(u => u.FirstName, f => f.Name.FirstName())
            .RuleFor(u => u.LastName, f => f.Name.LastName())
            .RuleFor(u => u.Email, (f, u) => f.Internet.Email(u.FirstName, u.LastName).ToLower())
            .RuleFor(u => u.Password, f => "password123") // Hardcoded generic placeholder
            .RuleFor(u => u.Role, f => f.PickRandom(UserRole.Buyer, UserRole.Seller, UserRole.DeliveryBoy));

        var users = userFaker.Generate(40);
        
        // Ensure at least 5 sellers
        for (int i = 0; i < 5; i++) { users[i].Role = UserRole.Seller; }
        // Ensure at least 5 delivery
        for (int i = 5; i < 10; i++) { users[i].Role = UserRole.DeliveryBoy; }
        // Rest buyers
        for (int i = 10; i < 40; i++) { users[i].Role = UserRole.Buyer; }
        
        context.Users.AddRange(users);

        var sellers = users.Where(u => u.Role == UserRole.Seller).ToList();
        var buyers = users.Where(u => u.Role == UserRole.Buyer).ToList();
        var delivery = users.Where(u => u.Role == UserRole.DeliveryBoy).ToList();

        // 2. Addresses
        var addressFaker = new Faker<Address>()
            .RuleFor(a => a.Id, f => Guid.NewGuid())
            .RuleFor(a => a.UserId, f => f.PickRandom(users).Id)
            .RuleFor(a => a.Street, f => f.Address.StreetAddress())
            .RuleFor(a => a.City, f => f.Address.City())
            .RuleFor(a => a.State, f => f.Address.StateAbbr())
            .RuleFor(a => a.ZipCode, f => f.Address.ZipCode())
            .RuleFor(a => a.Country, f => "USA")
            .RuleFor(a => a.IsDefault, f => true);

        var addresses = addressFaker.Generate(45);
        context.Addresses.AddRange(addresses);

        // 3. Restaurants
        var restaurantImages = new[] { 
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2070",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=2070",
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1974",
            "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=1974"
        };
        
        var restaurantFaker = new Faker<Restaurant>()
            .RuleFor(r => r.Id, f => Guid.NewGuid())
            .RuleFor(r => r.Name, f => f.Company.CompanyName() + " Restaurant")
            .RuleFor(r => r.Description, f => f.Lorem.Paragraph())
            .RuleFor(r => r.Address, f => f.Address.FullAddress())
            .RuleFor(r => r.SellerId, f => f.PickRandom(sellers).Id);

        var restaurants = restaurantFaker.Generate(35);
        context.Restaurants.AddRange(restaurants);

        // 4. Menu Items
        var menuImages = new[] {
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1999",
            "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=1965",
            "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=2070"
        };

        var menuItemFaker = new Faker<MenuItem>()
            .RuleFor(m => m.Id, f => Guid.NewGuid())
            .RuleFor(m => m.RestaurantId, f => f.PickRandom(restaurants).Id)
            .RuleFor(m => m.Name, f => f.Commerce.ProductName())
            .RuleFor(m => m.Description, f => f.Commerce.ProductDescription())
            .RuleFor(m => m.Price, f => Math.Round(f.Random.Decimal(5.99m, 45.99m), 2));

        var menuItems = menuItemFaker.Generate(150);
        context.MenuItems.AddRange(menuItems);

        // 5. Orders and OrderItems
        var orderStatuses = new[] { OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.PICKED_UP, OrderStatus.ON_THE_WAY, OrderStatus.DELIVERED };
        var orders = new List<Order>();
        var orderItems = new List<OrderItem>();
        
        var orderFaker = new Faker<Order>()
            .RuleFor(o => o.Id, f => Guid.NewGuid())
            .RuleFor(o => o.UserId, f => f.PickRandom(buyers).Id)
            .RuleFor(o => o.RestaurantId, f => f.PickRandom(restaurants).Id)
            .RuleFor(o => o.DeliveryBoyId, f => f.PickRandom(delivery).Id)
            .RuleFor(o => o.OrderDateTime, f => f.Date.Past(1))
            .RuleFor(o => o.Status, f => f.PickRandom(orderStatuses));

        var generatedOrders = orderFaker.Generate(40);
        
        foreach(var order in generatedOrders)
        {
            // Pick a random number of items for this order from the order's restaurant
            var restaurantItems = menuItems.Where(m => m.RestaurantId == order.RestaurantId).ToList();
            if(!restaurantItems.Any()) continue;
            
            int itemCount = new Random().Next(1, 5);
            decimal total = 0;
            
            for(int i=0; i<itemCount; i++)
            {
                var randomItem = restaurantItems[new Random().Next(restaurantItems.Count)];
                int qty = new Random().Next(1, 4);
                
                var orderItem = new OrderItem {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    MenuItemId = randomItem.Id,
                    Name = randomItem.Name,
                    Quantity = qty,
                    Price = randomItem.Price
                };
                
                total += (qty * randomItem.Price);
                orderItems.Add(orderItem);
            }
            order.TotalAmount = total;
            orders.Add(order);
        }
        
        context.Orders.AddRange(orders);
        context.OrderItems.AddRange(orderItems);

        // 6. Reviews
        var reviewFaker = new Faker<Review>()
            .RuleFor(r => r.Id, f => Guid.NewGuid())
            .RuleFor(r => r.UserId, f => f.PickRandom(buyers).Id)
            .RuleFor(r => r.RestaurantId, f => f.PickRandom(restaurants).Id)
            .RuleFor(r => r.Rating, f => f.Random.Int(1, 5))
            .RuleFor(r => r.Comment, f => f.Rant.Review())
            .RuleFor(r => r.CreatedAt, f => f.Date.Past(1));

        var reviews = reviewFaker.Generate(45);
        context.Reviews.AddRange(reviews);

        context.SaveChanges();
    }
}
