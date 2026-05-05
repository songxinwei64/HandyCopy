import React, { useState, useCallback, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Category, Toast as IToast } from "./types";
import Sidebar from "./components/Sidebar";
import EmojiGrid from "./components/EmojiGrid";
import FontStyles from "./components/FontStyles";
import Toast from "./components/Toast";
import KaomojiGrid from "./components/KaomojiGrid";
import QuickPicks from "./components/QuickPicks";
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
    Category.QUICK_PICKS
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

  // ✅ 关键：不再依赖 activeCategory，而是由调用方传 type
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
            const updated = [text, ...prev.filter((e) => e !== text)].slice(
              0,
              30
            );
            localStorage.setItem("recentKaomoji", JSON.stringify(updated));
            return updated;
          });
        }

        addToast(
          `Copied: ${text.slice(0, 10)}${text.length > 10 ? "..." : ""}`
        );
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

  // ✅ SEO：按页面动态更新 title / description
  useEffect(() => {
    let title = "HandyCopy – Copy Emojis, Kaomoji & Fancy Fonts";
    let description =
      "HandyCopy is a clean and simple tool to copy emojis, kaomoji, and fancy fonts instantly.";

    switch (activeCategory) {
      case Category.QUICK_PICKS:
        title = "Quick Emoji & Kaomoji Picks – HandyCopy";
        description =
          "Quick picks of emojis and kaomoji you use most. Copy instantly with one click.";
        break;
      case Category.EMOJI:
        title = "Emoji Copy Tool – Copy & Paste Emojis | HandyCopy";
        description =
          "Browse and copy emojis instantly. Perfect for chat, social media, and daily use.";
        break;
      case Category.KAOMOJI:
        title = "Kaomoji Copy Tool – Cute Japanese Emoticons | HandyCopy";
        description =
          "Copy cute Japanese kaomoji faces for messages, reactions, and fun expressions.";
        break;
      case Category.FONTS:
        title = "Fancy Font Generator – Stylish Text Copy | HandyCopy";
        description =
          "Generate and copy fancy fonts and stylish text for bios, posts, and designs.";
        break;
      default:
        title = "HandyCopy – Copy Emojis, Kaomoji & Fancy Fonts";
        description =
          "HandyCopy is a clean and simple tool to copy emojis, kaomoji, and fancy fonts instantly.";
        break;
    }

    document.title = title;

    const metaDesc = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;
    if (metaDesc) metaDesc.content = description;

    // ✅ canonical（需要 index.html 里有 <link rel="canonical" ...>）
    const canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    if (canonical) canonical.href = "https://handycopy.app/";
  }, [activeCategory]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#fffaf5] text-stone-800">
      {/* Sidebar Navigation */}
      <Sidebar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-orange-100 bg-white/60 backdrop-blur-md flex items-center px-8 shrink-0">
          <h1 className="text-2xl font-black text-stone-800 tracking-tight">
            {activeCategory === Category.QUICK_PICKS && "Quick Picks"}
            {activeCategory === Category.EMOJI && "Emoji Library"}
            {activeCategory === Category.KAOMOJI && "Cute Kaomoji"}
            {activeCategory === Category.FONTS && "Fancy Font"}
            {activeCategory === Category.CAPTION_LAB && "Caption Lab"}
          </h1>
        </header>

        <section className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {activeCategory === Category.QUICK_PICKS && (
              <QuickPicks
                // ✅ QuickPicks 内部会传 (text, "emoji"/"kaomoji")
                onCopy={handleCopy}
                recentEmojis={recentEmojis}
                recentKaomoji={recentKaomoji}
                onClearRecentEmojis={clearRecentEmojis}
                onClearRecentKaomoji={clearRecentKaomoji}
                onGoEmoji={() => setActiveCategory(Category.EMOJI)}
                onGoKaomoji={() => setActiveCategory(Category.KAOMOJI)}
              />
            )}

            {activeCategory === Category.EMOJI && (
              <EmojiGrid
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                inputValue={inputValue}
                setInputValue={setInputValue}
                onSearch={() => setSearchQuery(inputValue)}
                recentEmojis={recentEmojis}
                onClearRecent={clearRecentEmojis}
                // ✅ 这里强制标记为 emoji
                onCopy={(t: string) => handleCopy(t, "emoji")}
              />
            )}

            {activeCategory === Category.KAOMOJI && (
              <KaomojiGrid
                recentKaomoji={recentKaomoji}
                onClearRecent={clearRecentKaomoji}
                // ✅ 这里强制标记为 kaomoji
                onCopy={(t: string) => handleCopy(t, "kaomoji")}
              />
            )}

            {activeCategory === Category.FONTS && (
              <FontStyles
                searchQuery={searchQuery}
                // ✅ 可选：fonts 不需要 recent 就不传 type；想统一就传 "font"
                onCopy={(t: string) => handleCopy(t, "font")}
              />
            )}

            {activeCategory === Category.CAPTION_LAB && (
              <CaptionLab onCopy={(t: string) => handleCopy(t)} />
            )}
          </div>
        </section>
      </main>

      {/* Toast Notifications */}
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
