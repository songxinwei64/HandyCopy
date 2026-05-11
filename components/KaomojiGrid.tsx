import React, { useMemo, useState } from "react";
import { KAOMOJI_DATA } from "../data/kaomoji/kaomoji";

interface KaomojiGridProps {
  onCopy: (text: string) => void;
  onClearRecent: () => void;
  recentKaomoji: string[];
}

const KaomojiGrid: React.FC<KaomojiGridProps> = ({ onCopy, onClearRecent, recentKaomoji }) => {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const isSearching = searchQuery.trim().length > 0;

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return KAOMOJI_DATA;
    return KAOMOJI_DATA.filter((item) =>
      item.text.includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q)) ||
      item.group.toLowerCase().includes(q)
    );
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
    <div className="space-y-10 pt-6 sm:pt-0">

      {/* Search bar */}
      <div className="sticky top-0 z-20 pt-2 pb-4" style={{ background: '#fff7fb' }}>
        {isSearching && (
          <div
            className="mb-2 flex items-center gap-2 text-sm cursor-pointer font-semibold"
            style={{ color: '#ec3d97' }}
            onClick={() => { setInputValue(""); setSearchQuery(""); }}
          >
            <span>←</span>
            <span>Back to all kaomoji</span>
          </div>
        )}
        <div className="max-w-xl mx-auto flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearchQuery(inputValue)}
            placeholder="Search kaomoji..."
            className="flex-1 h-12 px-4 text-sm bg-white focus:outline-none transition-all"
            style={{ border: '2px solid #ffb8d8', borderRadius: '16px', color: '#2b1b25' }}
            onFocus={e => { (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(236,61,151,0.12)'; }}
            onBlur={e => { (e.target as HTMLInputElement).style.boxShadow = ''; }}
          />
          <button
            onClick={() => setSearchQuery(inputValue)}
            className="key-btn w-12 h-12 flex items-center justify-center"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#ec3d97" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.1-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Recently Used */}
      {!isSearching && (
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: '#ec3d97' }}>
              Recently Used
            </h2>
            <div className="flex items-center gap-3">
              {recentKaomoji.length > 0 && (
                <button
                  onClick={onClearRecent}
                  className="text-xs font-bold transition-colors"
                  style={{ color: '#9b7f8f' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#2b1b25'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9b7f8f'; }}
                >
                  Clear
                </button>
              )}
              <span className="text-xs font-semibold" style={{ color: '#9b7f8f' }}>
                {recentKaomoji.length ? `${recentKaomoji.length} saved` : "No history yet"}
              </span>
            </div>
          </div>

          <div
            className="p-4"
            style={{
              background: 'white',
              border: '1.5px solid #ffb8d8',
              borderRadius: '20px',
              boxShadow: '0 4px 0 #ffe0f0',
            }}
          >
            {recentKaomoji.length === 0 ? (
              <p className="text-sm font-medium" style={{ color: '#9b7f8f' }}>
                Copy a kaomoji to see it here.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {recentKaomoji.map((char) => (
                  <button key={`recent-${char}`} onClick={() => onCopy(char)} className="key-btn px-3 py-1.5 text-sm font-semibold" style={{ color: '#2b1b25' }}>
                    {char}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* No results */}
      {isSearching && filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-base font-semibold" style={{ color: '#9b7f8f' }}>No kaomoji found</p>
        </div>
      )}

      {/* Grouped kaomoji */}
      {Object.entries(grouped).map(([group, list]) => {
        const items = list as typeof KAOMOJI_DATA;
        return (
          <div key={group} className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] px-1" style={{ color: '#ec3d97' }}>
              {group}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {items.map((item) => (
                <button
                  key={item.text}
                  onClick={() => onCopy(item.text)}
                  className="key-btn px-2.5 py-2 text-sm font-medium text-center"
                  style={{ color: '#2b1b25' }}
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
