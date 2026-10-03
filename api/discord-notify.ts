import type { Request, Response } from 'express';

// Vercel Serverless Function handler for Discord Webhook proxy
export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { webhookUrl, embeds, content } = req.body || {};
    if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      res.status(400).json({ error: 'URL Discord Webhook ไม่ถูกต้อง' });
      return;
    }

    const discordResp = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: content || '',
        embeds: embeds || [],
      }),
    });

    if (!discordResp.ok) {
      const errText = await discordResp.text().catch(() => '');
      if (discordResp.status === 404) {
        res.status(404).json({
          error: 'ไม่พบ Webhook ใน Discord (404 Unknown Webhook) กรุณาตรวจสอบว่า Webhook ใน Discord ถูกลบหรือคัดลอก URL ไม่ครบ',
        });
        return;
      }
      res.status(discordResp.status).json({
        error: errText || `Discord error ${discordResp.status}`,
      });
      return;
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal Server Error' });
  }
}
