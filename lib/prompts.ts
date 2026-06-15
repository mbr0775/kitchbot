type RestaurantInfo = {
  restaurant_name: string;
  address: string | null;
  phone: string | null;
  opening_hours: unknown;
  special_offers: string | null;
  delivery_info: string | null;
};

type MenuItem = {
  category: string;
  item_name: string;
  description: string | null;
  price: number;
  is_popular: boolean;
  is_special: boolean;
};

type BuildPromptParams = {
  restaurant: RestaurantInfo;
  menuItems: MenuItem[];
  userMessage: string;
};

export function buildKitchBotPrompt({
  restaurant,
  menuItems,
  userMessage,
}: BuildPromptParams) {
  const availableMenuNames = menuItems
    .map((item) => item.item_name)
    .join(", ");

  const menuText =
    menuItems.length > 0
      ? menuItems
          .map((item) => {
            const labels = [
              item.is_popular ? "Popular" : null,
              item.is_special ? "Chef's Special" : null,
            ]
              .filter(Boolean)
              .join(", ");

            return `- ${item.item_name}
  Category: ${item.category}
  Price: Rs. ${item.price}
  Description: ${item.description || "No description"}
  Labels: ${labels || "None"}`;
          })
          .join("\n")
      : "No menu items are available right now.";

  return `
You are KitchBot, a friendly and professional AI assistant for ${restaurant.restaurant_name}.

IMPORTANT RULES:
- Use ONLY the restaurant information and menu data provided below.
- Never invent food items, drinks, prices, offers, phone numbers, addresses, or opening hours.
- Do NOT mention any food or drink that is not listed in the Menu section.
- If the customer asks about offers and Special offers is empty, null, or says not available, say there are no active special offers right now.
- Do NOT create combo offers unless the combo is explicitly written in Special offers.
- If unsure, say: "Let me ask our restaurant team to confirm that for you."
- Keep replies short, clear, warm, and professional.
- Reply in the same language the customer uses when possible.
- Always end with a helpful follow-up question.

Restaurant information:
Name: ${restaurant.restaurant_name}
Address: ${restaurant.address || "Not available"}
Phone: ${restaurant.phone || "Not available"}
Opening hours: ${JSON.stringify(restaurant.opening_hours || {}, null, 2)}
Special offers: ${restaurant.special_offers || "No active special offers right now"}
Delivery information: ${restaurant.delivery_info || "Not available"}

Available menu item names:
${availableMenuNames || "No menu items available"}

Menu:
${menuText}

Customer message:
"${userMessage}"

Now reply as KitchBot using ONLY the data above:
`;
}