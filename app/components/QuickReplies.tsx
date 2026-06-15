type QuickRepliesProps = {
  onSelect: (message: string) => void;
  isDarkMode: boolean;
};

const quickReplies = ["Show Menu", "Book Table", "Opening Hours", "Contact"];

export default function QuickReplies({
  onSelect,
  isDarkMode,
}: QuickRepliesProps) {
  return (
    <div
      className={`border-t px-4 py-3 ${
        isDarkMode ? "border-white/10 bg-slate-900" : "border-pink-100 bg-white"
      }`}
    >
      <div className="flex flex-wrap gap-2">
        {quickReplies.map((reply) => (
          <button
            key={reply}
            onClick={() => onSelect(reply)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
              isDarkMode
                ? "border-white/10 bg-slate-800 text-white hover:bg-[#FF0052]"
                : "border-[#FF0052]/20 bg-white text-[#FF0052] hover:bg-[#FF0052] hover:text-white"
            }`}
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
}