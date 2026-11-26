export interface MapDot {
  id: string;
  authorId: string;
  lat: number;
  lng: number;
  city: string;
  isSos: boolean;
  isHk: boolean;
}

export interface ResonanceToast {
  id: string;
  authorId: string;
  icon: string;
  title: string;
  text: string;
  translation?: string;
  variant: 'lime' | 'sos' | 'system';
  canModerate: boolean;
}

// Original 4 Hong Kong anchors from legacy-prototype/index.html
export const HK_ANCHORS: { lat: number; lng: number; name: string }[] = [
  { lat: 22.335, lng: 114.176, name: '九龍塘' },
  { lat: 22.378, lng: 114.185, name: '沙田' },
  { lat: 22.443, lng: 114.028, name: '元朗' },
  { lat: 22.282, lng: 114.150, name: '中環' },
];

// Original 30 global cities from legacy-prototype/index.html
export const GLOBAL_CITIES: { lat: number; lng: number; name: string }[] = [
  { lat: 35.68, lng: 139.73, name: '東京' },
  { lat: 37.56, lng: 126.98, name: '首爾' },
  { lat: 39.91, lng: 116.40, name: '北京' },
  { lat: 31.23, lng: 121.47, name: '上海' },
  { lat: 25.03, lng: 121.56, name: '台北' },
  { lat: 13.75, lng: 100.50, name: '曼谷' },
  { lat: 1.35, lng: 103.82, name: '新加坡' },
  { lat: 25.10, lng: 55.26, name: '杜拜' },
  { lat: 51.51, lng: -0.12, name: '倫敦' },
  { lat: 48.86, lng: 2.34, name: '巴黎' },
  { lat: 52.52, lng: 13.40, name: '柏林' },
  { lat: 41.90, lng: 12.49, name: '羅馬' },
  { lat: 40.75, lng: -73.98, name: '紐約' },
  { lat: 34.05, lng: -118.24, name: '洛杉磯' },
  { lat: 41.88, lng: -87.63, name: '芝加哥' },
  { lat: 37.77, lng: -122.42, name: '三藩市' },
  { lat: 43.65, lng: -79.38, name: '多倫多' },
  { lat: -23.55, lng: -46.63, name: '聖保羅' },
  { lat: -33.87, lng: 151.20, name: '雪梨' },
  { lat: -37.81, lng: 144.96, name: '墨爾本' },
  { lat: 25.20, lng: 55.27, name: '阿布扎比' },
  { lat: 39.90, lng: 32.85, name: '安卡拉' },
  { lat: 19.43, lng: -99.13, name: '墨西哥城' },
  { lat: -34.60, lng: -58.38, name: '布宜諾斯艾利斯' },
  { lat: 55.75, lng: 37.61, name: '莫斯科' },
  { lat: 30.04, lng: 31.23, name: '開羅' },
  { lat: -1.29, lng: 36.82, name: '奈洛比' },
  { lat: 28.61, lng: 77.20, name: '新德里' },
  { lat: -22.90, lng: -43.20, name: '里約熱內盧' },
  { lat: 45.42, lng: -75.69, name: '渥太華' },
];

export const DEFAULT_PHRASES = [
  '辛苦晒，聽日嘅事聽日先算。',
  '深呼吸，你唔係一個人。',
  '一切都會慢慢變好嘅。',
];

export const GLOBAL_COMPANION_MESSAGES = [
  { text: '辛苦晒，收工記得食飯抖下。', trans: '', loc: '香港 · 中環', authorId: 'anon-hk-101' },
  { text: '今日もお疲れ様。ここで一緒に休もう。', trans: '今天也辛苦了。在這裡一起休息吧。', loc: '東京', authorId: 'anon-jp-204' },
  { text: 'You are not alone in this silence.', trans: '在這片寧靜中，你並不孤單。', loc: '倫敦', authorId: 'anon-uk-309' },
  { text: '잠시 내려놓아도 괜찮아요.', trans: '暫時放下也沒關係。', loc: '首爾', authorId: 'anon-kr-412' },
  { text: '慢慢嚟，呢個城市行太快，你可以行慢啲。', trans: '', loc: '香港 · 尖沙咀', authorId: 'anon-hk-518' },
  { text: 'Take your time. The world can wait.', trans: '慢慢來。世界可以等等。', loc: '紐約', authorId: 'anon-us-622' },
  { text: 'Respire. Tout ira bien.', trans: '深呼吸。一切都會好起來的。', loc: '巴黎', authorId: 'anon-fr-731' },
  { text: '慢慢來，沒關係的。', trans: '', loc: '台北', authorId: 'anon-tw-845' },
  { text: 'It is okay to pause.', trans: '按下暫停鍵也沒關係。', loc: '雪梨', authorId: 'anon-au-951' },
];

