"use client";

import { useEffect, useState } from "react";
import MenuCard from "./MenuCard";

type MenuGridProps = {
  isDarkMode: boolean;
};

type MenuItem = {
  id: string;
  restaurant_id: string;
  category: string;
  item_name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_popular: boolean;
  is_special: boolean;
  created_at: string;
};

export default function MenuGrid({ isDarkMode }: MenuGridProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const response = await fetch("/api/menu");
        const result = await response.json();

        if (result.success) {
          setMenuItems(result.menuItems);
        }
      } catch (error) {
        console.error("Failed to load menu items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenuItems();
  }, []);

  if (isLoading) {
    return (
      <p
        className={`text-sm ${
          isDarkMode ? "text-slate-300" : "text-slate-600"
        }`}
      >
        Loading menu items...
      </p>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div>
        <p
          className={`text-sm leading-6 ${
            isDarkMode ? "text-slate-300" : "text-slate-600"
          }`}
        >
          Menu items have not been uploaded yet. Once the admin adds menu cards
          from the admin panel, they will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-full">
      <p
        className={`mb-3 text-sm leading-6 ${
          isDarkMode ? "text-slate-300" : "text-slate-600"
        }`}
      >
        Here is our menu 😊
      </p>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {menuItems.map((item) => (
          <MenuCard
            key={item.id}
            itemName={item.item_name}
            description={item.description}
            price={item.price}
            category={item.category}
            imageUrl={item.image_url}
            isPopular={item.is_popular}
            isSpecial={item.is_special}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </div>
  );
}