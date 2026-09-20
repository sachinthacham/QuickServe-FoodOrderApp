using Bogus;
using FoodOrder.Domain.Common;
using FoodOrder.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FoodOrder.Infrastructure.Persistence;

public static class DataSeeder
{
    private const string DemoPassword = "password123";

    private sealed record DishSeed(string Name, string Description, decimal Price);

    private sealed record RestaurantSeed(
        string Name,
        string Description,
        string Address,
        DishSeed[] Dishes);

    // Each step is guarded by its own table so a partially seeded database fills in
    // the gaps rather than duplicating what is already there.
    public static void SeedData(FoodOrderDbContext context)
    {
        SeedUsers(context);
        SeedRestaurants(context);
        SeedAddresses(context);
        SeedOrders(context);
        SeedReviews(context);
        SeedFavorites(context);
        SeedCarts(context);
    }

    private static void SeedUsers(FoodOrderDbContext context)
    {
        var demoAccounts = new[]
        {
            new User { FirstName = "Demo", LastName = "Admin", Email = "admin@foodie.com", Role = UserRole.Admin },
            new User { FirstName = "Demo", LastName = "Seller", Email = "seller@foodie.com", Role = UserRole.Seller },
            new User { FirstName = "Demo", LastName = "Buyer", Email = "buyer@foodie.com", Role = UserRole.Buyer },
            new User { FirstName = "Demo", LastName = "Delivery", Email = "delivery@foodie.com", Role = UserRole.DeliveryBoy },
        };

        foreach (var account in demoAccounts)
        {
            if (!context.Users.Any(u => u.Email == account.Email))
            {
                account.Password = DemoPassword;
                account.AvatarUrl = StockImages.ForUser(account.Email);
                context.Users.Add(account);
            }
        }

        context.SaveChanges();

        if (context.Users.Count() >= 30)
        {
            return;
        }

        Randomizer.Seed = new Random(8675309);

        var userFaker = new Faker<User>()
            .RuleFor(u => u.Id, f => Guid.NewGuid())
            .RuleFor(u => u.FirstName, f => f.Name.FirstName())
            .RuleFor(u => u.LastName, f => f.Name.LastName())
            .RuleFor(u => u.Email, (f, u) => f.Internet.Email(u.FirstName, u.LastName, uniqueSuffix: f.UniqueIndex.ToString()).ToLower())
            .RuleFor(u => u.Password, f => DemoPassword)
            .RuleFor(u => u.Role, f => UserRole.Buyer);

        var users = userFaker.Generate(36);

        for (var i = 0; i < 6; i++) { users[i].Role = UserRole.Seller; }
        for (var i = 6; i < 12; i++) { users[i].Role = UserRole.DeliveryBoy; }

        foreach (var user in users)
        {
            user.AvatarUrl = StockImages.ForUser(user.Email);
        }

        context.Users.AddRange(users);
        context.SaveChanges();
    }

    private static void SeedRestaurants(FoodOrderDbContext context)
    {
        if (context.Restaurants.Any())
        {
            return;
        }

        var sellers = context.Users.Where(u => u.Role == UserRole.Seller).ToList();
        var demoSeller = context.Users.First(u => u.Email == "seller@foodie.com");

        var catalogue = BuildCatalogue();

        for (var i = 0; i < catalogue.Length; i++)
        {
            var seed = catalogue[i];

            // The demo seller owns the first few so their dashboard is populated on login.
            var owner = i < 3 ? demoSeller : sellers[i % sellers.Count];

            var restaurant = new Restaurant
            {
                Id = Guid.NewGuid(),
                Name = seed.Name,
                Description = seed.Description,
                Address = seed.Address,
                ImageUrl = StockImages.Restaurants[i % StockImages.Restaurants.Length],
                SellerId = owner.Id,
            };

            context.Restaurants.Add(restaurant);

            foreach (var dish in seed.Dishes)
            {
                context.MenuItems.Add(new MenuItem
                {
                    Id = Guid.NewGuid(),
                    RestaurantId = restaurant.Id,
                    Name = dish.Name,
                    Description = dish.Description,
                    Price = dish.Price,
                    ImageUrl = StockImages.ForFood(dish.Name),
                });
            }
        }

        context.SaveChanges();
    }

