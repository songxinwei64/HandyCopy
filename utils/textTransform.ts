import { CHAR_MAP } from '../data/fonts/fonts.maps';

export const transformByStyle = (
  text: string,
  style: keyof typeof CHAR_MAP
) => {
  const map = CHAR_MAP[style];
  return text
    .split('')
    .map(char => (map as Record<string, string>)[char] || char)
    .join('');
};
