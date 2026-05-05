import Anthropic from '@anthropic-ai/sdk';

const buildCaptionPrompt = (topic: string): string =>
  `Generate 5 short, creative SNS captions for: "${topic}".
Return ONLY a valid JSON object in this exact format: {"captions": ["...", "...", "...", "...", "..."]}
Requirements:
- Each caption: 1-2 lines max, no explanations, no numbering
- Style: cute, aesthetic, casual, trendy — suitable for Instagram / TikTok / Threads
- Can include relevant emojis`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.body ?? {};
  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: buildCaptionPrompt(topic.trim()) }],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text response');

    const raw = textBlock.text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(raw);

    return res.status(200).json(data);
  } catch (err) {
    console.error('Caption generation error:', err);
    return res.status(500).json({ error: 'Failed to generate captions' });
  }
}
