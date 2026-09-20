namespace FoodOrder.Domain.Entities
{
    public class Restaurant
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Address { get; set; } = null!;
        public Guid? SellerId { get; set; } // Owner/Seller of the restaurant
        public string ImageUrl { get; set; } = null!;
        
        // Navigation
        public List<MenuItem> MenuItems { get; set; } = new();
    }
}
