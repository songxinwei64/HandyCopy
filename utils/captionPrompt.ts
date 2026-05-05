/** Builds a prompt for generating SNS captions */
export const buildCaptionPrompt = (topic: string): string =>
  `Generate 5 short, creative SNS captions for: "${topic}".
Return ONLY a valid JSON object in this exact format: {"captions": ["...", "...", "...", "...", "..."]}
Requirements:
- Each caption: 1-2 lines max, no explanations, no numbering
- Style: cute, aesthetic, casual, trendy — suitable for Instagram / TikTok / Threads
- Can include relevant emojis`;
