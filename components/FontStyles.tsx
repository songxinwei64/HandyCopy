import React, { useState } from "react";
import { FONT_STYLES } from "../constants/fontStyles";

interface FontStylesProps {
  searchQuery: string;
  onCopy: (text: string) => void;
}

const FontStyles: React.FC<FontStylesProps> = ({ searchQuery, onCopy }) => {
  const [inputText, setInputText] = useState("Have a great day");
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const styles = FONT_STYLES.filter((style) =>
    style.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (text: string, name: string) => {
    onCopy(text);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Input card */}
      <div
        className="p-6"
        style={{
          background: 'white',
          border: '2px solid #ffb8d8',
          borderRadius: '24px',
          boxShadow: '0 6px 0 #ffe0f0',
        }}
      >
        <label className="block text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#ec3d97' }}>
          Your Text
        </label>
        <textarea
          className="w-full px-4 py-3 text-xl font-bold focus:outline-none transition-all resize-none h-24"
          style={{
            background: '#fff7fb',
            border: '1.5px solid #ffb8d8',
            borderRadius: '16px',
            color: '#2b1b25',
          }}
          placeholder="Type something to stylize..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onFocus={e => {
            (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px rgba(236,61,151,0.12)';
            (e.target as HTMLTextAreaElement).style.borderColor = '#ec3d97';
          }}
          onBlur={e => {
            (e.target as HTMLTextAreaElement).style.boxShadow = '';
            (e.target as HTMLTextAreaElement).style.borderColor = '#ffb8d8';
          }}
        />
      </div>

      {/* Font list */}
      <div className="space-y-3">
        {styles.map((style) => {
          const transformed = style.transform(inputText || " ");
          const isCopied = copiedName === style.name;
          return (
            <div
              key={style.name}
              className="flex items-center justify-between gap-4 px-5 py-4 transition-all duration-150"
              style={{
                background: 'white',
                border: '1.5px solid #ffe0f0',
                borderRadius: '18px',
                boxShadow: '0 3px 0 #ffe8f4',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = '#ffb8d8';
                el.style.boxShadow = '0 5px 0 #f4c8dc';
                el.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = '#ffe0f0';
                el.style.boxShadow = '0 3px 0 #ffe8f4';
                el.style.transform = '';
              }}
            >
              <div className="flex-1 overflow-hidden">
                <span className="block text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#ec3d97' }}>
                  {style.name}
                </span>
                <p className="text-lg break-words" style={{ color: '#2b1b25' }}>{transformed}</p>
              </div>
              <button
                onClick={() => handleCopy(transformed, style.name)}
                className="shrink-0 w-10 h-10 flex items-center justify-center font-bold text-sm transition-all duration-150"
                style={{
                  background: isCopied ? '#d1fae5' : '#fff0f8',
                  color: isCopied ? '#10b981' : '#ec3d97',
                  border: `1.5px solid ${isCopied ? '#a7f3d0' : '#ffb8d8'}`,
                  borderRadius: '12px',
                  boxShadow: isCopied ? '0 3px 0 #a7f3d0' : '0 3px 0 #f4c8dc',
                }}
                onMouseEnter={e => {
                  if (!isCopied) {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.background = '#ec3d97';
                    btn.style.color = 'white';
                    btn.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isCopied) {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.background = '#fff0f8';
                    btn.style.color = '#ec3d97';
                    btn.style.transform = '';
                  }
                }}
                title="Copy"
              >
                <i className={`fas ${isCopied ? 'fa-check' : 'fa-copy'} text-sm`} />
              </button>
            </div>
          );
        })}

        {styles.length === 0 && (
          <div className="text-center py-16" style={{ color: '#9b7f8f' }}>
            <i className="fas fa-font text-4xl mb-3 block" style={{ color: '#ffb8d8' }} />
            <p className="font-semibold">No font styles match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FontStyles;
