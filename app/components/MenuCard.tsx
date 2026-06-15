import Image from "next/image";

type MenuCardProps = {
  itemName: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  isPopular?: boolean;
  isSpecial?: boolean;
  isDarkMode: boolean;
};

export default function MenuCard({
  itemName,
  description,
  price,
  category,
  imageUrl,
  isPopular,
  isSpecial,
  isDarkMode,
}: MenuCardProps) {
  return (
    <div
      className={`min-w-[240px] rounded-2xl border p-4 shadow-sm ${
        isDarkMode
          ? "border-white/10 bg-slate-800 text-white"
          : "border-pink-100 bg-white text-slate-950"
      }`}
    >
      <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-2xl bg-[#FF0052]/10">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={itemName}
            fill
            unoptimized
            sizes="240px"
            className="object-cover"
          />
        ) : (
          <span className="text-5xl">🍽️</span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {isPopular && (
          <span className="rounded-full bg-[#FF0052]/10 px-2 py-1 text-[10px] font-bold text-[#FF0052]">
            Popular
          </span>
        )}

        {isSpecial && (
          <span className="rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-bold text-yellow-700">
            Chef&apos;s Special
          </span>
        )}
      </div>

      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#FF0052]">
        {category}
      </p>

      <h3 className="mt-1 text-base font-bold">{itemName}</h3>

      <p
        className={`mt-2 text-sm leading-5 ${
          isDarkMode ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {description || "No description added yet."}
      </p>

      <p className="mt-3 text-lg font-black text-[#FF0052]">
        Rs. {Number(price).toFixed(2)}
      </p>
    </div>
  );
}