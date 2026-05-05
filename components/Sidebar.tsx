import React from "react";
import { Category } from "../types";
import Logo from "./Logo";

interface SidebarProps {
  activeCategory: Category;
  setActiveCategory: (cat: Category) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeCategory,
  setActiveCategory,
}) => {
  const navItems = [
    {
      id: Category.QUICK_PICKS,
      label: "Quick Picks",
      icon: "fa-bolt",
    },
    { id: Category.EMOJI, label: "Emoji Library", icon: "fa-face-smile" },
    { id: Category.KAOMOJI, label: "Cute Kaomoji", icon: "fa-heart" },
    { id: Category.FONTS, label: "Fancy Fonts", icon: "fa-font" },
    { id: Category.CAPTION_LAB, label: "Caption Lab", icon: "fa-pen-nib" },
  ];

  return (
    <aside className="w-20 md:w-64 bg-white border-r border-orange-50 flex flex-col shrink-0 transition-all duration-300">
      {/* Brand Section - Height increased to 32 to fit the larger radiating logo */}
      <div className="h-32 flex items-center px-4 md:px-6 shrink-0">
        <Logo showText={true} className="mx-auto md:mx-0" />
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-3 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveCategory(item.id)}
            className={`w-full flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 md:px-4 py-3 rounded-2xl transition-all duration-200 ${
              activeCategory === item.id
                ? "bg-orange-500 text-white shadow-lg shadow-orange-200 font-bold scale-[1.02]"
                : "text-stone-400 hover:bg-orange-50 hover:text-stone-700"
            }`}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <i className={`fas ${item.icon} text-lg`}></i>
            </div>
            <span className="text-[10px] md:text-sm font-bold md:font-semibold">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Footer Info Card */}
      <div className="p-4 border-t border-orange-50 hidden md:block">
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
            <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
              Efficiency
            </p>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed font-medium">
            Copy text styles & emojis with one click. Simple, fast, and handy.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
