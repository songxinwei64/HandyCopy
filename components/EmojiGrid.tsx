import React, { useMemo } from "react";
import { EMOJI_DATA } from "../data/emoji/emoji.full";
import { EMOJI_KEYWORDS_MAP } from "../data/emoji/emojiKeywordMap";
import { EmojiItem } from "../types";

interface EmojiGridProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  onSearch: () => void;
  recentEmojis: string[];
  onClearRecent: () => void;
  onCopy: (char: string) => void;
}


const EmojiGrid: React.FC<EmojiGridProps> = ({
  searchQuery,
  setSearchQuery,
  inputValue,
  setInputValue,
  onSearch,
  recentEmojis,
  onClearRecent,
  onCopy,
}) => {
  const isSearching = searchQuery.trim().length > 0;

  const filteredEmojis = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return EMOJI_DATA;
    return EMOJI_DATA.filter((emoji) => {
      const name = emoji.name?.toLowerCase() || "";
      const category = emoji.category?.toLowerCase() || "";
      if (name.includes(q) || category.includes(q)) return true;
      const keywords = EMOJI_KEYWORDS_MAP[q];
      if (!keywords) return false;
      return keywords.some((k) => name.includes(k));
    });
  }, [searchQuery]);

  const categories = useMemo<Record<string, EmojiItem[]>>(() => {
    const cats: Record<string, EmojiItem[]> = {};
    filteredEmojis.forEach((e) => {
      if (!cats[e.category]) cats[e.category] = [];
      cats[e.category].push(e);
    });
    return cats;
  }, [filteredEmojis]);

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
            <span>Back to all emojis</span>
          </div>
        )}
        <div className="max-w-xl mx-auto flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder="Search emojis..."
            className="flex-1 h-12 px-4 text-sm bg-white focus:outline-none transition-all"
            style={{
              border: '2px solid #ffb8d8',
              borderRadius: '16px',
              color: '#2b1b25',
            }}
            onFocus={e => { (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(236,61,151,0.12)'; }}
            onBlur={e => { (e.target as HTMLInputElement).style.boxShadow = ''; }}
          />
          <button
            onClick={onSearch}
            className="key-btn w-12 h-12 flex items-center justify-center"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#ec3d97" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.1-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* No results */}
      {isSearching && filteredEmojis.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20" style={{ color: '#9b7f8f' }}>
          <i className="fas fa-face-frown text-5xl mb-4" style={{ color: '#ffb8d8' }} />
          <p className="text-base font-semibold">No emojis match your search.</p>
        </div>
      )}

      {/* Recently Used */}
      {!isSearching && (
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: '#ec3d97' }}>
              Recently Used
            </h2>
            <div className="flex items-center gap-3">
              {recentEmojis.length > 0 && (
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
                {recentEmojis.length ? `${recentEmojis.length} saved` : "No history yet"}
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
            {recentEmojis.length === 0 ? (
              <p className="text-sm font-medium" style={{ color: '#9b7f8f' }}>
                Copy an emoji to see it here.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {recentEmojis.map((char) => (
                  <button
                    key={`recent-${char}`}
                    onClick={() => onCopy(char)}
                    className="key-btn aspect-square flex items-center justify-center text-3xl"
                    style={{ width: '52px' }}
                  >
                    {char}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Emoji grid by category */}
      {(Object.entries(categories) as [string, EmojiItem[]][]).map(([category, items]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] px-1" style={{ color: '#ec3d97' }}>
            {category}
          </h2>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {items.map((emoji) => (
              <button
                key={`${emoji.category}-${emoji.name}`}
                onClick={() => onCopy(emoji.char)}
                title={emoji.name}
                className="key-btn aspect-square flex items-center justify-center text-3xl"
              >
                {emoji.char}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmojiGrid;
