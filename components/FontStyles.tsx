import React, { useState } from "react";
import { FONT_STYLES } from "../constants/fontStyles";

interface FontStylesProps {
  searchQuery: string;
  onCopy: (text: string) => void;
}

const FontStyles: React.FC<FontStylesProps> = ({ searchQuery, onCopy }) => {
  const [inputText, setInputText] = useState("Have a great day");

  const styles = FONT_STYLES.filter((style) =>
    style.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Input area */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6">
        <label className="block text-xs font-black text-pink-400 uppercase tracking-widest mb-3">
          Your Text
        </label>
        <textarea
          className="w-full px-4 py-3 border border-pink-100 rounded-2xl bg-pink-50/50 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 focus:bg-white transition-all text-xl font-bold placeholder:text-stone-200 resize-none h-24"
          placeholder="Type something to stylize..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </div>

      {/* Font list */}
      <div className="space-y-3">
        {styles.map((style) => {
          const transformed = style.transform(inputText || " ");
          return (
            <div
              key={style.name}
              className="group bg-white rounded-2xl border border-pink-50 px-5 py-4 flex items-center justify-between gap-4 hover:border-pink-200 hover:shadow-md transition-all"
            >
              <div className="flex-1 overflow-hidden">
                <span className="block text-[10px] font-black text-pink-300 uppercase tracking-widest mb-1">
                  {style.name}
                </span>
                <p className="text-lg text-stone-800 break-words">{transformed}</p>
              </div>
              <button
                onClick={() => onCopy(transformed)}
                className="shrink-0 w-10 h-10 bg-pink-50 text-pink-500 hover:bg-pink-500 hover:text-white rounded-xl transition-all active:scale-90 flex items-center justify-center"
                title="Copy"
              >
                <i className="fas fa-copy text-sm" />
              </button>
            </div>
          );
        })}

        {styles.length === 0 && (
          <div className="text-center py-16 text-stone-300">
            <i className="fas fa-font text-4xl mb-3 block" />
            <p className="font-medium">No font styles match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FontStyles;
