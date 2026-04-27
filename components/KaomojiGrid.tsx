import React, { useMemo, useState } from "react";
import { KAOMOJI_DATA } from "../data/kaomoji/kaomoji";

interface KaomojiGridProps {
  onCopy: (text: string) => void;
  onClearRecent: () => void;
  recentKaomoji: string[];
}

const KaomojiGrid: React.FC<KaomojiGridProps> = ({
  onCopy,
  onClearRecent,
  recentKaomoji,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const isSearching = searchQuery.trim().length > 0;

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return KAOMOJI_DATA;

    return KAOMOJI_DATA.filter((item) => {
      return (
        item.text.includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        item.group.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof KAOMOJI_DATA> = {};
    filtered.forEach((k) => {
      if (!map[k.group]) map[k.group] = [];
      map[k.group].push(k);
    });
    return map;
  }, [filtered]);

  return (
    <div className="space-y-12 pt-6 sm:pt-0">
      {/* 🔍 搜索栏 */}
      <div className="sticky top-0 z-20 bg-[#fffaf5] pt-2 pb-4">
        {isSearching && (
          <div
            className="mb-2 flex items-center gap-2 text-sm text-orange-500 cursor-pointer"
            onClick={() => {
              setInputValue("");
              setSearchQuery("");
            }}
          >
            <span className="text-lg">←</span>
            <span>Back to all kaomoji</span>
          </div>
        )}

        <div className="relative max-w-xl mx-auto flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearchQuery(inputValue)}
            placeholder="Search kaomoji..."
            className="flex-1 h-12 px-4 rounded-2xl border border-orange-200 bg-white focus:outline-none focus:ring-4 focus:ring-orange-300"
          />

          <button
            onClick={() => setSearchQuery(inputValue)}
            className="group relative w-12 h-12 rounded-2xl border border-orange-200 bg-white
                       flex items-center justify-center
                       hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100
                       transition-all active:scale-95"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-orange-400 group-hover:text-orange-500 transition"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m1.1-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>
      {/* ✅ Recently Used (boxed + clear) */}
      {!isSearching && (
        <section>
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-xs font-black text-orange-300 uppercase tracking-[0.2em]">
              Recently Used
            </h2>

            <div className="flex items-center gap-3">
              {recentKaomoji.length > 0 && (
                <button
                  onClick={onClearRecent}
                  className="text-xs font-black text-stone-400 hover:text-stone-700"
                  title="Clear recent kaomoji"
                >
                  Clear
                </button>
              )}
              <span className="text-xs text-stone-400 font-semibold">
                {recentKaomoji.length
                  ? `${recentKaomoji.length} saved`
                  : "No history yet"}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white/60 backdrop-blur-md p-5">
            {recentKaomoji.length === 0 ? (
              <div className="text-sm text-stone-400 font-medium">
                Copy a kaomoji to see it here.
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {recentKaomoji.map((char) => (
                  <button
                    key={`recent-${char}`}
                    onClick={() => onCopy(char)}
                    title="Recently used"
                    className="px-3 py-2 rounded-2xl bg-white border border-orange-50 text-sm font-semibold
                         hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100
                         hover:-translate-y-1 transition-all active:scale-95"
                  >
                    {char}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 空结果 */}
      {isSearching && filtered.length === 0 && (
        <div className="text-center py-20 text-stone-300">
          <p className="text-lg">No kaomoji found</p>
        </div>
      )}

      {/* 分组展示 */}
      {Object.entries(grouped).map(([group, list]) => {
        const items = list as typeof KAOMOJI_DATA;

        return (
          <div key={group} className="space-y-6">
            <h2 className="text-xs font-black text-orange-300 uppercase tracking-[0.2em] ml-2">
              {group}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map((item) => (
                <button
                  key={item.text}
                  onClick={() => onCopy(item.text)}
                  className="group bg-white border border-orange-50 rounded-2xl p-3 hover:border-orange-300 hover:shadow-xl transition"
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KaomojiGrid;
