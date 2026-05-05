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
            const { topic } = JSON.parse(body);
            if (!topic?.trim()) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Topic is required' }));
              return;
            }

            const Anthropic = (await import('@anthropic-ai/sdk')).default;
            const { buildCaptionPrompt } = await import('./utils/captionPrompt');
            const client = new Anthropic({ apiKey });
            const message = await client.messages.create({
              model: 'claude-haiku-4-5',
              max_tokens: 1024,
              messages: [{ role: 'user', content: buildCaptionPrompt(topic.trim()) }],
            });

            const textBlock = message.content.find((b: any) => b.type === 'text') as any;
            const raw = (textBlock?.text ?? '').replace(/```json|```/g, '').trim();
            const data = JSON.parse(raw);

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
