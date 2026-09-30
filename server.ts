import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Proxy endpoint for Discord Webhook notifications to avoid client-side CORS issues
  app.post('/api/discord-notify', async (req: Request, res: Response) => {
    try {
      const { webhookUrl, embeds, content } = req.body;
      if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
        res.status(400).json({ error: 'URL Discord Webhook ไม่ถูกต้อง' });
        return;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content || '',
          embeds: embeds || [],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        res.status(response.status).json({ error: errText || 'Discord Webhook เกิดข้อผิดพลาด' });
        return;
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error posting Discord webhook:', error);
      res.status(500).json({ error: error?.message || 'ข้อผิดพลาดภายในเซิร์ฟเวอร์' });
    }
  });

  // In development, hook into Vite development server middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production build, serve static assets
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
