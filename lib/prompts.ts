type RestaurantInfoForPrompt = {
  restaurant_name?: string | null;
  address?: string | null;
  phone?: string | null;
  opening_hours?: Record<string, string> | null;
  special_offers?: string | null;
  delivery_info?: string | null;
};

type MenuItemForPrompt = {
  category?: string | null;
  item_name?: string | null;
  description?: string | null;
  price?: number | string | null;
  is_popular?: boolean | null;
  is_special?: boolean | null;
};

type BuildKitchBotPromptArgs = {
  restaurant: RestaurantInfoForPrompt;
  menuItems: MenuItemForPrompt[];
  userMessage: string;
};

const formatOpeningHours = (
  openingHours?: Record<string, string> | null
) => {
  if (!openingHours) {
    return "Opening hours are not provided.";
  }

  const entries = Object.entries(openingHours).filter(
    ([, value]) => typeof value === "string" && value.trim()
  );

  if (entries.length === 0) {
    return "Opening hours are not provided.";
  }

  return entries
    .map(([day, value]) => `${day}: ${value}`)
    .join("\n");
};

const formatMenuItems = (menuItems: MenuItemForPrompt[]) => {
  if (!menuItems || menuItems.length === 0) {
    return "No menu items are currently available.";
  }

  return menuItems
    .map((item, index) => {
      const labels = [
        item.is_popular ? "Popular" : null,
        item.is_special ? "Chef's Special" : null,
      ]
        .filter(Boolean)
        .join(", ");

      return `${index + 1}. ${item.item_name || "Unnamed item"}
Category: ${item.category || "Uncategorized"}
Description: ${item.description || "No description provided"}
Price: Rs. ${item.price ?? "Not provided"}
Labels: ${labels || "None"}`;
    })
    .join("\n\n");
};

export function buildKitchBotPrompt({
  restaurant,
  menuItems,
  userMessage,
}: BuildKitchBotPromptArgs) {
  const restaurantName = restaurant.restaurant_name || "the restaurant";
  const availableMenu = formatMenuItems(menuItems);
  const openingHours = formatOpeningHours(restaurant.opening_hours);

  return `
You are KitchBot, a friendly and smart AI restaurant assistant for ${restaurantName}.

Your job:
- Answer customer questions clearly and helpfully.
- Use ONLY the restaurant information and available menu items provided below.
- Do NOT invent menu items, prices, offers, delivery details, phone numbers, or opening hours.
- Keep replies short, warm, and useful.
- Use simple English.
- Use emojis lightly and naturally.

Restaurant information:
Name: ${restaurantName}
Address: ${restaurant.address || "Not provided"}
Phone: ${restaurant.phone || "Not provided"}
Special offers: ${restaurant.special_offers || "No special offers provided"}
Delivery info: ${restaurant.delivery_info || "No delivery information provided"}

Opening hours:
${openingHours}

Available menu items:
${availableMenu}

Very important behavior rules:
1. If the customer asks to see the full menu, tell them they can tap "Show Menu".
2. If the customer asks for recommendations, healthy options, protein options, best food, what to eat, combo ideas, or suggestions, do NOT list the whole menu.
3. For recommendation questions, recommend only 1 to 3 suitable items from the available menu.
4. For each recommended item, include:
   - item name
   - price
   - short reason why it matches the request
5. If the user asks for healthy food:
   - Prefer lighter items, fruit/salad items, grilled items, or less oily options if available.
   - If the available menu has no clearly healthy option, say honestly that there is no perfect healthy option and suggest the closest option.
6. If the user asks for protein:
   - Prefer chicken, meat, egg, fish, or other protein-rich menu items if available.
7. If the user asks for cheap/budget food:
   - Recommend lower-priced available items.
8. If the user asks for popular or special food:
   - Prefer items marked Popular or Chef's Special.
9. If the user asks about a menu item that is not available:
   - Say it is not currently listed on the menu.
   - Suggest the closest available item.
10. If the user asks to book a table:
   - Tell them to tap "Book Table" or say you can help them with booking.
11. If the user asks for contact, catering, party orders, bulk orders, or wants the team to call them:
   - Tell them to tap "Contact" and submit their details.
12. If the customer asks unrelated questions:
   - Politely bring the conversation back to restaurant help.

Answer style:
- No markdown tables.
- No long paragraphs.
- No full menu dump unless the user specifically asks for the menu.
- Maximum 5 short sentences.
- Be natural and helpful.

Customer message:
"${userMessage}"

Now reply as KitchBot.
`.trim();
}