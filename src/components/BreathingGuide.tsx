import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/theme';

type BreathPhase = 'inhale' | 'hold' | 'exhale';

const PHASE_CONFIG: Record<
  BreathPhase,
  { label: string; seconds: number; next: BreathPhase; targetScale: number }
> = {
  inhale: { label: '慢慢吸氣', seconds: 4, next: 'hold', targetScale: 1.38 },
  hold: { label: '輕輕閉氣', seconds: 7, next: 'exhale', targetScale: 1.38 },
  exhale: { label: '緩緩呼氣', seconds: 8, next: 'inhale', targetScale: 0.88 },
};

interface Props {
  accentColor: string;
  active: boolean;
}

export const BreathingGuide: React.FC<Props> = ({ accentColor, active }) => {
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    if (!active) return;

    const cfg = PHASE_CONFIG[phase];
    setCountdown(cfg.seconds);

    if (hapticEnabled) {
      if (phase === 'inhale') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } else if (phase === 'hold') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    }

    Animated.timing(scaleAnim, {
      toValue: cfg.targetScale,
      duration: cfg.seconds * 1000,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    }).start();

    let remaining = cfg.seconds;
    const tick = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        setCountdown(remaining);
        if (hapticEnabled && (phase === 'inhale' || phase === 'exhale')) {
          Haptics.selectionAsync().catch(() => {});
        }
      } else {
        clearInterval(tick);
        setPhase(cfg.next);
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [phase, active, hapticEnabled, scaleAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.orbWrap}>
        <Animated.View
          style={[
            styles.glowRing,
            {
              borderColor: `${accentColor}44`,
              backgroundColor: `${accentColor}16`,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
        <View style={[styles.core, { borderColor: `${accentColor}88` }]}>
          <Text style={[styles.phaseText, { color: accentColor }]}>
            {PHASE_CONFIG[phase].label}
          </Text>
          <Text style={styles.countText}>{countdown}s</Text>
        </View>
      </View>

      <Pressable
        onPress={() => {
          setHapticEnabled((v) => !v);
          Haptics.selectionAsync().catch(() => {});
        }}
        style={styles.hapticPill}
      >
        <Text style={styles.hapticPillText}>
          {hapticEnabled ? '📳 4-7-8 閉眼震動引導：開' : '📴 4-7-8 閉眼震動引導：關'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbWrap: {
    width: 196,
    height: 196,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1,
  },
  core: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    backgroundColor: 'rgba(5, 5, 5, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 1.5,
  },
  countText: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  hapticPill: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  hapticPillText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
});