    private static void SeedAddresses(FoodOrderDbContext context)
    {
        if (context.Addresses.Any())
        {
            return;
        }

        Randomizer.Seed = new Random(20260920);
        var faker = new Faker();
        var buyers = context.Users.Where(u => u.Role == UserRole.Buyer).ToList();
        var addresses = new List<Address>();

        foreach (var buyer in buyers)
        {
            addresses.Add(new Address
            {
                Id = Guid.NewGuid(),
                UserId = buyer.Id,
                Label = "Home",
                Street = faker.Address.StreetAddress(),
                City = faker.Address.City(),
                State = faker.Address.StateAbbr(),
                ZipCode = faker.Address.ZipCode(),
                Country = "USA",
                IsDefault = true,
            });

            addresses.Add(new Address
            {
                Id = Guid.NewGuid(),
                UserId = buyer.Id,
                Label = "Work",
                Street = faker.Address.StreetAddress(),
                City = faker.Address.City(),
                State = faker.Address.StateAbbr(),
                ZipCode = faker.Address.ZipCode(),
                Country = "USA",
                IsDefault = false,
            });
        }

        context.Addresses.AddRange(addresses);
        context.SaveChanges();
    }

    private static void SeedOrders(FoodOrderDbContext context)
    {
        if (context.Orders.Any())
        {
            return;
        }

        var random = new Random(4242);
        var buyers = context.Users.Where(u => u.Role == UserRole.Buyer).ToList();
        var deliveryStaff = context.Users.Where(u => u.Role == UserRole.DeliveryBoy).ToList();
        var demoBuyer = context.Users.First(u => u.Email == "buyer@foodie.com");
        var demoDelivery = context.Users.First(u => u.Email == "delivery@foodie.com");
        var demoSeller = context.Users.First(u => u.Email == "seller@foodie.com");

        var restaurants = context.Restaurants.ToList();
        var menuItems = context.MenuItems.ToList();
        var demoSellerRestaurantIds = restaurants
            .Where(r => r.SellerId == demoSeller.Id)
            .Select(r => r.Id)
            .ToList();

        var orders = new List<Order>();

        Order BuildOrder(Guid buyerId, Restaurant restaurant, OrderStatus status, Guid? deliveryBoyId, int daysAgo)
        {
            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = buyerId,
                RestaurantId = restaurant.Id,
                DeliveryBoyId = deliveryBoyId,
                OrderDateTime = DateTime.UtcNow.AddDays(-daysAgo).AddHours(-random.Next(0, 12)),
                Status = status,
            };

            var choices = menuItems.Where(m => m.RestaurantId == restaurant.Id).ToList();
            decimal total = 0;

            foreach (var item in choices.OrderBy(_ => random.Next()).Take(random.Next(1, 4)))
            {
                var quantity = random.Next(1, 4);
                order.Items.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    MenuItemId = item.Id,
                    Name = item.Name,
                    ImageUrl = item.ImageUrl,
                    Price = item.Price,
                    Quantity = quantity,
                });

