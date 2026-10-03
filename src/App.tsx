import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BossRecord,
  ServerFilter,
  StatusFilter,
  SortOption,
  ViewMode,
  AppSettings,
  User,
} from './types';
import { DEFAULT_BOSSES } from './data/defaultBosses';
import {
  db,
  auth,
  testFirestoreConnection,
  signInWithGoogle,
  signOutUser,
  onAuthStateChanged,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { soundService } from './services/soundService';
import { DiscordService } from './services/discordService';
import { Navbar } from './components/Navbar';
import { MetricsHeader } from './components/MetricsHeader';
import { BossControlBar } from './components/BossControlBar';
import { BossTable } from './components/BossTable';
import { BossCard } from './components/BossCard';
import { RebootModal } from './components/RebootModal';
import { CustomTimeModal } from './components/CustomTimeModal';
import { AddBossModal } from './components/AddBossModal';
import { SettingsModal } from './components/SettingsModal';
import { EditServerModal } from './components/EditServerModal';
import { EditBossModal } from './components/EditBossModal';
import { SendTop30Modal } from './components/SendTop30Modal';
import { PasteSheetModal } from './components/PasteSheetModal';
import { formatBossesForSheets, copyColoredBossesToClipboard } from './utils/formatTime';

const STORAGE_KEY_SETTINGS = 'boss_timer_pro_settings_v4';
const STORAGE_KEY_LOCAL_BOSSES = 'boss_timer_pro_z3_bosses_v4';
const STORAGE_KEY_FAVORITES = 'boss_timer_pro_favorites_v4';

const DEFAULT_SETTINGS: AppSettings = {
  discordWebhookUrl: '',
  server1WebhookUrl: '',
  server2WebhookUrl: '',
  notifyOnKill: true,
  notifyBeforeMinutes: [10, 3, 1],
  notifyAtSpawn: true,
  ttsEnabled: true,
  soundChimeEnabled: true,
  voiceVolume: 0.9,
  voicePitch: 1.0,
  voiceRate: 1.05,
  useThaiVoice: true,
  server1Name: 'เซิร์ฟหลัก',
  server1Tag: '[T3]',
  server2Name: 'เซิร์ฟรอง',
  server2Tag: '[S1]',
};

function generateInitialBossList(
  s1Name = 'เซิร์ฟหลัก',
  s1Tag = '[T3]',
  s2Name = 'เซิร์ฟรอง',
  s2Tag = '[S1]',
  withDemoSeeds = false
): BossRecord[] {
  const result: BossRecord[] = [];
  const servers = [
    { id: 'server_1', name: `${s1Name} ${s1Tag}`, tag: s1Tag },
    { id: 'server_2', name: `${s2Name} ${s2Tag}`, tag: s2Tag },
  ];

  const now = Date.now();

  for (const s of servers) {
    for (const b of DEFAULT_BOSSES) {
      let nextSpawnAt: string | null = null;
      let lastKilledAt: string | null = null;
      let isFavorite = false;

      // Seed realistic preview spawn times only if requested
      if (withDemoSeeds && s.id === 'server_1') {
        if (b.bossKey === 'selu') {
          // Selu in ~1 hr 27 min
          nextSpawnAt = new Date(now + 87 * 60 * 1000).toISOString();
          lastKilledAt = new Date(now - (7.5 * 60 - 87) * 60 * 1000).toISOString();
        } else if (b.bossKey === 'enkura') {
          // Enkura in ~9 hr 48 min
          nextSpawnAt = new Date(now + 588 * 60 * 1000).toISOString();
          lastKilledAt = new Date(now - 120 * 60 * 1000).toISOString();
        } else if (b.bossKey === 'medusa') {
          // Medusa in ~13 hr 22 min with Star favorite
          nextSpawnAt = new Date(now + 802 * 60 * 1000).toISOString();
          lastKilledAt = new Date(now - 60 * 60 * 1000).toISOString();
          isFavorite = true;
        }
      }

      result.push({
        id: `${s.id}_${b.bossKey}`,
        bossNumber: b.bossNumber,
        bossKey: b.bossKey,
        serverId: s.id,
        serverName: s.name,
        serverTag: s.tag,
        nameTh: b.nameTh,
        nameEn: b.nameEn,
        location: b.location || 'ตามแมพ / พื้นที่ล่า',
        cooldownHours: b.cooldownHours,
        rebootHours: b.rebootHours,
        spawnChance: b.spawnChance || '100%',
        lastKilledAt,
        nextSpawnAt,
        updatedBy: 'ระบบเริ่มต้น',
        updatedAt: new Date().toISOString(),
        isCustom: false,
        isFavorite,
      });
    }
  }

  return result;
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Error reading settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) {
      console.warn('Error reading favorites:', e);
    }
    return new Set(['server_1_medusa']);
  });

  const [bosses, setBosses] = useState<BossRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOCAL_BOSSES);
      if (saved) {
        const parsed = JSON.parse(saved) as BossRecord[];
        if (Array.isArray(parsed) && parsed.length >= 40) {
          return parsed.map((p) => {
            const def = DEFAULT_BOSSES.find((db) => db.bossKey === p.bossKey);
            return {
              ...p,
              spawnChance: p.spawnChance || def?.spawnChance || '100%',
            };
          });
        }
      }
    } catch (e) {
      console.warn('Error reading local cache:', e);
    }
    return generateInitialBossList(
      DEFAULT_SETTINGS.server1Name,
      DEFAULT_SETTINGS.server1Tag,
      DEFAULT_SETTINGS.server2Name,
      DEFAULT_SETTINGS.server2Tag
    );
  });

  const [user, setUser] = useState<User | null>(null);
  const [serverFilter, setServerFilter] = useState<ServerFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('soonest');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Modals state
  const [isRebootOpen, setIsRebootOpen] = useState(false);
  const [customTimeBoss, setCustomTimeBoss] = useState<BossRecord | null>(null);
  const [isAddBossOpen, setIsAddBossOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSendTop30Open, setIsSendTop30Open] = useState(false);
  const [isPasteSheetOpen, setIsPasteSheetOpen] = useState(false);
  const [isCopiedAll, setIsCopiedAll] = useState(false);
  const [editingServer, setEditingServer] = useState<'server_1' | 'server_2' | null>(null);
  const [editingBoss, setEditingBoss] = useState<BossRecord | null>(null);

  const notifiedEventsRef = useRef<Set<string>>(new Set());

  // 1. Firebase Auth & connection test
  useEffect(() => {
    testFirestoreConnection();
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Real-time Firestore onSnapshot sync
  useEffect(() => {
    const bossesColl = collection(db, 'bosses');

    const unsubscribe = onSnapshot(
      bossesColl,
      (snapshot) => {
        const baseList = generateInitialBossList(
          settings.server1Name,
          settings.server1Tag,
          settings.server2Name,
          settings.server2Tag
        );
        const map = new Map<string, BossRecord>();
        baseList.forEach((b) => map.set(b.id, b));

        if (!snapshot.empty) {
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as BossRecord;
            const def = DEFAULT_BOSSES.find((db) => db.bossKey === data.bossKey);
            data.spawnChance = data.spawnChance || def?.spawnChance || '100%';
            data.isFavorite = favorites.has(data.id);
            map.set(data.id, data);
          });
        }

        const mergedList = Array.from(map.values());
        setBosses(mergedList);
        try {
          localStorage.setItem(STORAGE_KEY_LOCAL_BOSSES, JSON.stringify(mergedList));
        } catch (e) {
          console.warn('LocalStorage save error:', e);
        }
      },
      (error) => {
        console.warn('Firestore onSnapshot subscription warning:', error);
        // Ensure bosses are populated even if offline or permission denied
        setBosses((curr) => {
          if (curr.length === 0) {
            return generateInitialBossList(
              settings.server1Name,
              settings.server1Tag,
              settings.server2Name,
              settings.server2Tag
            );
          }
          return curr;
        });
      }
    );

    return () => unsubscribe();
  }, [favorites, settings.server1Name, settings.server1Tag, settings.server2Name, settings.server2Tag]);

  // 3. 1-second clock loop
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      checkNotificationTriggers(now);
    }, 1000);

    return () => clearInterval(timer);
  }, [bosses, settings]);

  // Save settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Settings save error:', e);
    }
  };

  // Google Sign-In / Sign-Out
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      alert('เข้าสู่ระบบไม่สำเร็จ: ' + (err?.message || ''));
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  // Helper to get Discord webhook URL based on boss server
  const getWebhookForBoss = (boss: BossRecord): string => {
    if (boss.serverId === 'server_1') {
      return settings.server1WebhookUrl || settings.discordWebhookUrl;
    }
    if (boss.serverId === 'server_2') {
      return settings.server2WebhookUrl || settings.discordWebhookUrl;
    }
    return settings.discordWebhookUrl;
  };

  // Notifications check
  const checkNotificationTriggers = (now: Date) => {
    const hasAnyWebhook = settings.discordWebhookUrl || settings.server1WebhookUrl || settings.server2WebhookUrl;
    if (!settings.ttsEnabled && !settings.soundChimeEnabled && !hasAnyWebhook) {
      return;
    }

    bosses.forEach((boss) => {
      if (!boss.nextSpawnAt) return;
      const spawnDate = new Date(boss.nextSpawnAt);
      const diffMs = spawnDate.getTime() - now.getTime();
      const diffSec = Math.floor(diffMs / 1000);

      const targetMinutes = settings.notifyBeforeMinutes || [10, 3, 1];
      const targetWebhook = getWebhookForBoss(boss);

      targetMinutes.forEach((min) => {
        const targetSec = min * 60;
        if (diffSec >= targetSec - 1 && diffSec <= targetSec + 1) {
          const key = `${boss.id}_${boss.nextSpawnAt}_min_${min}`;
          if (!notifiedEventsRef.current.has(key)) {
            notifiedEventsRef.current.add(key);

            soundService.alertBossEvent(boss.nameTh, boss.serverName, min, {
              ttsEnabled: settings.ttsEnabled,
              chimeEnabled: settings.soundChimeEnabled,
              volume: settings.voiceVolume,
              rate: settings.voiceRate,
            });

            if (targetWebhook) {
              DiscordService.notifyBossUpcoming(targetWebhook, boss, min);
            }
          }
        }
      });

      if (settings.notifyAtSpawn && diffSec >= -1 && diffSec <= 2) {
        const key = `${boss.id}_${boss.nextSpawnAt}_spawned`;
        if (!notifiedEventsRef.current.has(key)) {
          notifiedEventsRef.current.add(key);

          soundService.alertBossEvent(boss.nameTh, boss.serverName, 0, {
            ttsEnabled: settings.ttsEnabled,
            chimeEnabled: settings.soundChimeEnabled,
            volume: settings.voiceVolume,
            rate: settings.voiceRate,
          });

          if (targetWebhook) {
            DiscordService.notifyBossUpcoming(targetWebhook, boss, 0);
          }
        }
      }
    });
  };

  // Save boss record
  const saveBossRecord = async (updated: BossRecord) => {
    setBosses((prev) => {
      const next = prev.map((b) => (b.id === updated.id ? updated : b));
      try {
        localStorage.setItem(STORAGE_KEY_LOCAL_BOSSES, JSON.stringify(next));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      return next;
    });

    try {
      const cleanData: any = { ...updated };
      Object.keys(cleanData).forEach((key) => {
        if (cleanData[key] === undefined) {
          delete cleanData[key];
        }
      });
      const bossRef = doc(db, 'bosses', updated.id);
      await setDoc(bossRef, cleanData);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (boss: BossRecord) => {
    const nextFavorites = new Set(favorites);
    if (nextFavorites.has(boss.id)) {
      nextFavorites.delete(boss.id);
    } else {
      nextFavorites.add(boss.id);
    }
    setFavorites(nextFavorites);
    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(Array.from(nextFavorites)));
    } catch (e) {
      console.warn('Favorites save error:', e);
    }

    setBosses((prev) =>
      prev.map((b) => (b.id === boss.id ? { ...b, isFavorite: nextFavorites.has(boss.id) } : b))
    );
  };

  // Quick Kill: นำเวลาเกิดล่าสุดมา + กับคูลดาวน์ (ถ้ายังไม่มีเวลาเดิม จึงใช้เวลาปัจจุบัน)
  const handleQuickKill = async (boss: BossRecord) => {
    let baseTime: Date;

    if (boss.nextSpawnAt) {
      const parsed = new Date(boss.nextSpawnAt);
      if (!isNaN(parsed.getTime())) {
        baseTime = parsed;
      } else {
        baseTime = new Date();
      }
    } else {
      baseTime = new Date();
    }

    const nextSpawnDate = new Date(baseTime.getTime() + boss.cooldownHours * 3600 * 1000);
    const updatedByName = user?.displayName || user?.email || 'ผู้เล่น';

    const updated: BossRecord = {
      ...boss,
      lastKilledAt: baseTime.toISOString(),
      nextSpawnAt: nextSpawnDate.toISOString(),
      updatedBy: updatedByName,
      updatedByUid: user?.uid || 'anonymous',
      updatedAt: new Date().toISOString(),
    };

    soundService.playChime('kill', 0.6);
    await saveBossRecord(updated);

    const targetWebhook = getWebhookForBoss(boss);
    if (targetWebhook && settings.notifyOnKill) {
      DiscordService.notifyBossKilled(targetWebhook, updated, updatedByName);
    }
  };

  // Custom Time Kill
  const handleCustomTimeKill = async (boss: BossRecord, killedAtDate: Date) => {
    const nextSpawnDate = new Date(killedAtDate.getTime() + boss.cooldownHours * 3600 * 1000);
    const updatedByName = user?.displayName || user?.email || 'ผู้เล่น';

    const updated: BossRecord = {
      ...boss,
      lastKilledAt: killedAtDate.toISOString(),
      nextSpawnAt: nextSpawnDate.toISOString(),
      updatedBy: updatedByName,
      updatedByUid: user?.uid || 'anonymous',
      updatedAt: new Date().toISOString(),
    };

    soundService.playChime('kill', 0.6);
    await saveBossRecord(updated);

    const customWebhook = getWebhookForBoss(boss);
    if (customWebhook && settings.notifyOnKill) {
      DiscordService.notifyBossKilled(customWebhook, updated, updatedByName);
    }
  };

  // Reset single boss (รีเซ็ตได้ทันที ไม่บล็อกด้วย confirm dialog)
  const handleResetTime = async (boss: BossRecord) => {
    const updated: BossRecord = {
      ...boss,
      nextSpawnAt: null,
      lastKilledAt: null,
      updatedBy: user?.displayName || user?.email || 'รีเซ็ตเวลา',
      updatedAt: new Date().toISOString(),
    };
    soundService.playChime('test', 0.5);
    await saveBossRecord(updated);
  };

  // Reset All Times (รีเซ็ตทั้งหมดได้ทันที)
  const handleResetAllTimes = async () => {
    const targets = filteredAndSortedBosses.map((b) => b.id);
    const updatedList = bosses.map((b) => {
      if (targets.includes(b.id)) {
        return {
          ...b,
          nextSpawnAt: null,
          lastKilledAt: null,
          updatedBy: user?.displayName || user?.email || 'รีเซ็ตเวลา',
          updatedAt: new Date().toISOString(),
        };
      }
      return b;
    });

    setBosses(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY_LOCAL_BOSSES, JSON.stringify(updatedList));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    soundService.playChime('test', 0.5);

    for (const b of updatedList) {
      if (targets.includes(b.id)) {
        try {
          const cleanData: any = { ...b };
          Object.keys(cleanData).forEach((key) => {
            if (cleanData[key] === undefined) delete cleanData[key];
          });
          await setDoc(doc(db, 'bosses', b.id), cleanData);
        } catch (e) {
          // ignore
        }
      }
    }
  };

  // Update boss spawn time directly (เเก้เวลาเกิดตรงนี้ได้เลย)
  const handleUpdateSpawnTime = async (boss: BossRecord, newSpawnDate: Date) => {
    const updatedByName = user?.displayName || user?.email || 'แก้ไขเวลา';
    const updated: BossRecord = {
      ...boss,
      nextSpawnAt: newSpawnDate.toISOString(),
      updatedBy: updatedByName,
      updatedByUid: user?.uid || 'anonymous',
      updatedAt: new Date().toISOString(),
    };
    soundService.playChime('test', 0.5);
    await saveBossRecord(updated);
  };

  // Test voice for boss
  const handleTestVoice = (boss: BossRecord) => {
    soundService.alertBossEvent(boss.nameTh, boss.serverName, 5, {
      ttsEnabled: true,
      chimeEnabled: true,
      volume: settings.voiceVolume,
      rate: settings.voiceRate,
    });
  };

  // Apply batch import from Google Sheets / Excel
  const handleApplySheetImport = async (
    updates: {
      bossId: string;
      nextSpawnAt: string | null;
      lastKilledAt: string | null;
      cooldownHours?: number;
    }[]
  ) => {
    if (updates.length === 0) return;

    const updateMap = new Map(updates.map((u) => [u.bossId, u]));
    const updatedByName = user?.displayName || user?.email || 'วางจากชีต';

    const nextList = bosses.map((b) => {
      const u = updateMap.get(b.id);
      if (!u) return b;
      return {
        ...b,
        nextSpawnAt: u.nextSpawnAt,
        lastKilledAt: u.lastKilledAt ?? b.lastKilledAt,
        cooldownHours: u.cooldownHours ?? b.cooldownHours,
        updatedBy: updatedByName,
        updatedByUid: user?.uid || 'anonymous',
        updatedAt: new Date().toISOString(),
      };
    });

    setBosses(nextList);
    try {
      localStorage.setItem(STORAGE_KEY_LOCAL_BOSSES, JSON.stringify(nextList));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    soundService.playChime('spawn', 0.8);

    // Save to Firestore
    try {
      for (const u of updates) {
        const docRef = doc(db, 'bosses', u.bossId);
        const dataToSave: any = {
          nextSpawnAt: u.nextSpawnAt,
          updatedBy: updatedByName,
          updatedByUid: user?.uid || 'anonymous',
          updatedAt: new Date().toISOString(),
        };
        if (u.lastKilledAt !== undefined) dataToSave.lastKilledAt = u.lastKilledAt;
        if (u.cooldownHours !== undefined) dataToSave.cooldownHours = u.cooldownHours;

        await setDoc(docRef, dataToSave, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore sheet import write error:', e);
    }
  };

  // Server Reboot Action
  const handleConfirmReboot = async (
    targetServer: ServerFilter,
    rebootDate: Date,
    sendDiscordAlert: boolean
  ) => {
    const updatedList = [...bosses];
    let updatedBossCount = 0;
    let untrackedCount = 0;

    const targets = targetServer === 'all' ? ['server_1', 'server_2'] : [targetServer];

    for (let i = 0; i < updatedList.length; i++) {
      const b = updatedList[i];
      if (targets.includes(b.serverId)) {
        if (b.rebootHours && b.rebootHours > 0) {
          const nextSpawn = new Date(rebootDate.getTime() + b.rebootHours * 3600 * 1000);
          updatedList[i] = {
            ...b,
            lastKilledAt: rebootDate.toISOString(),
            nextSpawnAt: nextSpawn.toISOString(),
            updatedBy: `รีบูท (${user?.displayName || 'ผู้ดูแล'})`,
            updatedAt: new Date().toISOString(),
          };
          updatedBossCount++;
        } else {
          updatedList[i] = {
            ...b,
            nextSpawnAt: null,
            updatedBy: `รีบูท (${user?.displayName || 'ผู้ดูแล'})`,
            updatedAt: new Date().toISOString(),
          };
          untrackedCount++;
        }

        try {
          const docRef = doc(db, 'bosses', updatedList[i].id);
          await setDoc(docRef, updatedList[i]);
        } catch (e) {
          console.warn('Firestore reboot save error:', e);
        }
      }
    }

    setBosses(updatedList);
    soundService.playChime('spawn', 0.8);

    if (sendDiscordAlert && settings.discordWebhookUrl) {
      const serverLabel =
        targetServer === 'all'
          ? 'ทั้งสองเซิร์ฟเวอร์'
          : targetServer === 'server_1'
          ? `${settings.server1Name} ${settings.server1Tag}`
          : `${settings.server2Name} ${settings.server2Tag}`;

      await DiscordService.notifyServerReboot(
        settings.discordWebhookUrl,
        serverLabel,
        rebootDate,
        updatedBossCount,
        untrackedCount
      );
    }
  };

  // Add Custom Boss
  const handleAddBoss = async (newBossData: {
    nameTh: string;
    nameEn: string;
    cooldownHours: number;
    rebootHours: number | null;
    targetServer: ServerFilter;
  }) => {
    const serversToCreate =
      newBossData.targetServer === 'all'
        ? [
            { id: 'server_1', name: `${settings.server1Name} ${settings.server1Tag}`, tag: settings.server1Tag },
            { id: 'server_2', name: `${settings.server2Name} ${settings.server2Tag}`, tag: settings.server2Tag },
          ]
        : newBossData.targetServer === 'server_1'
        ? [{ id: 'server_1', name: `${settings.server1Name} ${settings.server1Tag}`, tag: settings.server1Tag }]
        : [{ id: 'server_2', name: `${settings.server2Name} ${settings.server2Tag}`, tag: settings.server2Tag }];

    const bossKey = `custom_${Date.now()}`;
    const newRecords: BossRecord[] = serversToCreate.map((srv) => ({
      id: `${srv.id}_${bossKey}`,
      bossNumber: bosses.length + 1,
      bossKey,
      serverId: srv.id,
      serverName: srv.name,
      serverTag: srv.tag,
      nameTh: newBossData.nameTh,
      nameEn: newBossData.nameEn,
      location: 'ตามแมพ / พื้นที่ล่า',
      cooldownHours: newBossData.cooldownHours,
      rebootHours: newBossData.rebootHours,
      lastKilledAt: null,
      nextSpawnAt: null,
      updatedBy: user?.displayName || user?.email || 'ผู้สร้างบอส',
      updatedAt: new Date().toISOString(),
      isCustom: true,
      isFavorite: false,
    }));

    for (const rec of newRecords) {
      await saveBossRecord(rec);
    }

    alert(`เพิ่มบอส "${newBossData.nameTh}" เรียบร้อยแล้ว!`);
  };

  // Edit Server Name & Tag
  const handleSaveServerInfo = (key: 'server_1' | 'server_2', newName: string, newTag: string) => {
    const nextSettings =
      key === 'server_1'
        ? { ...settings, server1Name: newName, server1Tag: newTag }
        : { ...settings, server2Name: newName, server2Tag: newTag };

    handleSaveSettings(nextSettings);

    // Update display names in bosses
    const fullServerName = `${newName} ${newTag}`;
    setBosses((prev) =>
      prev.map((b) =>
        b.serverId === key
          ? { ...b, serverName: fullServerName, serverTag: newTag }
          : b
      )
    );
  };

  // Edit Boss details
  const handleSaveBossDetails = async (updated: BossRecord) => {
    await saveBossRecord(updated);
  };

  // Delete Boss
  const handleDeleteBoss = async (bossId: string) => {
    setBosses((prev) => prev.filter((b) => b.id !== bossId));
    try {
      await deleteDoc(doc(db, 'bosses', bossId));
    } catch (e) {
      console.warn('Delete boss warning:', e);
    }
  };

  // Filtering & Sorting
  const filteredAndSortedBosses = useMemo(() => {
    let list = bosses;

    // Filter by server
    if (serverFilter !== 'all') {
      list = list.filter((b) => b.serverId === serverFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.nameTh.toLowerCase().includes(q) ||
          (b.nameEn && b.nameEn.toLowerCase().includes(q)) ||
          (b.location && b.location.toLowerCase().includes(q))
      );
    }

    // Filter by status
    const nowMs = currentTime.getTime();
    if (statusFilter !== 'all') {
      list = list.filter((b) => {
        if (statusFilter === 'favorite') return b.isFavorite;
        if (!b.nextSpawnAt) return statusFilter === 'unknown';
        const spawnMs = new Date(b.nextSpawnAt).getTime();
        const diffMs = spawnMs - nowMs;

        if (statusFilter === 'spawned') return diffMs <= 0;
        if (statusFilter === 'soon') return diffMs > 0 && diffMs <= 15 * 60 * 1000;
        if (statusFilter === 'cooldown') return diffMs > 15 * 60 * 1000;
        return true;
      });
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortOption === 'number') {
        return (a.bossNumber || 999) - (b.bossNumber || 999);
      }
      if (sortOption === 'name') {
        return a.nameTh.localeCompare(b.nameTh, 'th');
      }
      if (sortOption === 'cooldown') {
        return a.cooldownHours - b.cooldownHours;
      }

      // Default: 'soonest'
      const aTime = a.nextSpawnAt ? new Date(a.nextSpawnAt).getTime() : null;
      const bTime = b.nextSpawnAt ? new Date(b.nextSpawnAt).getTime() : null;

      if (aTime === null && bTime === null) {
        return (a.bossNumber || 999) - (b.bossNumber || 999);
      }
      if (aTime === null) return 1;
      if (bTime === null) return -1;

      const aDiff = aTime - nowMs;
      const bDiff = bTime - nowMs;

      if (aDiff <= 0 && bDiff <= 0) return bDiff - aDiff;
      if (aDiff <= 0) return -1;
      if (bDiff <= 0) return 1;

      return aTime - bTime;
    });
  }, [bosses, serverFilter, statusFilter, sortOption, searchQuery, currentTime]);

  // Server Counts
  const serverCounts = useMemo(() => {
    const s1 = bosses.filter((b) => b.serverId === 'server_1').length;
    const s2 = bosses.filter((b) => b.serverId === 'server_2').length;
    return {
      server1Count: s1,
      server2Count: s2,
      totalCount: bosses.length,
    };
  }, [bosses]);

  // Handle Copy All for Google Sheets from Top Navbar (Copy ONLY Main Server with Colors)
  const mainServerBosses = useMemo(() => {
    return bosses.filter((b) => b.serverId === 'server_1');
  }, [bosses]);

  const handleCopyAllForSheets = async () => {
    if (mainServerBosses.length === 0) return;
    const success = await copyColoredBossesToClipboard(mainServerBosses);
    if (success) {
      setIsCopiedAll(true);
      setTimeout(() => setIsCopiedAll(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navbar with Quick Copy & Paste for Sheets */}
      <Navbar
        onOpenAddBoss={() => setIsAddBossOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        soundEnabled={settings.ttsEnabled || settings.soundChimeEnabled}
        toggleSound={() =>
          handleSaveSettings({
            ...settings,
            ttsEnabled: !settings.ttsEnabled,
            soundChimeEnabled: !settings.soundChimeEnabled,
          })
        }
        user={user}
        onGoogleSignIn={handleGoogleSignIn}
        onCopyAllForSheets={handleCopyAllForSheets}
        isCopiedAll={isCopiedAll}
        copyCount={mainServerBosses.length}
        onOpenPasteSheet={() => setIsPasteSheetOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5">
        {/* 1. Top Metrics Cards (Matching reference screenshot exactly) */}
        <MetricsHeader bosses={bosses} currentTime={currentTime} />

        {/* 2. Server Switcher & Controls Bar (Matching reference screenshot) */}
        <BossControlBar
          serverFilter={serverFilter}
          setServerFilter={setServerFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortOption={sortOption}
          setSortOption={setSortOption}
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenReboot={() => setIsRebootOpen(true)}
          onSendTop30ToDiscord={() => setIsSendTop30Open(true)}
          server1Name={settings.server1Name}
          server1Tag={settings.server1Tag}
          server2Name={settings.server2Name}
          server2Tag={settings.server2Tag}
          onEditServer1={() => setEditingServer('server_1')}
          onEditServer2={() => setEditingServer('server_2')}
          counts={serverCounts}
        />

        {/* 3. Boss Content Area: Table View (default) or Grid View */}
        {viewMode === 'table' ? (
          <BossTable
            bosses={filteredAndSortedBosses}
            currentTime={currentTime}
            onQuickKill={handleQuickKill}
            onCustomTime={(b) => setCustomTimeBoss(b)}
            onResetTime={handleResetTime}
            onResetAllTimes={handleResetAllTimes}
            onToggleFavorite={handleToggleFavorite}
            onTestVoice={handleTestVoice}
            onEditBoss={(b) => setEditingBoss(b)}
            onUpdateSpawnTime={handleUpdateSpawnTime}
            onReloadDefaults={() => {
              const defaults = generateInitialBossList(
                settings.server1Name,
                settings.server1Tag,
                settings.server2Name,
                settings.server2Tag
              );
              setBosses(defaults);
              try {
                localStorage.setItem(STORAGE_KEY_LOCAL_BOSSES, JSON.stringify(defaults));
              } catch (e) {
                // ignore
              }
              defaults.forEach(async (item) => {
                try {
                  await setDoc(doc(db, 'bosses', item.id), item);
                } catch (err) {
                  // ignore
                }
              });
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAndSortedBosses.map((boss) => (
              <BossCard
                key={boss.id}
                boss={boss}
                currentTime={currentTime}
                onQuickKill={handleQuickKill}
                onCustomTime={(b) => setCustomTimeBoss(b)}
                onResetTime={handleResetTime}
                onToggleFavorite={handleToggleFavorite}
                onTestVoice={handleTestVoice}
                onEditBoss={(b) => setEditingBoss(b)}
                onUpdateSpawnTime={handleUpdateSpawnTime}
                showServerBadge={serverFilter === 'all'}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <RebootModal
        isOpen={isRebootOpen}
        onClose={() => setIsRebootOpen(false)}
        onConfirmReboot={handleConfirmReboot}
        currentFilter={serverFilter}
      />

      <CustomTimeModal
        boss={customTimeBoss}
        isOpen={!!customTimeBoss}
        onClose={() => setCustomTimeBoss(null)}
        onConfirm={handleCustomTimeKill}
      />

      <AddBossModal
        isOpen={isAddBossOpen}
        onClose={() => setIsAddBossOpen(false)}
        onAddBoss={handleAddBoss}
        defaultServer={serverFilter}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        user={user}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
      />

      <EditServerModal
        isOpen={!!editingServer}
        onClose={() => setEditingServer(null)}
        serverKey={editingServer || 'server_1'}
        currentName={editingServer === 'server_1' ? settings.server1Name : settings.server2Name}
        currentTag={editingServer === 'server_1' ? settings.server1Tag : settings.server2Tag}
        onSave={(newName, newTag) => {
          if (editingServer) handleSaveServerInfo(editingServer, newName, newTag);
        }}
      />

      <EditBossModal
        boss={editingBoss}
        isOpen={!!editingBoss}
        onClose={() => setEditingBoss(null)}
        onSave={handleSaveBossDetails}
        onDelete={handleDeleteBoss}
      />

      <SendTop30Modal
        isOpen={isSendTop30Open}
        onClose={() => setIsSendTop30Open(false)}
        bosses={bosses}
        currentTime={currentTime}
        settings={settings}
        currentFilter={serverFilter}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <PasteSheetModal
        isOpen={isPasteSheetOpen}
        onClose={() => setIsPasteSheetOpen(false)}
        bosses={bosses}
        currentServerFilter={serverFilter}
        server1Name={settings.server1Name}
        server1Tag={settings.server1Tag}
        server2Name={settings.server2Name}
        server2Tag={settings.server2Tag}
        onApplyImport={handleApplySheetImport}
      />
    </div>
  );
}
