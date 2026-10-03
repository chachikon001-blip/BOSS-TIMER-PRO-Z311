import { BossDefinition } from '../types';

export const DEFAULT_BOSSES: BossDefinition[] = [
  // 1. เฟลิส (Yellow 50%)
  { bossNumber: 1, bossKey: 'felis', nameTh: 'เฟลิส', nameEn: 'Felis', cooldownHours: 2, rebootHours: null, spawnChance: '50%', location: 'ตามแมพ / พื้นที่ล่า' },
  // 2. ทิมิทริส (Green 100%)
  { bossNumber: 2, bossKey: 'timitris', nameTh: 'ทิมิทริส', nameEn: 'Timitris', cooldownHours: 5, rebootHours: null, spawnChance: '100%', location: 'ตามแมพ / พื้นที่ล่า' },
  // 3. คอร์ซัสเซปเตอร์ (Red 33%)
  { bossNumber: 3, bossKey: 'core', nameTh: 'คอร์ซัสเซปเตอร์', nameEn: 'Core', cooldownHours: 12, rebootHours: 8, spawnChance: '33%', location: 'หอคอยครูม่า ชั้น 7' },
  // 4. สตัน (Green 100%)
  { bossNumber: 4, bossKey: 'stan', nameTh: 'สตัน', nameEn: 'Stan', cooldownHours: 4, rebootHours: null, spawnChance: '100%', location: 'ตามแมพ / พื้นที่ล่า' },
  // 5. ซาบัน (Green 100%)
  { bossNumber: 5, bossKey: 'savan', nameTh: 'ซาบัน', nameEn: 'Savan', cooldownHours: 12, rebootHours: 6, spawnChance: '100%', location: 'เกาะมด' },
  // 6. แกเร็ธ (Yellow 50%)
  { bossNumber: 6, bossKey: 'gahareth', nameTh: 'แกเร็ธ', nameEn: 'Gahareth', cooldownHours: 6, rebootHours: 6, spawnChance: '50%', location: 'ที่ราบซีเลนเชียม' },
  // 7. ครูม่าหนองน้ำ (Green 100%)
  { bossNumber: 7, bossKey: 'mutated_cruma', nameTh: 'ครูม่าหนองน้ำ', nameEn: 'Mutated Cruma', cooldownHours: 8, rebootHours: 6, spawnChance: '100%', location: 'หนองน้ำครูม่า' },
  // 8. เบฮีมอธ (Green 100%)
  { bossNumber: 8, bossKey: 'behemoth', nameTh: 'เบฮีมอธ', nameEn: 'Behemoth', cooldownHours: 6, rebootHours: 6, spawnChance: '100%', location: 'หุบเขามังกร' },
  // 9. คาทาน (Green 100%)
  { bossNumber: 9, bossKey: 'katan', nameTh: 'คาทาน', nameEn: 'Katan', cooldownHours: 8, rebootHours: 6, spawnChance: '100%', location: 'วิหารคนนอกรีต' },
  // 10. ลิลลี่ (Green 100%)
  { bossNumber: 10, bossKey: 'lily', nameTh: 'ลิลลี่', nameEn: 'Lily', cooldownHours: 12, rebootHours: 10, spawnChance: '100%', location: 'สุสานกษัตริย์' },
  // 11. มด 3 (Red 33%)
  { bossNumber: 11, bossKey: 'ant3', nameTh: 'มด 3', nameEn: 'Ant3', cooldownHours: 6, rebootHours: 14, spawnChance: '33%', location: 'รังมด ชั้น 3' },
  // 12. พัน ดรายด์ (Green 100%)
  { bossNumber: 12, bossKey: 'pandraeed', nameTh: 'พัน ดรายด์', nameEn: "Pan'Dra'eed", cooldownHours: 8, rebootHours: null, spawnChance: '100%', location: 'ตามแมพ / พื้นที่ล่า' },
  // 13. ทาลาคิน (Green 100%)
  { bossNumber: 13, bossKey: 'talakin', nameTh: 'ทาลาคิน', nameEn: 'Talakin', cooldownHours: 7, rebootHours: null, spawnChance: '100%', location: 'ตามแมพ / พื้นที่ล่า' },
  // 14. ซาร์ก้า (Green 100%)
  { bossNumber: 14, bossKey: 'sarka', nameTh: 'ซาร์ก้า', nameEn: 'Sarka', cooldownHours: 7, rebootHours: null, spawnChance: '100%', location: 'ตามแมพ / พื้นที่ล่า' },
  // 15. ครูม่าปนเปื้อน (Green 100%)
  { bossNumber: 15, bossKey: 'cruma4', nameTh: 'ครูม่าปนเปื้อน', nameEn: 'Cruma4', cooldownHours: 8, rebootHours: 6, spawnChance: '100%', location: 'หอคอยครูม่า ชั้น 4' },
  // 16. มาทูรา (Yellow 50%)
  { bossNumber: 16, bossKey: 'matura', nameTh: 'มาทูรา', nameEn: 'Matura', cooldownHours: 4, rebootHours: null, spawnChance: '50%', location: 'ตามแมพ / พื้นที่ล่า' },
  // 17. เบรก้า (Yellow 50%)
  { bossNumber: 17, bossKey: 'breka', nameTh: 'เบรก้า', nameEn: 'Breka', cooldownHours: 4, rebootHours: null, spawnChance: '50%', location: 'ป้อมเบรก้า' },
  // 18. ทรอมบา (Yellow 50%)
  { bossNumber: 18, bossKey: 'tromba', nameTh: 'ทรอมบา', nameEn: 'Tromba', cooldownHours: 4.5, rebootHours: null, spawnChance: '50%', location: 'ตามแมพ / พื้นที่ล่า' },
  // 19. เอนคูรา (Yellow 50%)
  { bossNumber: 19, bossKey: 'enkura', nameTh: 'เอนคูรา', nameEn: 'Enkura', cooldownHours: 3.5, rebootHours: null, spawnChance: '50%', location: 'ตามแมพ / พื้นที่ล่า' },
  // 20. เคลซอส (Yellow 50%)
  { bossNumber: 20, bossKey: 'kelsus', nameTh: 'เคลซอส', nameEn: 'Kelsus', cooldownHours: 6, rebootHours: 6, spawnChance: '50%', location: 'หอคอยทรมาน' },
  // 21. เมดูซ่า (Green 100%)
  { bossNumber: 21, bossKey: 'medusa', nameTh: 'เมดูซ่า', nameEn: 'Medusa', cooldownHours: 7, rebootHours: null, spawnChance: '100%', location: 'ตามแมพ / พื้นที่ล่า' },
  // 22. บาซิลา (Yellow 50%)
  { bossNumber: 22, bossKey: 'basila', nameTh: 'บาซิลา', nameEn: 'Basila', cooldownHours: 2.5, rebootHours: null, spawnChance: '50%', location: 'ตามแมพ / พื้นที่ล่า' },
  // 23. พันนาโรด (Yellow 50%)
  { bossNumber: 23, bossKey: 'pannarod', nameTh: 'พันนาโรด', nameEn: 'Pannarod', cooldownHours: 3, rebootHours: null, spawnChance: '50%', location: 'ตามแมพ / พื้นที่ล่า' },
  // 24. เชอร์ทูบา (Yellow 50%)
  { bossNumber: 24, bossKey: 'chertuba', nameTh: 'เชอร์ทูบา', nameEn: 'Chertuba', cooldownHours: 3, rebootHours: null, spawnChance: '50%', location: 'ซากปรักหักพังเดสเปีย' },
  // 25. เทมเพสต์ (Yellow 50%)
  { bossNumber: 25, bossKey: 'valefar', nameTh: 'เทมเพสต์', nameEn: 'Valefar', cooldownHours: 3.5, rebootHours: null, spawnChance: '50%', location: 'ตามแมพ / พื้นที่ล่า' },
  // 26. ดราก้อนบีสต์ (Red 33%)
  { bossNumber: 26, bossKey: 'db', nameTh: 'ดราก้อนบีสต์', nameEn: 'DB', cooldownHours: 12, rebootHours: 14, spawnChance: '33%', location: 'หุบเขามังกร' },
  // 27. ทัลคิน (Yellow 50%)
  { bossNumber: 27, bossKey: 'talkin', nameTh: 'ทัลคิน', nameEn: 'Talkin', cooldownHours: 5, rebootHours: null, spawnChance: '50%', location: 'ตามแมพ / พื้นที่ล่า' },
  // 28. เซลลู (Yellow 50%)
  { bossNumber: 28, bossKey: 'selu', nameTh: 'เซลลู', nameEn: 'Selu', cooldownHours: 7.5, rebootHours: null, spawnChance: '50%', location: 'ตามแมพ / พื้นที่ล่า' },
  // 29. บัลโบ (Yellow 50%)
  { bossNumber: 29, bossKey: 'balbo', nameTh: 'บัลโบ', nameEn: 'BalBo', cooldownHours: 8, rebootHours: 6, spawnChance: '50%', location: 'หุบเขากลอรี' },
  // 30. ทิมิเนล (Green 100%)
  { bossNumber: 30, bossKey: 'timiniel', nameTh: 'ทิมิเนล', nameEn: 'Timiniel', cooldownHours: 8, rebootHours: 6, spawnChance: '100%', location: 'ป่าเอลฟ์' },
  // 31. ออร์เฟน (Red 33%)
  { bossNumber: 31, bossKey: 'orfen', nameTh: 'ออร์เฟน', nameEn: 'Orfen', cooldownHours: 24, rebootHours: 14, spawnChance: '33%', location: 'ทะเลสปอร์' },
  // 32. เรปิโร (Yellow 50%)
  { bossNumber: 32, bossKey: 'repiro', nameTh: 'เรปิโร', nameEn: 'Repiro', cooldownHours: 5, rebootHours: null, spawnChance: '50%', location: 'ตามแมพ / พื้นที่ล่า' },
  // 33. โครูน (Green 100%)
  { bossNumber: 33, bossKey: 'coroon', nameTh: 'โครูน', nameEn: 'Coroon', cooldownHours: 10, rebootHours: 6, spawnChance: '100%', location: 'ที่ราบสูงงาช้าง' },
  // 34. ฮิซิโลเม (Yellow 50%)
  { bossNumber: 34, bossKey: 'hisilrome', nameTh: 'ฮิซิโลเม', nameEn: 'Hisilrome', cooldownHours: 6, rebootHours: 6, spawnChance: '50%', location: 'หอคอยครูม่า ชั้น 6' },
  // 35. กระจก (Green 100%)
  { bossNumber: 35, bossKey: 'mirror', nameTh: 'กระจก', nameEn: 'Mirror', cooldownHours: 12, rebootHours: 10, spawnChance: '100%', location: 'ป่ากระจกเงา' },
  // 36. แลนเดอร์ (Green 100%)
  { bossNumber: 36, bossKey: 'landor', nameTh: 'แลนเดอร์', nameEn: 'Landor', cooldownHours: 8, rebootHours: 10, spawnChance: '100%', location: 'ที่ราบสูงมังกร' },
  // 37. กลากิ (Green 100%)
  { bossNumber: 37, bossKey: 'glaki', nameTh: 'กลากิ', nameEn: 'Glaki', cooldownHours: 8, rebootHours: 14, spawnChance: '100%', location: 'แม่น้ำวาฟูล' },
  // 38. ซามูเอล (Green 100%)
  { bossNumber: 38, bossKey: 'samuel', nameTh: 'ซามูเอล', nameEn: 'Samuel', cooldownHours: 12, rebootHours: 10, spawnChance: '100%', location: 'สวนกษัตริย์' },
  // 39. คาบริโอ (Yellow 50%)
  { bossNumber: 39, bossKey: 'cabrio', nameTh: 'คาบริโอ', nameEn: 'Cabrio', cooldownHours: 12, rebootHours: 10, spawnChance: '50%', location: 'สุสานชั่วนิรันดร์' },
  // 40. ฟลินท์ (Yellow 50%)
  { bossNumber: 40, bossKey: 'flynt', nameTh: 'ฟลินท์', nameEn: 'Flynt', cooldownHours: 8, rebootHours: 10, spawnChance: '50%', location: 'รังโจร' },
  // 41. ฮาร์ป (Yellow 50%)
  { bossNumber: 41, bossKey: 'haff', nameTh: 'ฮาร์ป', nameEn: 'Haff', cooldownHours: 24, rebootHours: 10, spawnChance: '50%', location: 'หน้าผาแห่งลม' },
  // 42. แอนดราส (Yellow 50%)
  { bossNumber: 42, bossKey: 'andras', nameTh: 'แอนดราส', nameEn: 'Andras', cooldownHours: 12, rebootHours: 10, spawnChance: '50%', location: 'หุบเหวแห่งความตาย' },
  // 43. โอล์คุส (Red 33%)
  { bossNumber: 43, bossKey: 'olkuth', nameTh: 'โอล์คุส', nameEn: 'Olkuth', cooldownHours: 24, rebootHours: 14, spawnChance: '33%', location: 'วิหารเงียบสงบ' },
  // 44. ทานาทอส (Yellow 50%)
  { bossNumber: 44, bossKey: 'tanatos', nameTh: 'ทานาทอส', nameEn: 'Tanatos', cooldownHours: 24, rebootHours: 14, spawnChance: '50%', location: 'วิหารคนนอกรีต' },
  // 45. ลาฮา (Red 33%)
  { bossNumber: 45, bossKey: 'rahha', nameTh: 'ลาฮา', nameEn: 'Rahha', cooldownHours: 33, rebootHours: 14, spawnChance: '33%', location: 'วิหารโบราณ' },
];
