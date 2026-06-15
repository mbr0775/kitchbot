"use client";

import AdminChatHistory from "@/app/components/AdminChatHistory";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "mubassirnasar@gmail.com";
const DEMO_RESTAURANT_ID = "11111111-1111-1111-1111-111111111111";

type AuthStatus = "checking" | "allowed" | "blocked";
type BookingStatus = "pending" | "confirmed" | "cancelled";
type LeadStatus = "new" | "contacted" | "closed";
type ExportType = "bookings" | "leads" | "chats";

type OpeningHours = {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
};

type RestaurantInfo = {
  id: string;
  restaurant_name: string;
  address: string | null;
  phone: string | null;
  opening_hours: Partial<OpeningHours> | null;
  special_offers: string | null;
  delivery_info: string | null;
  created_at?: string;
};

type RestaurantApiResponse = {
  success: boolean;
  message?: string;
  restaurant?: RestaurantInfo;
};

type MenuItem = {
  id: string;
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

type Booking = {
  id: string;
  session_id: string | null;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  guests_count: number;
  special_request: string | null;
  status: BookingStatus;
  created_at: string;
};

type Lead = {
  id: string;
  session_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  interest: string | null;
  status: LeadStatus;
  created_at: string;
};

type BookingsApiResponse = {
  success: boolean;
  message?: string;
  bookings?: Booking[];
};

type BookingUpdateResponse = {
  success: boolean;
  message?: string;
  booking?: Booking;
};

type LeadsApiResponse = {
  success: boolean;
  message?: string;
  leads?: Lead[];
};

type LeadUpdateResponse = {
  success: boolean;
  message?: string;
  lead?: Lead;
};

const defaultOpeningHours: OpeningHours = {
  monday: "",
  tuesday: "",
  wednesday: "",
  thursday: "",
  friday: "",
  saturday: "",
  sunday: "",
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [adminEmail, setAdminEmail] = useState("");

  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [restaurantPhone, setRestaurantPhone] = useState("");
  const [openingHours, setOpeningHours] =
    useState<OpeningHours>(defaultOpeningHours);
  const [specialOffers, setSpecialOffers] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState("");
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(false);
  const [isSavingRestaurant, setIsSavingRestaurant] = useState(false);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(
    null
  );

  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState<ExportType | null>(null);
  const [message, setMessage] = useState("");

  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPopular, setIsPopular] = useState(false);
  const [isSpecial, setIsSpecial] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const isEditing = Boolean(editingItemId);

  const bookingStats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === "pending")
        .length,
      confirmed: bookings.filter((booking) => booking.status === "confirmed")
        .length,
      cancelled: bookings.filter((booking) => booking.status === "cancelled")
        .length,
    };
  }, [bookings]);

  const leadStats = useMemo(() => {
    return {
      total: leads.length,
      new: leads.filter((lead) => lead.status === "new").length,
      contacted: leads.filter((lead) => lead.status === "contacted").length,
      closed: leads.filter((lead) => lead.status === "closed").length,
    };
  }, [leads]);

  const loadRestaurantInfo = useCallback(async () => {
    setIsLoadingRestaurant(true);

    try {
      const response = await fetch("/api/restaurant");
      const result = (await response.json()) as RestaurantApiResponse;

      if (!response.ok || !result.success || !result.restaurant) {
        setMessage(result.message || "Failed to load restaurant settings.");
        return;
      }

      const restaurant = result.restaurant;
      const hours = restaurant.opening_hours ?? {};

      setRestaurantName(restaurant.restaurant_name ?? "");
      setRestaurantAddress(restaurant.address ?? "");
      setRestaurantPhone(restaurant.phone ?? "");
      setSpecialOffers(restaurant.special_offers ?? "");
      setDeliveryInfo(restaurant.delivery_info ?? "");

      setOpeningHours({
        monday: hours.monday ?? "",
        tuesday: hours.tuesday ?? "",
        wednesday: hours.wednesday ?? "",
        thursday: hours.thursday ?? "",
        friday: hours.friday ?? "",
        saturday: hours.saturday ?? "",
        sunday: hours.sunday ?? "",
      });
    } catch (error) {
      console.error("Load restaurant error:", error);
      setMessage("Something went wrong while loading restaurant settings.");
    } finally {
      setIsLoadingRestaurant(false);
    }
  }, []);

  const loadMenuItems = useCallback(async () => {
    setIsLoadingMenu(true);

    const { data, error } = await supabase
      .from("menu_items")
      .select(
        "id, category, item_name, description, price, image_url, is_available, is_popular, is_special, created_at"
      )
      .eq("restaurant_id", DEMO_RESTAURANT_ID)
      .order("created_at", { ascending: false });

    setIsLoadingMenu(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMenuItems(data ?? []);
  }, []);

  const loadBookings = useCallback(async () => {
    setIsLoadingBookings(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setMessage("Admin session expired. Please log in again.");
        router.push("/admin/login");
        return;
      }

      const response = await fetch("/api/bookings", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = (await response.json()) as BookingsApiResponse;

      if (!response.ok || !result.success) {
        setMessage(result.message || "Failed to load bookings.");
        return;
      }

      setBookings(result.bookings ?? []);
    } catch (error) {
      console.error("Load bookings error:", error);
      setMessage("Something went wrong while loading bookings.");
    } finally {
      setIsLoadingBookings(false);
    }
  }, [router]);

  const loadLeads = useCallback(async () => {
    setIsLoadingLeads(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setMessage("Admin session expired. Please log in again.");
        router.push("/admin/login");
        return;
      }

      const response = await fetch("/api/leads", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = (await response.json()) as LeadsApiResponse;

      if (!response.ok || !result.success) {
        setMessage(result.message || "Failed to load leads.");
        return;
      }

      setLeads(result.leads ?? []);
    } catch (error) {
      console.error("Load leads error:", error);
      setMessage("Something went wrong while loading leads.");
    } finally {
      setIsLoadingLeads(false);
    }
  }, [router]);

  useEffect(() => {
    const checkAdminUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
        setAuthStatus("blocked");
        router.push("/admin/login");
        return;
      }

      setAdminEmail(user.email ?? ADMIN_EMAIL);
      setAuthStatus("allowed");

      await Promise.all([
        loadRestaurantInfo(),
        loadMenuItems(),
        loadBookings(),
        loadLeads(),
      ]);
    };

    const timer = window.setTimeout(() => {
      checkAdminUser();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router, loadRestaurantInfo, loadMenuItems, loadBookings, loadLeads]);

  const handleOpeningHourChange = (day: keyof OpeningHours, value: string) => {
    setOpeningHours((currentHours) => ({
      ...currentHours,
      [day]: value,
    }));
  };

  const handleExport = async (type: ExportType) => {
    setMessage("");
    setIsExporting(type);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setMessage("Admin session expired. Please log in again.");
        router.push("/admin/login");
        return;
      }

      const response = await fetch(`/api/export/${type}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setMessage(result?.message || `Failed to export ${type}.`);
        return;
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      const dateStamp = new Date().toISOString().slice(0, 10);

      link.href = downloadUrl;
      link.download = `kitchbot-${type}-${dateStamp}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(downloadUrl);

      setMessage(`${type} CSV exported successfully ✅`);
    } catch (error) {
      console.error("Export error:", error);
      setMessage(`Something went wrong while exporting ${type}.`);
    } finally {
      setIsExporting(null);
    }
  };

  const handleSaveRestaurantInfo = async () => {
    setMessage("");

    if (!restaurantName.trim()) {
      setMessage("Restaurant name is required.");
      return;
    }

    setIsSavingRestaurant(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setMessage("Admin session expired. Please log in again.");
        router.push("/admin/login");
        return;
      }

      const response = await fetch("/api/restaurant", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          restaurantName,
          address: restaurantAddress,
          phone: restaurantPhone,
          openingHours,
          specialOffers,
          deliveryInfo,
        }),
      });

      const result = (await response.json()) as RestaurantApiResponse;

      if (!response.ok || !result.success) {
        setMessage(result.message || "Failed to save restaurant settings.");
        return;
      }

      setMessage("Restaurant settings updated successfully ✅");
      await loadRestaurantInfo();
    } catch (error) {
      console.error("Save restaurant error:", error);
      setMessage("Something went wrong while saving restaurant settings.");
    } finally {
      setIsSavingRestaurant(false);
    }
  };

  const resetFileInput = () => {
    const fileInput = document.getElementById(
      "food-image-input"
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const resetMenuForm = () => {
    setEditingItemId(null);
    setItemName("");
    setCategory("");
    setDescription("");
    setPrice("");
    setImageFile(null);
    setIsPopular(false);
    setIsSpecial(false);
    setIsAvailable(true);
    resetFileInput();
  };

  const getStoragePathFromPublicUrl = (publicUrl: string | null) => {
    if (!publicUrl) return null;

    try {
      const url = new URL(publicUrl);
      const marker = "/storage/v1/object/public/menu-images/";
      const index = url.pathname.indexOf(marker);

      if (index === -1) return null;

      return decodeURIComponent(url.pathname.slice(index + marker.length));
    } catch {
      return null;
    }
  };

  const uploadImageIfSelected = async () => {
    if (!imageFile) return null;

    const safeFileName = imageFile.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "-");

    const filePath = `${DEMO_RESTAURANT_ID}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("menu-images").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSaveMenuItem = async () => {
    setMessage("");

    if (!itemName.trim()) {
      setMessage("Please enter item name.");
      return;
    }

    if (!category.trim()) {
      setMessage("Please enter category.");
      return;
    }

    if (!price || Number(price) < 0) {
      setMessage("Please enter a valid price.");
      return;
    }

    if (!isEditing && !imageFile) {
      setMessage("Please upload a food image.");
      return;
    }

    setIsSaving(true);

    try {
      const publicUrl = await uploadImageIfSelected();

      if (isEditing && editingItemId) {
        const currentItem = menuItems.find((item) => item.id === editingItemId);

        const updatePayload: {
          category: string;
          item_name: string;
          description: string | null;
          price: number;
          image_url?: string | null;
          is_available: boolean;
          is_popular: boolean;
          is_special: boolean;
        } = {
          category: category.trim(),
          item_name: itemName.trim(),
          description: description.trim() || null,
          price: Number(price),
          is_available: isAvailable,
          is_popular: isPopular,
          is_special: isSpecial,
        };

        if (publicUrl) {
          updatePayload.image_url = publicUrl;
        }

        const { error } = await supabase
          .from("menu_items")
          .update(updatePayload)
          .eq("id", editingItemId);

        if (error) {
          setMessage(error.message);
          return;
        }

        if (publicUrl && currentItem?.image_url) {
          const oldStoragePath = getStoragePathFromPublicUrl(
            currentItem.image_url
          );

          if (oldStoragePath) {
            await supabase.storage.from("menu-images").remove([oldStoragePath]);
          }
        }

        setMessage("Menu item updated successfully ✅");
      } else {
        const { error } = await supabase.from("menu_items").insert({
          restaurant_id: DEMO_RESTAURANT_ID,
          category: category.trim(),
          item_name: itemName.trim(),
          description: description.trim() || null,
          price: Number(price),
          image_url: publicUrl,
          is_available: isAvailable,
          is_popular: isPopular,
          is_special: isSpecial,
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage("Menu item added successfully ✅");
      }

      resetMenuForm();
      await loadMenuItems();
    } catch (error) {
      console.error("Save menu item error:", error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Something went wrong while saving menu item.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    setItemName(item.item_name);
    setCategory(item.category);
    setDescription(item.description ?? "");
    setPrice(String(item.price));
    setImageFile(null);
    setIsPopular(item.is_popular);
    setIsSpecial(item.is_special);
    setIsAvailable(item.is_available);
    setMessage("Editing mode enabled. Change details and click Update Item.");
    resetFileInput();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteMenuItem = async (item: MenuItem) => {
    const confirmed = window.confirm(
      `Delete "${item.item_name}" from the menu?`
    );

    if (!confirmed) return;

    setMessage("");

    const storagePath = getStoragePathFromPublicUrl(item.image_url);

    if (storagePath) {
      await supabase.storage.from("menu-images").remove([storagePath]);
    }

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", item.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Menu item deleted successfully ✅");
    await loadMenuItems();
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: BookingStatus
  ) => {
    setUpdatingBookingId(bookingId);
    setMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setMessage("Admin session expired. Please log in again.");
        router.push("/admin/login");
        return;
      }

      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          bookingId,
          status,
        }),
      });

      const result = (await response.json()) as BookingUpdateResponse;

      if (!response.ok || !result.success) {
        setMessage(result.message || "Failed to update booking.");
        return;
      }

      setMessage(result.message || "Booking updated successfully ✅");
      await loadBookings();
    } catch (error) {
      console.error("Update booking status error:", error);
      setMessage("Something went wrong while updating booking.");
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: LeadStatus) => {
    setUpdatingLeadId(leadId);
    setMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setMessage("Admin session expired. Please log in again.");
        router.push("/admin/login");
        return;
      }

      const response = await fetch("/api/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          leadId,
          status,
        }),
      });

      const result = (await response.json()) as LeadUpdateResponse;

      if (!response.ok || !result.success) {
        setMessage(result.message || "Failed to update lead.");
        return;
      }

      setMessage(result.message || "Lead updated successfully ✅");
      await loadLeads();
    } catch (error) {
      console.error("Update lead status error:", error);
      setMessage("Something went wrong while updating lead.");
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const getStatusClass = (status: BookingStatus) => {
    if (status === "confirmed") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (status === "cancelled") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  };

  const getLeadStatusClass = (status: LeadStatus) => {
    if (status === "contacted") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    if (status === "closed") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  };

  if (authStatus === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff7fa] px-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            Checking admin access...
          </p>
        </div>
      </main>
    );
  }

  if (authStatus === "blocked") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff7fa] px-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-red-600">
            Access blocked. Redirecting to login...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff7fa] px-4 py-6 text-slate-950 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FF0052]">
                KitchBot Admin
              </p>

              <h1 className="mt-2 text-3xl font-black md:text-4xl">
                Restaurant Dashboard
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Logged in as {adminEmail}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full border border-pink-200 px-5 py-3 text-sm font-bold text-[#FF0052] transition hover:bg-pink-50"
              >
                View Site
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-full bg-[#FF0052] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e60049]"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {message && (
          <div className="mb-6 rounded-2xl border border-pink-100 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <section className="mb-8 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">Export Data</h2>
              <p className="mt-1 text-sm text-slate-500">
                Download bookings, leads, and chat messages as CSV files.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleExport("bookings")}
                disabled={Boolean(isExporting)}
                className="rounded-full border border-pink-200 px-5 py-3 text-sm font-bold text-[#FF0052] transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExporting === "bookings"
                  ? "Exporting..."
                  : "Export Bookings"}
              </button>

              <button
                onClick={() => handleExport("leads")}
                disabled={Boolean(isExporting)}
                className="rounded-full border border-pink-200 px-5 py-3 text-sm font-bold text-[#FF0052] transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExporting === "leads" ? "Exporting..." : "Export Leads"}
              </button>

              <button
                onClick={() => handleExport("chats")}
                disabled={Boolean(isExporting)}
                className="rounded-full bg-[#FF0052] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e60049] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExporting === "chats" ? "Exporting..." : "Export Chats"}
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">Restaurant Settings</h2>
              <p className="mt-1 text-sm text-slate-500">
                Update restaurant details used by KitchBot AI.
              </p>
            </div>

            <button
              onClick={loadRestaurantInfo}
              className="rounded-full border border-pink-200 px-5 py-3 text-sm font-bold text-[#FF0052] transition hover:bg-pink-50"
            >
              Refresh Settings
            </button>
          </div>

          {isLoadingRestaurant ? (
            <p className="rounded-2xl bg-[#fff7fa] p-5 text-sm font-semibold text-slate-500">
              Loading restaurant settings...
            </p>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <input
                  value={restaurantName}
                  onChange={(event) => setRestaurantName(event.target.value)}
                  placeholder="Restaurant name"
                  className="rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
                />

                <input
                  value={restaurantPhone}
                  onChange={(event) => setRestaurantPhone(event.target.value)}
                  placeholder="Phone number"
                  className="rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
                />

                <input
                  value={restaurantAddress}
                  onChange={(event) =>
                    setRestaurantAddress(event.target.value)
                  }
                  placeholder="Address"
                  className="rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
                />
              </div>

              <div>
                <p className="mb-3 text-sm font-black text-slate-700">
                  Opening Hours
                </p>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {(
                    [
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                      "sunday",
                    ] as Array<keyof OpeningHours>
                  ).map((day) => (
                    <input
                      key={day}
                      value={openingHours[day]}
                      onChange={(event) =>
                        handleOpeningHourChange(day, event.target.value)
                      }
                      placeholder={`${day[0].toUpperCase()}${day.slice(
                        1
                      )} e.g. 7:00 AM - 10:00 PM`}
                      className="rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <textarea
                  value={specialOffers}
                  onChange={(event) => setSpecialOffers(event.target.value)}
                  placeholder="Special offers e.g. Today special: Chicken Kottu for Rs. 600"
                  rows={4}
                  className="resize-none rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
                />

                <textarea
                  value={deliveryInfo}
                  onChange={(event) => setDeliveryInfo(event.target.value)}
                  placeholder="Delivery info e.g. Delivery available within 5km"
                  rows={4}
                  className="resize-none rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
                />
              </div>

              <button
                onClick={handleSaveRestaurantInfo}
                disabled={isSavingRestaurant}
                className="rounded-2xl bg-[#FF0052] px-6 py-4 text-sm font-black text-white transition hover:bg-[#e60049] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingRestaurant ? "Saving Settings..." : "Save Settings"}
              </button>
            </div>
          )}
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-5">
          <div className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Menu Items</p>
            <p className="mt-2 text-3xl font-black">{menuItems.length}</p>
          </div>

          <div className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Pending Bookings
            </p>
            <p className="mt-2 text-3xl font-black text-yellow-600">
              {bookingStats.pending}
            </p>
          </div>

          <div className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Confirmed</p>
            <p className="mt-2 text-3xl font-black text-emerald-600">
              {bookingStats.confirmed}
            </p>
          </div>

          <div className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">New Leads</p>
            <p className="mt-2 text-3xl font-black text-[#FF0052]">
              {leadStats.new}
            </p>
          </div>

          <div className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">All Leads</p>
            <p className="mt-2 text-3xl font-black">{leadStats.total}</p>
          </div>
        </section>

        <AdminChatHistory />

        <section className="mb-8 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">Customer Leads</h2>
              <p className="mt-1 text-sm text-slate-500">
                View customer contact requests and follow-up status.
              </p>
            </div>

            <button
              onClick={loadLeads}
              className="rounded-full border border-pink-200 px-5 py-3 text-sm font-bold text-[#FF0052] transition hover:bg-pink-50"
            >
              Refresh Leads
            </button>
          </div>

          {isLoadingLeads ? (
            <p className="rounded-2xl bg-[#fff7fa] p-5 text-sm font-semibold text-slate-500">
              Loading leads...
            </p>
          ) : leads.length === 0 ? (
            <p className="rounded-2xl bg-[#fff7fa] p-5 text-sm font-semibold text-slate-500">
              No leads yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.14em] text-slate-400">
                    <th className="px-4">Customer</th>
                    <th className="px-4">Phone</th>
                    <th className="px-4">Email</th>
                    <th className="px-4">Interest</th>
                    <th className="px-4">Status</th>
                    <th className="px-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="bg-[#fff7fa]">
                      <td className="rounded-l-2xl px-4 py-4 text-sm font-bold">
                        {lead.customer_name}
                        <p className="mt-1 text-xs font-medium text-slate-400">
                          {new Date(lead.created_at).toLocaleString()}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {lead.customer_phone}
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {lead.customer_email || "No email"}
                      </td>

                      <td className="max-w-[300px] px-4 py-4 text-sm text-slate-600">
                        {lead.interest || "No interest"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-black capitalize ${getLeadStatusClass(
                            lead.status
                          )}`}
                        >
                          {lead.status}
                        </span>
                      </td>

                      <td className="rounded-r-2xl px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              handleUpdateLeadStatus(lead.id, "contacted")
                            }
                            disabled={
                              updatingLeadId === lead.id ||
                              lead.status === "contacted"
                            }
                            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Contacted
                          </button>

                          <button
                            onClick={() =>
                              handleUpdateLeadStatus(lead.id, "closed")
                            }
                            disabled={
                              updatingLeadId === lead.id ||
                              lead.status === "closed"
                            }
                            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Closed
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mb-8 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">Table Bookings</h2>
              <p className="mt-1 text-sm text-slate-500">
                View customer booking requests and update their status.
              </p>
            </div>

            <button
              onClick={loadBookings}
              className="rounded-full border border-pink-200 px-5 py-3 text-sm font-bold text-[#FF0052] transition hover:bg-pink-50"
            >
              Refresh Bookings
            </button>
          </div>

          {isLoadingBookings ? (
            <p className="rounded-2xl bg-[#fff7fa] p-5 text-sm font-semibold text-slate-500">
              Loading bookings...
            </p>
          ) : bookings.length === 0 ? (
            <p className="rounded-2xl bg-[#fff7fa] p-5 text-sm font-semibold text-slate-500">
              No bookings yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.14em] text-slate-400">
                    <th className="px-4">Customer</th>
                    <th className="px-4">Phone</th>
                    <th className="px-4">Date</th>
                    <th className="px-4">Time</th>
                    <th className="px-4">Guests</th>
                    <th className="px-4">Request</th>
                    <th className="px-4">Status</th>
                    <th className="px-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="bg-[#fff7fa]">
                      <td className="rounded-l-2xl px-4 py-4 text-sm font-bold">
                        {booking.customer_name}
                        <p className="mt-1 text-xs font-medium text-slate-400">
                          {new Date(booking.created_at).toLocaleString()}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {booking.customer_phone}
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {booking.booking_date}
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {booking.booking_time}
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {booking.guests_count}
                      </td>

                      <td className="max-w-[220px] px-4 py-4 text-sm text-slate-600">
                        {booking.special_request || "No special request"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-black capitalize ${getStatusClass(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>

                      <td className="rounded-r-2xl px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleUpdateBookingStatus(
                                booking.id,
                                "confirmed"
                              )
                            }
                            disabled={
                              updatingBookingId === booking.id ||
                              booking.status === "confirmed"
                            }
                            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Confirm
                          </button>

                          <button
                            onClick={() =>
                              handleUpdateBookingStatus(
                                booking.id,
                                "cancelled"
                              )
                            }
                            disabled={
                              updatingBookingId === booking.id ||
                              booking.status === "cancelled"
                            }
                            className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">
              {isEditing ? "Edit Menu Item" : "Add Menu Item"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload food photos and manage live menu cards.
            </p>

            <div className="mt-6 space-y-4">
              <input
                value={itemName}
                onChange={(event) => setItemName(event.target.value)}
                placeholder="Item name"
                className="w-full rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
              />

              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Category e.g. Rice, Kottu, Drinks"
                className="w-full rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
              />

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Description"
                rows={4}
                className="w-full resize-none rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
              />

              <input
                type="number"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="Price"
                className="w-full rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
              />

              <input
                id="food-image-input"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(event) =>
                  setImageFile(event.target.files?.[0] ?? null)
                }
                className="w-full rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm"
              />

              {isEditing && (
                <p className="text-xs font-medium text-slate-500">
                  Upload a new image only if you want to replace the old one.
                </p>
              )}

              <div className="grid gap-3">
                <label className="flex items-center gap-3 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(event) => setIsAvailable(event.target.checked)}
                  />
                  Available
                </label>

                <label className="flex items-center gap-3 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(event) => setIsPopular(event.target.checked)}
                  />
                  Popular
                </label>

                <label className="flex items-center gap-3 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={isSpecial}
                    onChange={(event) => setIsSpecial(event.target.checked)}
                  />
                  Chef&apos;s Special
                </label>
              </div>

              <button
                onClick={handleSaveMenuItem}
                disabled={isSaving}
                className="w-full rounded-2xl bg-[#FF0052] px-5 py-4 text-sm font-black text-white transition hover:bg-[#e60049] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : isEditing
                    ? "Update Item"
                    : "Add Item"}
              </button>

              {isEditing && (
                <button
                  onClick={resetMenuForm}
                  className="w-full rounded-2xl border border-pink-200 px-5 py-4 text-sm font-black text-[#FF0052] transition hover:bg-pink-50"
                >
                  Cancel Editing
                </button>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black">Menu Items</h2>
                <p className="mt-1 text-sm text-slate-500">
                  These items appear inside the customer chatbot menu.
                </p>
              </div>

              <button
                onClick={loadMenuItems}
                className="rounded-full border border-pink-200 px-5 py-3 text-sm font-bold text-[#FF0052] transition hover:bg-pink-50"
              >
                Refresh Menu
              </button>
            </div>

            {isLoadingMenu ? (
              <p className="rounded-2xl bg-[#fff7fa] p-5 text-sm font-semibold text-slate-500">
                Loading menu items...
              </p>
            ) : menuItems.length === 0 ? (
              <p className="rounded-2xl bg-[#fff7fa] p-5 text-sm font-semibold text-slate-500">
                No menu items uploaded yet.
              </p>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-3xl border border-pink-100 bg-[#fff7fa]"
                  >
                    <div className="relative h-44 bg-pink-50">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.item_name}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, 300px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#FF0052]">
                          {item.category}
                        </span>

                        {!item.is_available && (
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600">
                            Sold Out
                          </span>
                        )}

                        {item.is_popular && (
                          <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-black text-yellow-700">
                            Popular
                          </span>
                        )}

                        {item.is_special && (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                            Special
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-black">{item.item_name}</h3>

                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                        {item.description || "No description"}
                      </p>

                      <p className="mt-3 text-xl font-black text-[#FF0052]">
                        Rs. {Number(item.price).toFixed(2)}
                      </p>

                      <div className="mt-5 flex gap-2">
                        <button
                          onClick={() => handleEditMenuItem(item)}
                          className="flex-1 rounded-full border border-pink-200 px-4 py-3 text-xs font-black text-[#FF0052] transition hover:bg-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteMenuItem(item)}
                          className="flex-1 rounded-full bg-red-600 px-4 py-3 text-xs font-black text-white transition hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}