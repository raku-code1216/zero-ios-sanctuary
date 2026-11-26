import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { HK_SUPPORT_HOTLINES } from '../constants/scenes';
import { COLORS } from '../constants/theme';

interface SampleCard {
  id: string;
  authorId: string;
  authorLabel: string;
  isAi: boolean;
  message: string;
  timeAgo: string;
}

const INITIAL_SAMPLE_CARDS: SampleCard[] = [
  {
    id: 'card-1',
    authorId: 'anon-hk-8291',
    authorLabel: '來自中環的匿名同行者',
    isAi: false,
    message: '啱啱 OT 完坐緊尾班車，如果你今日都好攰，記住你已經做得好叻，聽日嘅事聽日先算。',
    timeAgo: '12 分鐘前 · 非即時鼓勵卡',
  },
  {
    id: 'card-2',
    authorId: 'zero-night-watchman',
    authorLabel: 'Zero 守夜人（AI 暖心回信）',
    isAi: true,
    message: '辛苦晒。呢個城市行得好快，但喺避風港入面，你可以容許自己慢落嚟抖 10 分鐘。',
    timeAgo: 'AI 兜底機制 · 絕不冷場',
  },
];

export const CardsPreviewScreen: React.FC = () => {
  const [eulaAccepted, setEulaAccepted] = useState(false);
  const [blockedAuthors, setBlockedAuthors] = useState<string[]>([]);
  const [hiddenCardIds, setHiddenCardIds] = useState<string[]>([]);

  const visibleCards = INITIAL_SAMPLE_CARDS.filter(
    (c) => !hiddenCardIds.includes(c.id) && !blockedAuthors.includes(c.authorId)
  );

  const handleReport = (card: SampleCard) => {
    Alert.alert(
      '舉報此鼓勵卡',
      '舉報後卡片將即時從你的畫面隱藏，並送交 24 小時內審核處理（Top 3 將串接 Supabase 後端）。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確認舉報並隱藏',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            setHiddenCardIds((prev) => [...prev, card.id]);
          },
        },
      ]
    );
  };

  const handleBlock = (card: SampleCard) => {
    Alert.alert(
      '封鎖匿名作者',
      '封鎖後將即時隱藏此匿名作者的所有歷史與未來鼓勵卡。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確認封鎖',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            setBlockedAuthors((prev) => [...prev, card.authorId]);
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>非即時鼓勵卡（Top 3 合規預覽）</Text>
      <Text style={styles.subtitle}>
        遵循 Apple Guideline 1.2：無即時隨機聊天、AI 事前內容過濾、每張卡片皆可一鍵舉報與封鎖。
      </Text>

      {/* EULA Consent Gate */}
      <View style={styles.eulaCard}>
        <Text style={styles.eulaTitle}>社群守則與 EULA（零容忍政策）</Text>
        <Text style={styles.eulaDesc}>
          嚴禁辱罵、騷擾、色情、自殘誘導或交換個人聯絡方式（電話／IG／TG／WhatsApp）。違規內容將由後端 AI 事前攔截。
        </Text>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setEulaAccepted((v) => !v);
          }}
          style={[
            styles.eulaBtn,
            eulaAccepted && { backgroundColor: COLORS.limeSoft, borderColor: COLORS.lime },
          ]}
        >
          <Text style={[styles.eulaBtnText, eulaAccepted && { color: COLORS.lime }]}>
            {eulaAccepted ? '✓ 已同意 EULA 與零容忍守則' : '點此同意 EULA 以啟用鼓勵卡'}
          </Text>
        </Pressable>
      </View>

      {/* Sample Cards with Report & Block actions */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>收到的暖心鼓勵卡</Text>
        {visibleCards.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>所有示範卡片已隱藏／封鎖，點此重設預覽。</Text>
            <Pressable
              onPress={() => {
                setHiddenCardIds([]);
                setBlockedAuthors([]);
              }}
              style={styles.resetBtn}
            >
              <Text style={styles.resetBtnText}>重設預覽卡片</Text>
            </Pressable>
          </View>
        ) : (
          visibleCards.map((card) => (
            <View key={card.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={[styles.author, card.isAi && { color: COLORS.amber }]}>
                  {card.isAi ? '🕯️ ' : '✉️ '}
                  {card.authorLabel}
                </Text>
                <Text style={styles.time}>{card.timeAgo}</Text>
              </View>
              <Text style={styles.cardBody}>「{card.message}」</Text>
              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => handleReport(card)}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionText}>🚩 一鍵舉報</Text>
                </Pressable>
                {!card.isAi && (
                  <Pressable
                    onPress={() => handleBlock(card)}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionText}>🚫 封鎖匿名作者</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* HK 24-Hour Crisis Support Resources */}
      <View style={styles.supportCard}>
        <Text style={styles.supportTitle}>🫂 香港 24 小時專業情緒支援</Text>
        <Text style={styles.supportDesc}>
          如果此刻情緒非常沉重，請讓專業輔導員陪你傾訴（點擊即可直撥）：
        </Text>
        {HK_SUPPORT_HOTLINES.map((h) => (
          <Pressable
            key={h.phone}
            onPress={() => Linking.openURL(`tel:${h.phone}`).catch(() => {})}
            style={styles.hotlineRow}
          >
            <View>
              <Text style={styles.hotlineName}>{h.name}</Text>
              <Text style={styles.hotlineHours}>{h.hours}</Text>
            </View>
            <Text style={styles.hotlineNum}>{h.displayPhone ?? h.phone}</Text>
          </Pressable>
        ))}
        <Text style={styles.disclaimer}>
          免責聲明：Zero 避風港僅提供放鬆與正向鼓勵體驗，並非醫療或臨床心理治療服務。
        </Text>
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
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  eulaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: 10,
  },
  eulaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.lime,
  },
  eulaDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  eulaBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
  },
  eulaBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: 10,
  },
  cardHeader: {
    gap: 3,
  },
  author: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.lime,
  },
  time: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  cardBody: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 22,
    fontWeight: '300',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  actionText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  emptyBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  resetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.limeBorder,
  },
  resetBtnText: {
    fontSize: 12,
    color: COLORS.lime,
  },
  supportCard: {
    backgroundColor: 'rgba(255, 179, 71, 0.08)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.amberBorder,
    gap: 10,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.amber,
  },
  supportDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  hotlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderRadius: 12,
    padding: 12,
  },
  hotlineName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  hotlineHours: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  hotlineNum: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.amber,
    fontVariant: ['tabular-nums'],
  },
  disclaimer: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginTop: 4,
  },
});
