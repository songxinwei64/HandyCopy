
export enum Category {
  QUICK_PICKS = "quick",
  EMOJI = 'EMOJI',
  KAOMOJI = "KAOMOJI",
  FONTS = 'FONTS',
  SYMBOLS = 'SYMBOLS',
  CAPTION_LAB = 'CAPTION_LAB',
}

export interface EmojiItem {
  char: string;
  name: string;
  category: string;
}

export interface FontStyle {
  name: string;
  transform: (text: string) => string;
}

export interface Toast {
  id: number;
  message: string;
}
