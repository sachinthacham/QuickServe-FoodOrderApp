namespace FoodOrder.Domain.Common;

/// <summary>
/// Stock imagery so no restaurant, dish or profile is ever rendered without a picture.
/// Pictures are chosen deterministically from the entity name, which keeps them stable
/// across reseeds while still varying between records.
/// </summary>
public static class StockImages
{
    private const string Unsplash = "https://images.unsplash.com/photo-";
    private const string Params = "?auto=format&fit=crop&w=800&q=80";

    public static readonly string[] Restaurants =
    {
        Unsplash + "1517248135467-4c7edcad34c4" + Params,
        Unsplash + "1552566626-52f8b828add9" + Params,
        Unsplash + "1555396273-367ea4eb4db5" + Params,
        Unsplash + "1514933651103-005eec06c04b" + Params,
        Unsplash + "1559339352-11d035aa65de" + Params,
        Unsplash + "1466978913421-dad2ebd01d17" + Params,
        Unsplash + "1555992336-03a23c7b20ee" + Params,
        Unsplash + "1590846406792-0adc7f938f1d" + Params,
        Unsplash + "1424847651672-bf20a4b0982b" + Params,
        Unsplash + "1414235077428-338989a2e8c0" + Params,
        Unsplash + "1600891964092-4316c288032e" + Params,
    };

    public static readonly string[] Food =
    {
        Unsplash + "1568901346375-23c9450c58cd" + Params,
        Unsplash + "1550547660-d9450f859349" + Params,
        Unsplash + "1513104890138-7c749659a591" + Params,
        Unsplash + "1565299624946-b28f40a0ae38" + Params,
        Unsplash + "1546069901-ba9599a7e63c" + Params,
        Unsplash + "1504674900247-0877df9cc836" + Params,
        Unsplash + "1571091718767-18b5b1457add" + Params,
        Unsplash + "1585238342024-78d387f4a707" + Params,
        Unsplash + "1563379926898-05f4575a45d8" + Params,
        Unsplash + "1579871494447-9811cf80d66c" + Params,
        Unsplash + "1551024506-0bccd828d307" + Params,
        Unsplash + "1512621776951-a57141f2eefd" + Params,
        Unsplash + "1544145945-f90425340c7e" + Params,
    };

    public static string ForRestaurant(string name) => Pick(Restaurants, name);

    public static string ForFood(string name) => Pick(Food, name);

    public static string ForUser(string email)
    {
        // pravatar exposes 70 portraits addressable by index.
        var index = (StableHash(email) % 70) + 1;
        return $"https://i.pravatar.cc/150?img={index}";
    }

    private static string Pick(string[] pool, string key) => pool[StableHash(key) % pool.Length];

    private static int StableHash(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return 0;
        }

        unchecked
        {
            var hash = 17;
            foreach (var c in value)
            {
                hash = (hash * 31) + c;
            }

            return Math.Abs(hash);
        }
    }
}
