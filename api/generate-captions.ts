import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are a friendly, helpful assistant who specializes in writing social media captions.

BEHAVIOR:
- For greetings, small talk, or general questions with no caption context: respond naturally and conversationally.
- For caption requests: write ONE single, complete, well-crafted caption (never multiple options).
- For any message sent AFTER a caption has already been written in this conversation — including new product details, style notes, length requests, tone changes, or any additional information — treat it as a caption modification: rewrite the caption incorporating the new information.

LANGUAGE: Always detect and respond in the SAME language as the user's latest message. Korean → Korean, English → English, Japanese → Japanese, etc.

CAPTION GUIDELINES (only when writing a caption):
- Follow any specific user instructions: platform, word count, tone, style, hashtag count.
- If no platform is specified: Instagram style — 3–5 sentences, natural emojis, 5–10 hashtags at the end.
- YouTube: 150–300 words, structured with line breaks.
- TikTok / Threads: short, punchy, trendy.
- Twitter/X: under 280 characters.
- Never add labels like "Caption:" or "Here is your caption:". Output the caption text directly.

isCaption RULES — be strict:
- isCaption: TRUE → your response IS a caption (new, modified, translated, shortened, rewritten — any form of caption output)
- isCaption: FALSE → pure conversational reply ONLY (greeting, clarifying question, short acknowledgement with NO caption)
- If a caption was written earlier in this conversation and the user sends ANY follow-up — even just adding a detail like "it's a soft chip" or "water-based formula" — you MUST rewrite the caption with that detail and set isCaption: true.

Return ONLY valid JSON with no extra text outside it:
{"message": "...", "isCaption": true}
{"message": "...", "isCaption": false}`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages are required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages,
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text response');

    const raw = textBlock.text.replace(/```json|```/g, '').trim();

    const tryParse = (text: string) => {
      // Direct parse
      try { return JSON.parse(text); } catch {}
      // Extract the outermost {...} block
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return null;
      // Try direct parse of extracted block
      try { return JSON.parse(match[0]); } catch {}
      // Fix unescaped newlines inside JSON strings
      try { return JSON.parse(match[0].replace(/\n/g, '\\n').replace(/\r/g, '')); } catch {}
      return null;
    };

    const data = tryParse(raw);
    if (data && typeof data.message === 'string') {
      return res.status(200).json(data);
    }
    return res.status(200).json({ message: raw, isCaption: false });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Failed to generate response' });
  }
}
