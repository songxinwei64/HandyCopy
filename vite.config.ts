import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

function captionApiPlugin(apiKey: string): Plugin {
  return {
    name: 'caption-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/generate-captions', async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { messages } = JSON.parse(body);
            if (!Array.isArray(messages) || messages.length === 0) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Messages are required' }));
              return;
            }

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

            const Anthropic = (await import('@anthropic-ai/sdk')).default;
            const client = new Anthropic({ apiKey });
            const response = await client.messages.create({
              model: 'claude-haiku-4-5',
              max_tokens: 2048,
              system: SYSTEM_PROMPT,
              messages,
            });

            const textBlock = response.content.find((b: any) => b.type === 'text') as any;
            const raw = (textBlock?.text ?? '').replace(/```json|```/g, '').trim();
            const tryParse = (text: string) => {
              try { return JSON.parse(text); } catch {}
              const match = text.match(/\{[\s\S]*\}/);
              if (!match) return null;
              try { return JSON.parse(match[0]); } catch {}
              try { return JSON.parse(match[0].replace(/\n/g, '\\n').replace(/\r/g, '')); } catch {}
              return null;
            };
            const parsed = tryParse(raw);
            const data = (parsed && typeof parsed.message === 'string')
              ? parsed
              : { message: raw, isCaption: false };

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to generate captions' }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        captionApiPlugin(env.ANTHROPIC_API_KEY),
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
