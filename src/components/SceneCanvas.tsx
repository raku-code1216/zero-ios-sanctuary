import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { SanctuaryScene } from '../constants/scenes';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const PARTICLES: ParticleConfig[] = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  x: ((i * 73) % 92) / 100 * SCREEN_W,
  y: ((i * 47) % 88) / 100 * SCREEN_H,
  size: 4 + (i % 5) * 6,
  duration: 4200 + (i % 4) * 1600,
  delay: (i % 6) * 500,
}));

interface TouchRipple {
  id: number;
  x: number;
  y: number;
  anim: Animated.Value;
}

interface Props {
  scene: SanctuaryScene;
  interactive?: boolean;
  onTapDecompress?: () => void;
}

export const SceneCanvas: React.FC<Props> = ({
  scene,
  interactive = true,
  onTapDecompress,
}) => {
  const particleAnims = useRef(PARTICLES.map(() => new Animated.Value(0))).current;
  const [ripples, setRipples] = useState<TouchRipple[]>([]);
  const rippleIdRef = useRef(0);

  useEffect(() => {
    const loops = particleAnims.map((anim, idx) => {
      anim.setValue(0);
      return Animated.loop(
        Animated.sequence([
          Animated.delay(PARTICLES[idx].delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: PARTICLES[idx].duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      );
    });
    loops.forEach((loop) => loop.start());
    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [scene.id, particleAnims]);

  const handlePress = (e: GestureResponderEvent) => {
    if (!interactive) return;
    const { locationX, locationY } = e.nativeEvent;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onTapDecompress?.();

    const id = ++rippleIdRef.current;
    const anim = new Animated.Value(0);
    setRipples((prev) => [...prev.slice(-5), { id, x: locationX, y: locationY, anim }]);

    Animated.timing(anim, {
      toValue: 1,
      duration: 1600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    });
  };

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={handlePress} disabled={!interactive}>
      <LinearGradient colors={scene.gradient} style={StyleSheet.absoluteFill} />

      {/* Lightweight scene-specific ambient particles */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {PARTICLES.map((p, idx) => {
          const anim = particleAnims[idx];

          if (scene.particleType === 'rain') {
            const translateY = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [-60, SCREEN_H + 60],
            });
            const opacity = anim.interpolate({
              inputRange: [0, 0.2, 0.85, 1],
              outputRange: [0, 0.45, 0.35, 0],
            });
            return (
              <Animated.View
                key={p.id}
                style={[
                  styles.rainDrop,
                  {
                    left: p.x,
                    height: 18 + (p.id % 3) * 12,
                    backgroundColor: scene.accentColor,
                    opacity,
                    transform: [{ translateY }, { rotate: '10deg' }],
                  },
                ]}
              />
            );
          }

          if (scene.particleType === 'mist') {
            const translateX = anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [-30, 35, -30],
            });
            const opacity = anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.05, 0.16, 0.05],
            });
            return (
              <Animated.View
                key={p.id}
                style={[
                  styles.orb,
                  {
                    left: p.x - 40,
                    top: p.y,
                    width: p.size * 5,
                    height: p.size * 5,
                    borderRadius: p.size * 2.5,
                    backgroundColor: scene.accentColor,
                    opacity,
                    transform: [{ translateX }],
                  },
                ]}
              />
            );
          }

          // 'ripple' (ferry harbour lights) or 'bokeh' (cha chaan teng warm glow)
          const translateY = anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, -18, 0],
          });
          const scale = anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.85, 1.35, 0.85],
          });
          const opacity = anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.08, scene.particleType === 'bokeh' ? 0.24 : 0.32, 0.08],
          });
          const dotSize = scene.particleType === 'bokeh' ? p.size * 2.2 : p.size * 0.75;

          return (
            <Animated.View
              key={p.id}
              style={[
                styles.orb,
                {
                  left: p.x,
                  top: p.y,
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  backgroundColor: scene.accentColor,
                  opacity,
                  transform: [{ translateY }, { scale }],
                },
              ]}
            />
          );
        })}

        {/* Interactive decompression ripples on tap */}
        {ripples.map((r) => {
          const scale = r.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 3.8],
          });
          const opacity = r.anim.interpolate({
            inputRange: [0, 0.25, 1],
            outputRange: [0.75, 0.45, 0],
          });
          return (
            <Animated.View
              key={r.id}
              style={[
                styles.touchRipple,
                {
                  left: r.x - 45,
                  top: r.y - 45,
                  borderColor: scene.accentColor,
                  opacity,
                  transform: [{ scale }],
                },
              ]}
            />
          );
        })}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  rainDrop: {
    position: 'absolute',
    width: 1.5,
    borderRadius: 1,
  },
  orb: {
    position: 'absolute',
  },
  touchRipple: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
  },
});
