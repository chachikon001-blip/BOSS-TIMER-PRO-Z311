import type { User } from 'firebase/auth';

export type { User };

export interface BossDefinition {
  bossNumber: number;
  bossKey: string;
  nameTh: string;
  nameEn: string;
  cooldownHours: number;
  rebootHours: number | null;
  location?: string;
  spawnChance?: '100%' | '50%' | '33%';
}

export interface BossRecord {
  id: string; // `${serverId}_${bossKey}`
  bossNumber?: number;
  bossKey: string;
  serverId: string; // 'server_1' | 'server_2' | string
  serverName: string; // 'เซิร์ฟหลัก [T3]' | 'เซิร์ฟรอง [S1]'
  serverTag?: string; // '[T3]' | '[S1]'
  nameTh: string;
  nameEn?: string;
  location?: string; // 'ตามแมพ / พื้นที่ล่า'
  cooldownHours: number;
  rebootHours?: number | null;
  spawnChance?: '100%' | '50%' | '33%';
  lastKilledAt?: string | null; // ISO string
  nextSpawnAt?: string | null; // ISO string or null ('--:-- น.')
  updatedBy?: string;
  updatedByUid?: string;
  updatedAt: string;
  isCustom?: boolean;
  isFavorite?: boolean;
}

export type ServerFilter = 'all' | 'server_1' | 'server_2';
export type StatusFilter = 'all' | 'spawned' | 'soon' | 'cooldown' | 'unknown' | 'favorite';
export type SortOption = 'soonest' | 'name' | 'cooldown' | 'number';
export type ViewMode = 'table' | 'grid';

export interface AppSettings {
  discordWebhookUrl: string;
  server1WebhookUrl: string;
  server2WebhookUrl: string;
  notifyOnKill: boolean;
  notifyBeforeMinutes: number[]; // [1, 3, 10]
  notifyAtSpawn: boolean;
  ttsEnabled: boolean;
  soundChimeEnabled: boolean;
  voiceVolume: number;
  voicePitch: number;
  voiceRate: number;
  useThaiVoice: boolean;
  server1Name: string;
  server1Tag: string;
  server2Name: string;
  server2Tag: string;
}

export interface NotificationEvent {
  bossId: string;
  bossName: string;
  serverName: string;
  minutesLeft: number;
  eventTime: number;
}
