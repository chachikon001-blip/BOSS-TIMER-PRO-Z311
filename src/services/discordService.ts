import { BossRecord } from '../types';

export class DiscordService {
  /**
   * Send notification via backend proxy endpoint to prevent CORS restrictions
   */
  public static async sendWebhook(
    webhookUrl: string,
    payload: {
      content?: string;
      embeds?: any[];
    }
  ): Promise<{ success: boolean; error?: string }> {
    if (!webhookUrl || !webhookUrl.trim().startsWith('https://discord.com/api/webhooks/')) {
      return { success: false, error: 'URL Discord Webhook ไม่ถูกต้อง' };
    }

    try {
      // First attempt: call local server proxy
      const response = await fetch('/api/discord-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: webhookUrl.trim(),
          content: payload.content || '',
          embeds: payload.embeds || [],
        }),
      });

      if (response.ok) {
        return { success: true };
      }

      // If proxy response was not ok, try direct fetch as fallback (or return error message)
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || `HTTP error ${response.status}`,
      };
    } catch (e: any) {
      console.warn('Backend proxy call failed, attempting direct fetch fallback:', e);
      try {
        const directResp = await fetch(webhookUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (directResp.ok) return { success: true };
        return { success: false, error: 'Direct fetch failed' };
      } catch (directErr: any) {
        return { success: false, error: directErr?.message || 'ส่งข้อความไม่สำเร็จ' };
      }
    }
  }

  /**
   * Format Thai date time e.g. "29 ก.ย. 2026, 18:30:00 น."
   */
  public static formatThaiDateTime(isoString?: string | null): string {
    if (!isoString) return '--:-- น.';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--:-- น.';
    return date.toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' น.';
  }

  /**
   * Send notification when a boss has been recorded as killed
   */
  public static async notifyBossKilled(
    webhookUrl: string,
    boss: BossRecord,
    updatedByName: string = 'ผู้เล่น'
  ) {
    if (!webhookUrl) return;

    const embed = {
      title: `⚔️ บอสตายแล้ว: ${boss.nameTh} (${boss.nameEn || boss.nameTh})`,
      description: `ได้รับการอัปเดตเวลาตายในระบบ **BOSS TIMER PRO Z3**`,
      color: 0xe74c3c, // Red
      fields: [
        {
          name: '🏰 เซิร์ฟเวอร์',
          value: boss.serverName || boss.serverId,
          inline: true,
        },
        {
          name: '⏱️ คูลดาวน์เกิดใหม่',
          value: `${boss.cooldownHours} ชั่วโมง`,
          inline: true,
        },
        {
          name: '👤 บันทึกโดย',
          value: updatedByName,
          inline: true,
        },
        {
          name: '💀 เวลาที่ตาย',
          value: this.formatThaiDateTime(boss.lastKilledAt),
          inline: true,
        },
        {
          name: '🎯 เวลาเกิดรอบถัดไป',
          value: `**${this.formatThaiDateTime(boss.nextSpawnAt)}**`,
          inline: true,
        },
      ],
      footer: {
        text: 'BOSS TIMER PRO Z3 • Real-Time Boss Tracking',
      },
      timestamp: new Date().toISOString(),
    };

    return this.sendWebhook(webhookUrl, {
      content: `📢 **[${boss.serverName}]** บอส **${boss.nameTh}** ตายแล้ว! เกิดถัดไปเวลา **${this.formatThaiDateTime(boss.nextSpawnAt)}**`,
      embeds: [embed],
    });
  }

  /**
   * Send notification for upcoming boss spawn (1, 3, 5, 10 min) or spawn right now
   */
  public static async notifyBossUpcoming(
    webhookUrl: string,
    boss: BossRecord,
    minutesLeft: number
  ) {
    if (!webhookUrl) return;

    const isSpawned = minutesLeft <= 0;
    const color = isSpawned ? 0x2ecc71 : minutesLeft <= 3 ? 0xe67e22 : 0xf1c40f;
    const title = isSpawned
      ? `🚨 บอสเกิดแล้ว: ${boss.nameTh} (${boss.nameEn || boss.nameTh})!`
      : `⏳ บอสใกล้เกิดในอีก ${minutesLeft} นาที: ${boss.nameTh} (${boss.nameEn || boss.nameTh})!`;

    const embed = {
      title,
      description: isSpawned
        ? `บอสได้ถึงเวลาเกิดแล้ว เตรียมตัวเข้าจุดล่าด่วน!`
        : `บอสกำลังจะเกิดในอีก **${minutesLeft} นาที** กรุณารวมตัวเตรียมความพร้อม!`,
      color,
      fields: [
        {
          name: '🏰 เซิร์ฟเวอร์',
          value: boss.serverName || boss.serverId,
          inline: true,
        },
        {
          name: '🎯 เวลาที่คาดว่าจะเกิด',
          value: `**${this.formatThaiDateTime(boss.nextSpawnAt)}**`,
          inline: true,
        },
        {
          name: '⏳ สถานะ',
          value: isSpawned ? '🟢 เกิดแล้ว (Alive / Due)' : `🟡 เหลือ ${minutesLeft} นาที`,
          inline: true,
        },
      ],
      footer: {
        text: 'BOSS TIMER PRO Z3 • Real-Time Alert',
      },
      timestamp: new Date().toISOString(),
    };

    const mentionContent = isSpawned
      ? `@everyone 🚨 **[${boss.serverName}]** บอส **${boss.nameTh}** เกิดแล้ว! ลุยเลย!`
      : `⏰ **[${boss.serverName}]** บอส **${boss.nameTh}** จะเกิดในอีก **${minutesLeft} นาที** (${this.formatThaiDateTime(boss.nextSpawnAt)})`;

    return this.sendWebhook(webhookUrl, {
      content: mentionContent,
      embeds: [embed],
    });
  }

  /**
   * Send notification when server reboot completion is recorded
   */
  public static async notifyServerReboot(
    webhookUrl: string,
    serverName: string,
    rebootTime: Date,
    updatedBossCount: number,
    untrackedCount: number
  ) {
    if (!webhookUrl) return;

    const embed = {
      title: `🔄 บันทึกการรีบูทเซิร์ฟเวอร์เรียบร้อย: ${serverName}`,
      description: `คำนวณรอบเกิดของบอสใหม่ทั้งหมดตามตารางเวลาการรีบูท (Reboot Cooldown)`,
      color: 0x9b59b6,
      fields: [
        {
          name: '🏰 เซิร์ฟเวอร์',
          value: serverName,
          inline: true,
        },
        {
          name: '🕒 เวลาที่รีบูทเสร็จ',
          value: this.formatThaiDateTime(rebootTime.toISOString()),
          inline: true,
        },
        {
          name: '📊 บอสที่คำนวณเวลาเกิดใหม่',
          value: `${updatedBossCount} ตัว`,
          inline: true,
        },
        {
          name: '⏳ บอสที่ไม่มีเวลารีบูท (รอเวลา)',
          value: `${untrackedCount} ตัว (ตั้งค่าเป็น --:-- น.)`,
          inline: false,
        },
      ],
      footer: {
        text: 'BOSS TIMER PRO Z3 • Server Reboot Sync',
      },
      timestamp: new Date().toISOString(),
    };

    return this.sendWebhook(webhookUrl, {
      content: `🔄 **[${serverName}]** เซิร์ฟเวอร์รีบูทเสร็จสิ้นแล้วเมื่อ ${this.formatThaiDateTime(rebootTime.toISOString())} ระบบได้คำนวณเวลาเกิดบอสใหม่เรียบร้อย!`,
      embeds: [embed],
    });
  }

  /**
   * Send summary of top 30 closest bosses to Discord
   */
  public static async notifyTop30Bosses(
    webhookUrl: string,
    serverName: string,
    topBosses: BossRecord[],
    currentTime: Date = new Date()
  ) {
    if (!webhookUrl) return { success: false, error: 'ไม่มี Webhook URL' };

    const nowMs = currentTime.getTime();
    const rows = topBosses.slice(0, 30).map((b, idx) => {
      let timeStr = '--:-- น.';
      let remainingStr = 'ไม่ทราบเวลา';
      if (b.nextSpawnAt) {
        const spawnDate = new Date(b.nextSpawnAt);
        timeStr = spawnDate.toLocaleTimeString('th-TH', {
          timeZone: 'Asia/Bangkok',
          hour: '2-digit',
          minute: '2-digit',
        }) + ' น.';

        const diffMs = spawnDate.getTime() - nowMs;
        if (diffMs <= 0) {
          remainingStr = '🔴 เกิดแล้ว!';
        } else {
          const totalMin = Math.floor(diffMs / 60000);
          const h = Math.floor(totalMin / 60);
          const m = totalMin % 60;
          remainingStr = h > 0 ? `อีก ${h} ชม. ${m} น.` : `อีก ${m} นาที`;
        }
      }

      const numStr = (idx + 1).toString().padStart(2, ' ');
      return `\`${numStr}.\` **${b.nameTh}** (${timeStr}) → *${remainingStr}*`;
    });

    const listText = rows.length > 0 ? rows.join('\n') : 'ไม่มีข้อมูลบอส';

    const embed = {
      title: `📋 รายการ 30 บอสที่ใกล้เกิดที่สุด: ${serverName}`,
      description: listText,
      color: 0xf39c12, // Orange Gold
      footer: {
        text: 'BOSS TIMER PRO Z3 • ตารางเวลาบอสเรียลไทม์',
      },
      timestamp: new Date().toISOString(),
    };

    return this.sendWebhook(webhookUrl, {
      content: `📢 **[${serverName}]** ตารางเวลาเกิดของ 30 บอสที่ใกล้ที่สุด อัปเดตล่าสุด:`,
      embeds: [embed],
    });
  }

  /**
   * Test webhook
   */
  public static async testWebhook(webhookUrl: string) {
    return this.sendWebhook(webhookUrl, {
      content: '🔔 **ทดสอบการเชื่อมต่อ Discord Webhook สำเร็จ!** ยินดีต้อนรับสู่ **BOSS TIMER PRO Z3**',
      embeds: [
        {
          title: '✅ การเชื่อมต่อระบบแจ้งเตือนสำเร็จ',
          description: 'ระบบพร้อมส่งการแจ้งเตือนบอสเกิด การบันทึกบอสตาย และการรีบูทเซิร์ฟเวอร์แล้วครับ',
          color: 0x2ecc71,
          fields: [
            {
              name: 'แอปพลิเคชัน',
              value: 'BOSS TIMER PRO Z3',
              inline: true,
            },
            {
              name: 'สถานะ',
              value: '🟢 พร้อมใช้งาน Real-time Sync',
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }
}
