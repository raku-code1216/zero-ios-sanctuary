export type AudioTrackId = 'harbour' | 'rain' | 'tram' | 'bowl';

export interface AudioTrackMeta {
  id: AudioTrackId;
  label: string;
  subtitle: string;
  icon: string;
}

export const AUDIO_TRACKS: AudioTrackMeta[] = [
  { id: 'harbour', label: '維港海浪', subtitle: '緩慢潮汐白噪音', icon: '🌊' },
  { id: 'rain', label: '深夜細雨', subtitle: '柔和窗邊雨聲', icon: '🌧️' },
  { id: 'tram', label: '叮叮／船艙', subtitle: '低頻微震環境音', icon: '🚋' },
  { id: 'bowl', label: '432Hz 頌缽', subtitle: '靜心泛音共鳴', icon: '🔔' },
];

export type AudioMixState = Record<AudioTrackId, number>;

export type SceneId = 'ferry' | 'tram' | 'lantau' | 'chaachaan';

export interface SanctuaryScene {
  id: SceneId;
  title: string;
  subtitle: string;
  location: string;
  quote: string;
  isPro: boolean;
  gradient: [string, string, string];
  accentColor: string;
  particleType: 'ripple' | 'rain' | 'mist' | 'bokeh';
  defaultMix: AudioMixState;
}

export const SANCTUARY_SCENES: SanctuaryScene[] = [
  {
    id: 'ferry',
    title: '深夜渡海小輪',
    subtitle: '維港微風 · 海浪拍打 · 船艙低鳴',
    location: '尖沙咀 → 中環',
    quote: '聽日嘅事聽日先算，呢幾分鐘淨係屬於你。',
    isPro: false,
    gradient: ['#040914', '#0A192F', '#050505'],
    accentColor: '#DEFF9A',
    particleType: 'ripple',
    defaultMix: { harbour: 0.72, rain: 0.15, tram: 0.35, bowl: 0.1 },
  },
  {
    id: 'tram',
    title: '雨夜港島叮叮車',
    subtitle: '車窗雨滴 · 軌道輕響 · 慢速穿城',
    location: '銅鑼灣 → 堅尼地城',
    quote: '外面幾急都好，架車會慢慢載你返歸。',
    isPro: false,
    gradient: ['#070A10', '#121E26', '#050505'],
    accentColor: '#9AE6FF',
    particleType: 'rain',
    defaultMix: { harbour: 0.0, rain: 0.75, tram: 0.55, bowl: 0.12 },
  },
  {
    id: 'lantau',
    title: '大嶼山清晨海霧',
    subtitle: '山海薄霧 · 靜心頌缽 · 遠離繁囂',
    location: '大嶼山南岸',
    quote: '呼一口氣，將成個星期嘅緊繃放返落海。',
    isPro: true,
    gradient: ['#060E0D', '#102624', '#050505'],
    accentColor: '#A7F3D0',
    particleType: 'mist',
    defaultMix: { harbour: 0.45, rain: 0.1, tram: 0.0, bowl: 0.65 },
  },
  {
    id: 'chaachaan',
    title: '凌晨兩點冰室角落',
    subtitle: '暖黃微光 · 窗外細雨 · 深夜喘息',
    location: '旺角街角',
    quote: '辛苦晒，坐低抖抖，唔使急住覆任何人。',
    isPro: true,
    gradient: ['#120B06', '#24150B', '#050505'],
    accentColor: '#FFB347',
    particleType: 'bokeh',
    defaultMix: { harbour: 0.0, rain: 0.62, tram: 0.25, bowl: 0.25 },
  },
];

export interface MoodChip {
  id: string;
  label: string;
  reply: string;
}

export const HK_MOOD_CHIPS: MoodChip[] = [
  { id: 'ot', label: 'OT 到頂唔順', reply: '今日已經做得夠好喇，先暫停世界 5 分鐘。' },
  { id: 'mtr', label: '迫地鐵好攰', reply: '戴起耳機閉上眼，當自己坐緊深夜渡海小輪。' },
  { id: 'overwhelmed', label: '個腦好亂', reply: '唔使即刻諗掂所有事，跟住手機震動慢慢呼吸。' },
  { id: 'silent', label: '唔想覆訊息', reply: '呢度無人催你覆 WhatsApp，安心消失一陣。' },
  { id: 'calm', label: '純粹想靜下', reply: '歡迎返到你嘅香港避風港。' },
];

export const HK_SUPPORT_HOTLINES = [
  {
    name: '「情緒通」精神健康支援專線',
    phone: '18111',
    hours: '24 小時（香港政府醫務衞生局）',
  },
  {
    name: '香港撒瑪利亞防止自殺會',
    phone: '23892222',
    displayPhone: '2389 2222',
    hours: '24 小時免費支援',
  },
  {
    name: '生命熱線',
    phone: '23820000',
    displayPhone: '2382 0000',
    hours: '24 小時情緒支援',
  },
];
