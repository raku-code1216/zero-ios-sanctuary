import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../constants/theme';

export const SettingsScreen: React.FC = () => {
  const handleDeleteAccountPreview = () => {
    Alert.alert(
      '刪除帳號與所有資料（Guideline 5.1.1(v)）',
      'Top 4 串接 Sign in with Apple 與 Supabase 後，點此將徹底刪除帳號、鼓勵卡紀錄、封鎖名單並撤銷 Apple Token。',
      [{ text: '明白' }]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>設定與會員方案</Text>

      {/* Freemium Pricing Preview */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Zero Sanctuary PRO</Text>
          <Text style={styles.badge}>Top 5 串接 StoreKit 2</Text>
        </View>
        <Text style={styles.cardDesc}>
          免費版已永久取消 2 小時冷卻鎖，並提供無限次基礎避風港體驗。升級 PRO 將解鎖完整香港及世界療癒場景、個人白噪音配方、無限鼓勵卡與心靈收藏冊：
        </Text>
        <View style={styles.priceGrid}>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>月費方案</Text>
            <Text style={styles.priceValue}>HK$28</Text>
            <Text style={styles.priceSub}>每月自動續訂</Text>
          </View>
          <View style={[styles.priceBox, styles.priceBoxFeatured]}>
            <Text style={[styles.priceLabel, { color: COLORS.lime }]}>年費主推</Text>
            <Text style={[styles.priceValue, { color: COLORS.lime }]}>HK$168</Text>
            <Text style={styles.priceSub}>約 HK$14 / 月</Text>
          </View>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>永久買斷</Text>
            <Text style={styles.priceValue}>HK$298</Text>
            <Text style={styles.priceSub}>早鳥一次性</Text>
          </View>
        </View>
      </View>

      {/* Compliance & Account */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>帳號、隱私與合規狀態</Text>
        <Text style={styles.itemText}>• 目前狀態：匿名訪客模式（無須登入即可免費體驗）</Text>
        <Text style={styles.itemText}>• 音訊引擎：Expo SDK 58 + expo-audio（支援背景播放）</Text>
        <Text style={styles.itemText}>• AI 安全：Gemini API 僅於 Supabase Edge Functions 呼叫</Text>
        <Pressable onPress={handleDeleteAccountPreview} style={styles.dangerBtn}>
          <Text style={styles.dangerBtnText}>刪除帳號與清除所有資料</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  badge: {
    fontSize: 10,
    color: COLORS.lime,
    backgroundColor: COLORS.limeSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  priceGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  priceBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    gap: 3,
  },
  priceBoxFeatured: {
    borderColor: COLORS.limeBorder,
    backgroundColor: COLORS.limeSoft,
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  priceSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  itemText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  dangerBtn: {
    marginTop: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.45)',
    backgroundColor: 'rgba(255,107,107,0.10)',
    alignItems: 'center',
  },
  dangerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
});
