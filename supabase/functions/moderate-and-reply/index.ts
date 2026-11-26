// Supabase Edge Function 骨架（Top 3 實作）
// 部署前請透過 CLI 設定伺服器端密鑰：
//   supabase secrets set GEMINI_API_KEY="your-gemini-key"
//
// 功能職責：
// 1. 事前內容過濾（Pre-moderation）：攔截粗口、騷擾、交換外部聯絡方式（電話/IG/TG/WhatsApp）
// 2. 心理危機偵測：若偵測到自殘／自殺風險，立即回傳 crisis=true，由前端彈出香港 24 小時求助熱線
// 3. AI 守夜人暖心回信：10 分鐘無真人回應時，以港式溫柔語氣生成專屬鼓勵卡回信

export interface ModerationRequest {
  content: string;
  moodTag?: string;
}

export interface ModerationResponse {
  approved: boolean;
  crisisDetected: boolean;
  reason?: string;
  aiFallbackReply?: string;
}

// 此檔案為 Deno / Supabase Edge Function 結構佔位，待 Top 3 綁定 Supabase 專案後啟用
export const EDGE_FUNCTION_SPEC = {
  endpoint: 'moderate-and-reply',
  requiredSecrets: ['GEMINI_API_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
  hkHotlines: {
    shallWeTalk: '18111',
    samaritans: '23892222',
    suicidePrevention: '23820000',
  },
} as const;
