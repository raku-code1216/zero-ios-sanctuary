import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  HK_MOOD_CHIPS,
  SANCTUARY_SCENES,
  SanctuaryScene,
  SceneId,
} from '../constants/scenes';
import { COLORS } from '../constants/theme';
import { ZeroHoldButton } from '../components/ZeroHoldButton';

interface Props {
  selectedScene: SanctuaryScene;
  onSelectScene: (id: SceneId) => void;
  onEnterSanctuary: (moodId: string | null) => void;
}

export const HomeScreen: React.FC<Props> = ({
  selectedScene,
  onSelectScene,
  onEnterSanctuary,
}) => {
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const currentMood = HK_MOOD_CHIPS.find((m) => m.id === selectedMoodId);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Minimalist Zero Header (#050505 + #DEFF9A) */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.dot} />
          <Text style={styles.brandText}>ZERO</Text>
        </View>
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>無限次免費 · 無冷卻</Text>
        </View>
      </View>

      {/* Iconic Quote + HK Mood Response */}
      <View style={styles.heroTextWrap}>
        <Text style={styles.heroTitle}>
          {currentMood ? currentMood.reply : '世界很吵，這裡很靜。'}
        </Text>
        <Text style={styles.heroSubtitle}>
          長按歸零進入暗黑共鳴地圖，發送寂靜波紋給香港與全球同行者
        </Text>
      </View>

      {/* HK Mood Check-in Chips */}
      <View style={styles.chipsWrap}>
        {HK_MOOD_CHIPS.map((chip) => {
          const active = chip.id === selectedMoodId;
          return (
            <Pressable
              key={chip.id}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setSelectedMoodId(active ? null : chip.id);
              }}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Signature 1.5s Progressive Haptic Zero Ring */}
      <View style={styles.ritualWrap}>
        <ZeroHoldButton
          accentColor={COLORS.lime}
          onComplete={() => onEnterSanctuary(selectedMoodId)}
        />
      </View>

      {/* Background Soundscape Preset Selector */}
      <View style={styles.sceneSection}>
        <Text style={styles.sectionLabel}>入場背景白噪音預設</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sceneList}
        >
          {SANCTUARY_SCENES.map((scene) => {
            const isSelected = scene.id === selectedScene.id;
            return (
              <Pressable
                key={scene.id}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  onSelectScene(scene.id);
                }}
                style={[styles.sceneCard, isSelected && styles.sceneCardSelected]}
              >
                <View style={styles.sceneTopRow}>
                  <Text style={styles.sceneLocation}>{scene.location}</Text>
                  {scene.isPro && (
                    <View style={styles.proPill}>
                      <Text style={styles.proPillText}>PRO 試聽</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.sceneTitle, isSelected && { color: COLORS.lime }]}>
                  {scene.title}
                </Text>
                <Text style={styles.sceneSub} numberOfLines={1}>
                  {scene.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
    justifyContent: 'space-between',
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.lime,
  },
  brandText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    color: COLORS.lime,
  },
  freeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  freeBadgeText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
  },
  heroTextWrap: {
    marginTop: 22,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '200',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: 1.2,
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 17,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  chipActive: {
    backgroundColor: COLORS.limeSoft,
    borderColor: COLORS.limeBorder,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.lime,
    fontWeight: '600',
  },
  ritualWrap: {
    marginVertical: 28,
    alignItems: 'center',
  },
  sceneSection: {
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  sceneList: {
    gap: 10,
    paddingRight: 8,
  },
  sceneCard: {
    width: 174,
    padding: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(14,14,16,0.85)',
  },
  sceneCardSelected: {
    borderColor: COLORS.limeBorder,
    backgroundColor: COLORS.limeSoft,
  },
  sceneTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sceneLocation: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  proPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: COLORS.amberSoft,
    borderWidth: 1,
    borderColor: COLORS.amberBorder,
  },
  proPillText: {
    fontSize: 9,
    color: COLORS.amber,
    fontWeight: '700',
  },
  sceneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sceneSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
