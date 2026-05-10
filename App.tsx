import React, { useState, useCallback, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Category, Toast as IToast } from "./types";
import Sidebar from "./components/Sidebar";
import EmojiGrid from "./components/EmojiGrid";
import FontStyles from "./components/FontStyles";
import Toast from "./components/Toast";
import KaomojiGrid from "./components/KaomojiGrid";
import CaptionLab from "./components/CaptionLab";

type CopyType = "emoji" | "kaomoji" | "font";

const App: React.FC = () => {
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem("recentEmojis") || "[]");
  });

  const [recentKaomoji, setRecentKaomoji] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem("recentKaomoji") || "[]");
  });

  const [activeCategory, setActiveCategory] = useState<Category>(
    Category.CAPTION_LAB
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [toasts, setToasts] = useState<IToast[]>([]);

  const addToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }, []);

  const handleCopy = useCallback(
    (text: string, type?: CopyType) => {
      navigator.clipboard.writeText(text).then(() => {
        if (type === "emoji") {
          setRecentEmojis((prev) => {
            const filtered = prev.filter((e) => e !== text);
            const updated = [text, ...filtered].slice(0, 30);
            localStorage.setItem("recentEmojis", JSON.stringify(updated));
            return updated;
          });
        }
        if (type === "kaomoji") {
          setRecentKaomoji((prev) => {
            const updated = [text, ...prev.filter((e) => e !== text)].slice(0, 30);
            localStorage.setItem("recentKaomoji", JSON.stringify(updated));
            return updated;
          });
        }
        addToast(`Copied: ${text.slice(0, 10)}${text.length > 10 ? "..." : ""}`);
      });
    },
    [addToast]
  );

  const clearRecentEmojis = useCallback(() => {
    setRecentEmojis([]);
    localStorage.removeItem("recentEmojis");
    addToast("Cleared recent emojis");
  }, [addToast]);

  const clearRecentKaomoji = useCallback(() => {
    setRecentKaomoji([]);
    localStorage.removeItem("recentKaomoji");
    addToast("Cleared recent kaomoji");
  }, [addToast]);

  useEffect(() => {
    setSearchQuery("");
    setInputValue("");
  }, [activeCategory]);

  useEffect(() => {
    let title = "HandyCopy – Copy Emojis, Kaomoji & Fancy Fonts";
    let description = "HandyCopy is a clean and simple tool to copy emojis, kaomoji, and fancy fonts instantly.";

    switch (activeCategory) {
      case Category.EMOJI:
        title = "Emoji Copy Tool – Copy & Paste Emojis | HandyCopy";
        description = "Browse and copy emojis instantly. Perfect for chat, social media, and daily use.";
        break;
      case Category.KAOMOJI:
        title = "Kaomoji Copy Tool – Cute Japanese Emoticons | HandyCopy";
        description = "Copy cute Japanese kaomoji faces for messages, reactions, and fun expressions.";
        break;
      case Category.FONTS:
        title = "Fancy Font Generator – Stylish Text Copy | HandyCopy";
        description = "Generate and copy fancy fonts and stylish text for bios, posts, and designs.";
        break;
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (metaDesc) metaDesc.content = description;
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) canonical.href = "https://handycopy.app/";
  }, [activeCategory]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#fdf5f9] text-stone-800">
      <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      <main className="flex-1 flex flex-col min-w-0">
        {activeCategory !== Category.CAPTION_LAB && (
          <header className="h-20 border-b border-pink-100 bg-white/60 backdrop-blur-md flex items-center px-8 shrink-0">
            <h1 className="text-2xl font-black text-stone-800 tracking-tight">
              {activeCategory === Category.EMOJI && "Emoji Library"}
              {activeCategory === Category.KAOMOJI && "Cute Kaomoji"}
              {activeCategory === Category.FONTS && "Fancy Font"}
            </h1>
          </header>
        )}

        {activeCategory === Category.CAPTION_LAB ? (
          <CaptionLab onCopy={(t: string) => handleCopy(t)} />
        ) : (
          <section className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              {activeCategory === Category.EMOJI && (
                <EmojiGrid
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  onSearch={() => setSearchQuery(inputValue)}
                  recentEmojis={recentEmojis}
                  onClearRecent={clearRecentEmojis}
                  onCopy={(t: string) => handleCopy(t, "emoji")}
                />
              )}
              {activeCategory === Category.KAOMOJI && (
                <KaomojiGrid
                  recentKaomoji={recentKaomoji}
                  onClearRecent={clearRecentKaomoji}
                  onCopy={(t: string) => handleCopy(t, "kaomoji")}
                />
              )}
              {activeCategory === Category.FONTS && (
                <FontStyles
                  searchQuery={searchQuery}
                  onCopy={(t: string) => handleCopy(t, "font")}
                />
              )}
            </div>
          </section>
        )}
      </main>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} />
        ))}
      </div>

      <Analytics />
    </div>
  );
};

export default App;
