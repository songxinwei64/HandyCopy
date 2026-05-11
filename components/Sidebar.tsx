import React from "react";
import { Category } from "../types";
import Logo from "./Logo";

interface SidebarProps {
  activeCategory: Category;
  setActiveCategory: (cat: Category) => void;
}

const navItems = [
  { id: Category.CAPTION_LAB, label: "Caption Lab", icon: "fa-pen-nib" },
  { id: Category.EMOJI,        label: "Emoji",        icon: "fa-face-smile" },
  { id: Category.KAOMOJI,      label: "Kaomoji",      icon: "fa-heart" },
  { id: Category.FONTS,        label: "Fancy Fonts",  icon: "fa-font" },
];

const Sidebar: React.FC<SidebarProps> = ({ activeCategory, setActiveCategory }) => {
  return (
    <aside
      className="w-20 md:w-64 flex flex-col shrink-0 bg-white"
      style={{ borderRight: '2px solid #ffb8d8' }}
    >
      {/* Logo */}
      <div
        className="h-20 flex items-center px-4 md:px-5 shrink-0"
        style={{ borderBottom: '1.5px solid #ffe0f0' }}
      >
        <Logo showText={true} className="md:mx-0 mx-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-3 pt-5">
        {navItems.map((item) => {
          const active = activeCategory === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveCategory(item.id)}
              className={`w-full flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 md:px-4 py-3 select-none ${
                active ? 'retro-btn-active' : 'retro-btn-inactive'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                active ? 'bg-white/20' : ''
              }`}>
                <i className={`fas ${item.icon} text-base`} />
              </div>
              <span className="text-[9px] md:text-sm font-bold leading-tight text-center md:text-left">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer hint */}
      <div className="p-4 hidden md:block">
        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: '#fff0f8', border: '1.5px solid #ffb8d8' }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ background: '#ec3d97' }} />
          <p className="text-[11px] font-semibold leading-tight" style={{ color: '#ec3d97' }}>
            Copy anything in one click
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