const BANNED_WORDS = [
  'fuck', 'bitch', 'shit', '垃圾', '廢物', '去死', '笨蛋',
  '屌', '𨳒', '𨳊', '撚', '𨶙', '𨳍', '閪', '仆街', '冚家', '老母', 'dllm',
  '媽的', '傻逼', '智障', '賤人', '婊子', '含撚', '白痴', '去死吧',
];

const CRISIS_WORDS = ['自殺', '輕生', '想死', '唔想活', '跳樓', '割脈', 'kill myself', 'suicide'];

const CONTACT_PATTERN = /(\b\d{8,}\b|@\w{3,}|whatsapp|telegram|tg:|ig:|wechat|line\s*id|https?:\/\/)/i;

const GENTLE_WARNINGS = [
  '大佬，我哋喺度做緊心靈 SPA，唔係 Rap Battle。溫柔啲啦好無？ 🕊️',
  '避難所感應到高強度火氣！呢度只接受溫柔嘅波紋，換個優雅啲嘅字眼啦～ 🍵',
  '為保護大家私隱同合規安全，請勿輸入粗口或個人聯絡方式（電話／IG／TG）。🌿',
];

export function checkMessageSafety(text: string): {
  ok: boolean;
  isCrisis: boolean;
  warning?: string;
} {
  const cleaned = text.trim();
  if (!cleaned) return { ok: false, isCrisis: false, warning: '請輸入一句溫柔的共鳴短語。' };

  const lower = cleaned.toLowerCase();
  if (CRISIS_WORDS.some((w) => lower.includes(w))) {
    return {
      ok: false,
      isCrisis: true,
      warning: '我們感覺到你此刻非常難受。請立刻點擊下方香港 24 小時免費熱線，讓專業輔導員陪你渡過。',
    };
  }
  if (BANNED_WORDS.some((w) => lower.includes(w))) {
    return {
      ok: false,
      isCrisis: false,
      warning: GENTLE_WARNINGS[Math.floor(Math.random() * 2)],
    };
  }
  if (CONTACT_PATTERN.test(cleaned)) {
    return {
      ok: false,
      isCrisis: false,
      warning: GENTLE_WARNINGS[2],
    };
  }
  return { ok: true, isCrisis: false };
}

export function generateCompanionDots(): MapDot[] {
  const dots: MapDot[] = [];
  // 28 dedicated Hong Kong companions spread around the 4 HK anchors so HK view feels alive
  for (let i = 0; i < 28; i++) {
    const anchor = HK_ANCHORS[i % HK_ANCHORS.length];
    const latOffset = (((i * 37) % 100) / 100 - 0.5) * 0.095;
    const lngOffset = (((i * 53) % 100) / 100 - 0.5) * 0.125;
    dots.push({
      id: `hk-${i}`,
      authorId: `anon-hk-${1000 + i}`,
      lat: anchor.lat + latOffset,
      lng: anchor.lng + lngOffset,
      city: `香港 · ${anchor.name}`,
      isSos: i % 13 === 0,
      isHk: true,
    });
  }
  // 96 global companions spread across the 30 global cities
  for (let i = 0; i < 96; i++) {
    const city = GLOBAL_CITIES[i % GLOBAL_CITIES.length];
    const latOffset = (((i * 41) % 100) / 100 - 0.5) * 3.2;
    const lngOffset = (((i * 67) % 100) / 100 - 0.5) * 4.4;
    dots.push({
      id: `gl-${i}`,
      authorId: `anon-gl-${2000 + i}`,
      lat: city.lat + latOffset,
      lng: city.lng + lngOffset,
      city: city.name,
      isSos: i % 19 === 0,
      isHk: false,
    });
  }
  return dots;
}