                total += item.Price * quantity;
            }

            order.TotalAmount = total;
            return order;
        }

        // Demo buyer sees one order in every stage of the lifecycle.
        var lifecycle = new[]
        {
            OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PREPARING,
            OrderStatus.READY, OrderStatus.PICKED_UP, OrderStatus.ON_THE_WAY, OrderStatus.DELIVERED,
        };

        for (var i = 0; i < lifecycle.Length; i++)
        {
            var status = lifecycle[i];
            var assigned = status is OrderStatus.PICKED_UP or OrderStatus.ON_THE_WAY or OrderStatus.DELIVERED
                ? demoDelivery.Id
                : (Guid?)null;

            orders.Add(BuildOrder(demoBuyer.Id, restaurants[i % restaurants.Count], status, assigned, i + 1));
        }

        // Demo delivery rider needs a history of completed runs.
        for (var i = 0; i < 6; i++)
        {
            var buyer = buyers[random.Next(buyers.Count)];
            orders.Add(BuildOrder(buyer.Id, restaurants[random.Next(restaurants.Count)], OrderStatus.DELIVERED, demoDelivery.Id, i + 8));
        }

        // Unassigned READY orders so the rider's "available" queue is not empty.
        for (var i = 0; i < 5; i++)
        {
            var buyer = buyers[random.Next(buyers.Count)];
            orders.Add(BuildOrder(buyer.Id, restaurants[random.Next(restaurants.Count)], OrderStatus.READY, null, i));
        }

        // Demo seller's restaurants need revenue and a live order queue.
        for (var i = 0; i < 18; i++)
        {
            var buyer = buyers[random.Next(buyers.Count)];
            var restaurant = restaurants.First(r => r.Id == demoSellerRestaurantIds[i % demoSellerRestaurantIds.Count]);
            var status = i % 4 == 0 ? OrderStatus.PLACED : OrderStatus.DELIVERED;
            var assigned = status == OrderStatus.DELIVERED ? deliveryStaff[random.Next(deliveryStaff.Count)].Id : (Guid?)null;
            orders.Add(BuildOrder(buyer.Id, restaurant, status, assigned, i + 2));
        }

        // General background volume across the whole platform for the admin dashboard.
        for (var i = 0; i < 40; i++)
        {
            var buyer = buyers[random.Next(buyers.Count)];
            var restaurant = restaurants[random.Next(restaurants.Count)];
            var status = lifecycle[random.Next(lifecycle.Length)];
            var assigned = status is OrderStatus.PICKED_UP or OrderStatus.ON_THE_WAY or OrderStatus.DELIVERED
                ? deliveryStaff[random.Next(deliveryStaff.Count)].Id
                : (Guid?)null;

            orders.Add(BuildOrder(buyer.Id, restaurant, status, assigned, random.Next(1, 90)));
        }

        context.Orders.AddRange(orders.Where(o => o.Items.Count > 0));
        context.SaveChanges();
    }

    private static void SeedReviews(FoodOrderDbContext context)
    {
        if (context.Reviews.Any())
        {
            return;
        }

        var comments = new[]
        {
            "Absolutely delicious, arrived hot and on time.",
            "Great flavours but the delivery took a little longer than promised.",
            "Best meal I've ordered all month. Portions were generous.",
            "Solid choice for a weeknight dinner. Will order again.",
            "The packaging kept everything fresh, really impressed.",
            "Good value for the price, though I'd skip the sides next time.",
            "Consistently excellent. This is now our family's go-to.",
            "Tasty food, friendly driver, no complaints at all.",
            "The flavours were rich and authentic. Highly recommend.",
            "Decent, but I've had better from this kitchen before.",
        };

        var random = new Random(777);
        var buyers = context.Users.Where(u => u.Role == UserRole.Buyer).ToList();
        var demoBuyer = context.Users.First(u => u.Email == "buyer@foodie.com");
        var restaurants = context.Restaurants.ToList();
        var reviews = new List<Review>();

        foreach (var restaurant in restaurants)
        {
            var count = random.Next(3, 7);
            for (var i = 0; i < count; i++)
            {
                var author = i == 0 ? demoBuyer : buyers[random.Next(buyers.Count)];
                reviews.Add(new Review
                {
                    Id = Guid.NewGuid(),
                    UserId = author.Id,
                    RestaurantId = restaurant.Id,
                    Rating = random.Next(3, 6),
                    Comment = comments[random.Next(comments.Length)],
                    CreatedAt = DateTime.UtcNow.AddDays(-random.Next(1, 120)),
                });
            }
        }

        context.Reviews.AddRange(reviews);
        context.SaveChanges();
    }

    private static void SeedFavorites(FoodOrderDbContext context)
    {
        if (context.Favorites.Any())
        {
            return;
        }

        var random = new Random(9090);
        var buyers = context.Users.Where(u => u.Role == UserRole.Buyer).ToList();
        var demoBuyer = context.Users.First(u => u.Email == "buyer@foodie.com");
        var restaurants = context.Restaurants.ToList();
        var favorites = new List<Favorite>();

        // Demo buyer keeps a predictable set of favourites.
        foreach (var restaurant in restaurants.Take(4))
        {
            favorites.Add(new Favorite
            {
                Id = Guid.NewGuid(),
                UserId = demoBuyer.Id,
                RestaurantId = restaurant.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-random.Next(1, 40)),
            });
        }

        foreach (var buyer in buyers.Where(b => b.Id != demoBuyer.Id))
        {
            foreach (var restaurant in restaurants.OrderBy(_ => random.Next()).Take(random.Next(0, 4)))
            {
                favorites.Add(new Favorite
                {
                    Id = Guid.NewGuid(),
                    UserId = buyer.Id,
                    RestaurantId = restaurant.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-random.Next(1, 90)),
                });
            }
        }

        context.Favorites.AddRange(favorites);
        context.SaveChanges();
    }

    private static void SeedCarts(FoodOrderDbContext context)
    {
        if (context.Carts.Any())
        {
            return;
        }

        var random = new Random(5150);
        var demoBuyer = context.Users.First(u => u.Email == "buyer@foodie.com");
        var buyers = context.Users
            .Where(u => u.Role == UserRole.Buyer && u.Id != demoBuyer.Id)
            .Take(8)
            .ToList();

        var restaurants = context.Restaurants.ToList();
        var menuItems = context.MenuItems.ToList();

        Cart BuildCart(Guid userId, Restaurant restaurant, int itemCount)
        {
            var cart = new Cart
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                RestaurantId = restaurant.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-random.Next(0, 3)),
                UpdatedAt = DateTime.UtcNow,
            };

            decimal total = 0;

            foreach (var item in menuItems.Where(m => m.RestaurantId == restaurant.Id)
                         .OrderBy(_ => random.Next())
                         .Take(itemCount))
            {
                var quantity = random.Next(1, 3);
                cart.Items.Add(new CartItem
                {
                    Id = Guid.NewGuid(),
                    CartId = cart.Id,
                    MenuItemId = item.Id,
                    MenuItemName = item.Name,
                    ImageUrl = item.ImageUrl,
                    Price = item.Price,
                    Quantity = quantity,
                });

                total += item.Price * quantity;
            }

            cart.TotalAmount = total;
            return cart;
        }

        var carts = new List<Cart> { BuildCart(demoBuyer.Id, restaurants[0], 3) };

        foreach (var buyer in buyers)
        {
            carts.Add(BuildCart(buyer.Id, restaurants[random.Next(restaurants.Count)], random.Next(1, 4)));
        }

        context.Carts.AddRange(carts.Where(c => c.Items.Count > 0));
        context.SaveChanges();
    }

    private static RestaurantSeed[] BuildCatalogue() => new[]
    {
        new RestaurantSeed("Bella Napoli", "Wood-fired Neapolitan pizza made with San Marzano tomatoes and buffalo mozzarella.", "128 Marconi Street, Brooklyn, NY", new[]
        {
            new DishSeed("Margherita Pizza", "Buffalo mozzarella, San Marzano tomato and fresh basil.", 13.50m),
            new DishSeed("Pepperoni Pizza", "Double pepperoni with a smoked mozzarella base.", 15.90m),
            new DishSeed("Quattro Formaggi", "Mozzarella, gorgonzola, fontina and parmesan.", 16.75m),
            new DishSeed("Garlic Focaccia", "Rosemary sea-salt focaccia with roasted garlic oil.", 6.25m),
            new DishSeed("Caprese Salad", "Vine tomatoes, mozzarella di bufala and aged balsamic.", 9.40m),
            new DishSeed("Tiramisu", "Espresso-soaked savoiardi with mascarpone cream.", 7.80m),
        }),
        new RestaurantSeed("The Burger Joint", "Dry-aged smash burgers, hand-cut fries and thick shakes.", "44 Fulton Avenue, Austin, TX", new[]
        {
            new DishSeed("Classic Cheeseburger", "Dry-aged beef, American cheese, pickles and house sauce.", 12.00m),
            new DishSeed("Bacon Deluxe Burger", "Maple bacon, smoked cheddar and crispy onions.", 14.75m),
            new DishSeed("Buttermilk Chicken Burger", "Twice-brined chicken thigh with slaw and chipotle mayo.", 13.25m),
            new DishSeed("Truffle Parmesan Fries", "Hand-cut fries, truffle oil and grated parmesan.", 6.90m),
            new DishSeed("Crispy Onion Rings", "Beer-battered sweet onion with smoked aioli.", 5.75m),
            new DishSeed("Salted Caramel Shake", "Frozen custard blended with salted caramel.", 7.20m),
        }),
        new RestaurantSeed("Sakura Sushi House", "Edomae-style sushi cut to order by a Tokyo-trained team.", "9 Cherry Blossom Lane, Seattle, WA", new[]
        {
            new DishSeed("Salmon Nigiri Set", "Six pieces of Scottish salmon over seasoned rice.", 16.50m),
            new DishSeed("Dragon Roll", "Eel and cucumber topped with avocado and unagi glaze.", 18.90m),
            new DishSeed("California Roll", "Snow crab, avocado and cucumber with tobiko.", 12.40m),
            new DishSeed("Spicy Tuna Roll", "Line-caught tuna with chilli mayo and spring onion.", 14.10m),
            new DishSeed("Miso Soup", "Dashi broth with silken tofu and wakame.", 4.50m),
            new DishSeed("Matcha Cheesecake", "Baked Uji matcha cheesecake with black sesame crumb.", 8.60m),
        }),
        new RestaurantSeed("Spice Route", "Slow-cooked North Indian curries and clay-oven breads.", "212 Curzon Road, Jersey City, NJ", new[]
        {
            new DishSeed("Butter Chicken", "Tandoori chicken in a tomato and fenugreek cream sauce.", 16.25m),
            new DishSeed("Lamb Rogan Josh", "Kashmiri lamb shoulder braised with warming spices.", 18.40m),
            new DishSeed("Paneer Tikka Masala", "Char-grilled paneer in a spiced onion gravy.", 15.10m),
            new DishSeed("Garlic Naan", "Clay-oven flatbread brushed with garlic butter.", 4.20m),
            new DishSeed("Vegetable Samosa", "Spiced potato and pea pastries with tamarind chutney.", 5.90m),
            new DishSeed("Mango Lassi", "Alphonso mango blended with set yoghurt.", 4.80m),
        }),
        new RestaurantSeed("Golden Dragon", "Cantonese roasts and hand-pulled noodles since 1987.", "77 Canal Street, San Francisco, CA", new[]
        {
            new DishSeed("Sweet and Sour Pork", "Crisp pork belly with pineapple and peppers.", 14.60m),
            new DishSeed("Beef Chow Fun", "Wok-tossed rice noodles with scallion and bean sprout.", 13.95m),
            new DishSeed("Pork Soup Dumplings", "Eight steamed xiao long bao with black vinegar.", 11.50m),
            new DishSeed("Salt and Pepper Squid", "Flash-fried squid with chilli and garlic.", 12.80m),
            new DishSeed("Vegetable Spring Rolls", "Crisp rolls with cabbage, carrot and glass noodle.", 6.40m),
            new DishSeed("Egg Fried Rice", "Wok rice with egg, spring onion and white pepper.", 7.30m),
        }),
        new RestaurantSeed("El Taco Loco", "Mexico City street tacos with nixtamal corn tortillas.", "18 Alameda Way, San Diego, CA", new[]
        {
            new DishSeed("Al Pastor Tacos", "Three spit-roasted pork tacos with pineapple and coriander.", 11.75m),
            new DishSeed("Carne Asada Burrito", "Grilled skirt steak, rice, black beans and salsa verde.", 13.40m),
            new DishSeed("Chicken Quesadilla", "Oaxaca cheese and adobo chicken on a flour tortilla.", 10.90m),
            new DishSeed("Loaded Nachos", "Corn chips, queso, jalapeno and pico de gallo.", 9.60m),
            new DishSeed("Guacamole and Chips", "Hand-mashed avocado with lime and sea salt.", 7.10m),
            new DishSeed("Churros con Chocolate", "Cinnamon sugar churros with dark chocolate sauce.", 6.80m),
        }),
        new RestaurantSeed("The Green Bowl", "Cold-pressed juices and grain bowls built to order.", "5 Elmwood Park, Portland, OR", new[]
        {
            new DishSeed("Quinoa Power Bowl", "Red quinoa, roast squash, kale and tahini dressing.", 12.90m),
            new DishSeed("Grilled Chicken Caesar", "Cos lettuce, aged parmesan and sourdough croutons.", 13.60m),
            new DishSeed("Falafel Mezze Bowl", "Herb falafel, hummus, pickled turnip and flatbread.", 12.20m),
            new DishSeed("Avocado Toast", "Sourdough, smashed avocado, chilli and poached egg.", 10.40m),
            new DishSeed("Berry Acai Bowl", "Acai, banana, granola and toasted coconut.", 9.80m),
            new DishSeed("Cold Pressed Green Juice", "Apple, cucumber, spinach, celery and ginger.", 6.50m),
        }),
        new RestaurantSeed("Pasta Fresca", "Hand-rolled pasta made fresh every morning.", "301 Verdi Street, Boston, MA", new[]
        {
            new DishSeed("Spaghetti Carbonara", "Guanciale, pecorino romano and cracked black pepper.", 15.40m),
            new DishSeed("Penne Arrabbiata", "Calabrian chilli, garlic and San Marzano tomato.", 13.20m),
            new DishSeed("Mushroom Truffle Tagliatelle", "Wild mushroom ragu with black truffle butter.", 17.90m),
            new DishSeed("Beef Lasagne", "Layered pasta with slow-cooked ragu and bechamel.", 16.50m),
            new DishSeed("Rocket and Parmesan Salad", "Wild rocket, shaved parmesan and lemon oil.", 8.30m),
            new DishSeed("Panna Cotta", "Vanilla bean cream set with a berry compote.", 7.40m),
        }),
        new RestaurantSeed("Seoul Kitchen", "Charcoal Korean barbecue and house-fermented kimchi.", "62 Hangang Street, Los Angeles, CA", new[]
        {
            new DishSeed("Bibimbap", "Rice bowl with seasoned vegetables, beef and a fried egg.", 14.80m),
            new DishSeed("Korean Fried Chicken", "Double-fried wings glazed in soy garlic or gochujang.", 15.90m),
            new DishSeed("Bulgogi Beef", "Marinated ribeye grilled with onion and scallion.", 18.60m),
            new DishSeed("Kimchi Pancake", "Crisp pancake with aged kimchi and spring onion.", 9.70m),
            new DishSeed("Tteokbokki", "Rice cakes simmered in a sweet chilli sauce.", 10.20m),
            new DishSeed("Iced Barley Tea", "Roasted barley tea served over ice.", 3.90m),
        }),
        new RestaurantSeed("Le Petit Cafe", "A Parisian corner bakery serving viennoiserie all day.", "14 Rue Lafayette, Chicago, IL", new[]
        {
            new DishSeed("Croque Monsieur", "Gruyere and ham toastie under a bechamel crust.", 11.60m),
            new DishSeed("Butter Croissant", "Laminated over three days with French butter.", 4.30m),
            new DishSeed("Quiche Lorraine", "Smoked bacon and gruyere in a shortcrust shell.", 10.50m),
            new DishSeed("French Onion Soup", "Slow-caramelised onion, beef broth and toasted gruyere.", 9.20m),
            new DishSeed("Lemon Tart", "Sharp lemon curd in a sweet pastry case.", 7.10m),
            new DishSeed("Cafe Au Lait", "Double espresso with steamed milk.", 4.60m),
        }),
        new RestaurantSeed("Smokehouse BBQ", "Low and slow Texas barbecue smoked over post oak.", "890 Brisket Road, Kansas City, MO", new[]
        {
            new DishSeed("Smoked Beef Brisket", "Twelve-hour post oak brisket with burnt ends.", 21.50m),
            new DishSeed("Baby Back Ribs", "Half rack glazed in a molasses barbecue sauce.", 19.80m),
            new DishSeed("Pulled Pork Sandwich", "Hand-pulled shoulder with slaw on a brioche bun.", 13.70m),
            new DishSeed("Mac and Cheese", "Three-cheese bake with a smoked crumb crust.", 7.60m),
            new DishSeed("Cornbread Muffins", "Skillet cornbread with honey butter.", 5.40m),
            new DishSeed("Pecan Pie", "Dark corn syrup and toasted pecan tart.", 7.90m),
        }),
        new RestaurantSeed("Bangkok Street", "Northern Thai cooking with imported herbs and chillies.", "23 Sukhumvit Lane, Miami, FL", new[]
        {
            new DishSeed("Pad Thai", "Rice noodles, tamarind, peanut and free-range egg.", 13.90m),
            new DishSeed("Green Curry Chicken", "Coconut green curry with Thai basil and aubergine.", 15.30m),
            new DishSeed("Tom Yum Goong", "Hot and sour prawn soup with lemongrass and lime.", 12.70m),
            new DishSeed("Thai Fish Cakes", "Red curry fish cakes with cucumber relish.", 9.90m),
            new DishSeed("Mango Sticky Rice", "Coconut sticky rice with ripe mango.", 8.20m),
            new DishSeed("Thai Iced Tea", "Spiced black tea with condensed milk.", 4.40m),
        }),
    };
}
