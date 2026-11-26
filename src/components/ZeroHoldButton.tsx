import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/theme';

interface Props {
  onComplete: () => void;
  accentColor?: string;
}

const HOLD_DURATION_MS = 1500;

export const ZeroHoldButton: React.FC<Props> = ({
  onComplete,
  accentColor = COLORS.lime,
}) => {
  const [holding, setHolding] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hapticIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const clearTimers = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (hapticIntervalRef.current) {
      clearInterval(hapticIntervalRef.current);
      hapticIntervalRef.current = null;
    }
  };

  useEffect(() => clearTimers, []);

  const handlePressIn = () => {
    setHolding(true);
    stepRef.current = 0;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: HOLD_DURATION_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    // Progressive haptic pulses as tension builds (Light -> Medium -> Heavy)
    hapticIntervalRef.current = setInterval(() => {
      stepRef.current += 1;
      if (stepRef.current <= 3) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } else if (stepRef.current <= 6) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      }
    }, 180);

    holdTimerRef.current = setTimeout(() => {
      clearTimers();
      setHolding(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      progressAnim.setValue(0);
      onComplete();
    }, HOLD_DURATION_MS);
  };

  const handlePressOut = () => {
    clearTimers();
    setHolding(false);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 240,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const fillHeight = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const outerScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.55],
  });

  const outerOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pulseRing,
          {
            borderColor: accentColor,
            opacity: outerOpacity,
            transform: [{ scale: outerScale }],
          },
        ]}
      />

      <View style={[styles.outerRing, { borderColor: `${accentColor}55` }]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            styles.button,
            {
              borderColor: accentColor,
              transform: [{ scale: pressed ? 0.94 : 1 }],
            },
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.fillOverlay,
              {
                height: fillHeight,
                backgroundColor: `${accentColor}38`,
              },
            ]}
          />
          <Text style={[styles.zeroText, { color: accentColor }]}>0</Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>
        {holding ? '正在捏碎現實雜訊...' : '長按 1.5 秒 · 歸零進入避風港'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    top: 0,
    width: 172,
    height: 172,
    borderRadius: 86,
    borderWidth: 1,
  },
  outerRing: {
    width: 172,
    height: 172,
    borderRadius: 86,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5, 5, 5, 0.72)',
  },
  button: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(222, 255, 154, 0.05)',
  },
  fillOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  zeroText: {
    fontSize: 54,
    fontWeight: '200',
    letterSpacing: 2,
  },
  hint: {
    marginTop: 22,
    fontSize: 13,
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
  },
});
