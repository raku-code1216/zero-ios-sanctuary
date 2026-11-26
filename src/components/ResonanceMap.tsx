import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { MapDot } from '../constants/resonanceData';
import { COLORS } from '../constants/theme';

export type MapViewMode = 'hk' | 'global';

export interface ActiveRipple {
  id: string;
  lat: number;
  lng: number;
  variant: 'lime' | 'sos';
}

export const HK_REGION: Region = {
  latitude: 22.302,
  longitude: 114.172,
  latitudeDelta: 0.24,
  longitudeDelta: 0.24,
};

export const GLOBAL_REGION: Region = {
  latitude: 22.302,
  longitude: 114.172,
  latitudeDelta: 65,
  longitudeDelta: 65,
};

interface Props {
  viewMode: MapViewMode;
  dots: MapDot[];
  userLocation: { lat: number; lng: number };
  isUserSos: boolean;
  ripples: ActiveRipple[];
  glowingDotIds: Record<string, boolean>;
  onRegionChange: (region: Region) => void;
  onMapTap: (coords: { lat: number; lng: number }) => void;
}

// Delicate hollow sonar ripple (transparent fill, 1.5px stroke, 2 staggered rings + 5px core)
const HollowSonarRipple: React.FC<{
  x: number;
  y: number;
  variant: 'lime' | 'sos';
}> = ({ x, y, variant }) => {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const coreOpacity = useRef(new Animated.Value(1)).current;
  const color = variant === 'sos' ? COLORS.amber : COLORS.lime;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(ring1, {
        toValue: 1,
        duration: 3600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(750),
        Animated.timing(ring2, {
          toValue: 1,
          duration: 3000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(2400),
        Animated.timing(coreOpacity, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [coreOpacity, ring1, ring2]);

  const makeRingStyle = (anim: Animated.Value) => ({
    borderColor: color,
    opacity: anim.interpolate({
      inputRange: [0, 0.15, 1],
      outputRange: [0.85, 0.7, 0],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.08, 2.9],
        }),
      },
    ],
  });

  return (
    <View
      pointerEvents="none"
      style={[styles.rippleAnchor, { left: x - 34, top: y - 34 }]}
    >
      <Animated.View style={[styles.hollowRing, makeRingStyle(ring1)]} />
      <Animated.View style={[styles.hollowRing, makeRingStyle(ring2)]} />
      <Animated.View
        style={[
          styles.rippleCore,
          {
            backgroundColor: color,
            shadowColor: color,
            opacity: coreOpacity,
          },
        ]}
      />
    </View>
  );
};

// Memoized micro-glowing stardust dot (4px-5px, gentle 1.8x glow-receive)
const CompanionDotMarker = React.memo(
  ({ dot, isGlowing }: { dot: MapDot; isGlowing: boolean }) => {
    const baseColor = dot.isSos ? COLORS.amber : COLORS.lime;
    return (
      <Marker
        coordinate={{ latitude: dot.lat, longitude: dot.lng }}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges={isGlowing}
        tappable={false}
      >
        <View style={styles.dotSlot}>
          {isGlowing ? (
            <View style={styles.glowHalo}>
              <View style={styles.glowCore} />
            </View>
          ) : (
            <View
              style={[
                dot.isSos ? styles.dotSos : styles.dotLime,
                { backgroundColor: baseColor, shadowColor: baseColor },
              ]}
            />
          )}
        </View>
      </Marker>
    );
  }
);

export const ResonanceMap: React.FC<Props> = ({
  viewMode,
  dots,
  userLocation,
  isUserSos,
  ripples,
  glowingDotIds,
  onRegionChange,
  onMapTap,
}) => {
  const mapRef = useRef<MapView | null>(null);
  const [ripplePoints, setRipplePoints] = useState<
    Record<string, { x: number; y: number }>
  >({});

  // Smoothly fly between Hong Kong view and Global view
  useEffect(() => {
    const target = viewMode === 'hk' ? HK_REGION : GLOBAL_REGION;
    mapRef.current?.animateToRegion(target, 850);
  }, [viewMode]);

  // Project active ripple geo-coordinates to screen coordinates for crisp 60fps hollow rings
  const syncRippleScreenPositions = async () => {
    if (!mapRef.current || ripples.length === 0) return;
    const next: Record<string, { x: number; y: number }> = {};
    for (const r of ripples) {
      try {
        const pt = await mapRef.current.pointForCoordinate({
          latitude: r.lat,
          longitude: r.lng,
        });
        next[r.id] = pt;
      } catch {
        // Ignore if map is still mounting
      }
    }
    setRipplePoints(next);
  };

  useEffect(() => {
    syncRippleScreenPositions();
  }, [ripples]);

  const userColor = isUserSos ? COLORS.amber : COLORS.lime;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={HK_REGION}
        mapType="mutedStandard"
        userInterfaceStyle="dark"
        showsBuildings={false}
        showsCompass={false}
        showsTraffic={false}
        showsIndoors={false}
        showsScale={false}
        showsPointsOfInterests={false}
        pointsOfInterestFilter={[]}
        rotateEnabled={false}
        pitchEnabled={false}
        onRegionChangeComplete={(region) => {
          onRegionChange(region);
          syncRippleScreenPositions();
        }}
        onPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          onMapTap({ lat: latitude, lng: longitude });
        }}
      >
        {/* 128 micro stardust companion markers */}
        {dots.map((dot) => (
          <CompanionDotMarker
            key={dot.id}
            dot={dot}
            isGlowing={Boolean(glowingDotIds[dot.id])}
          />
        ))}

        {/* User's own subtle glowing beacon */}
        <Marker
          coordinate={{
            latitude: userLocation.lat,
            longitude: userLocation.lng,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
          tappable={false}
        >
          <View style={styles.userSlot}>
            <View
              style={[
                styles.userOuterRing,
                { borderColor: `${userColor}88` },
              ]}
            >
              <View
                style={[
                  styles.userCore,
                  { backgroundColor: userColor, shadowColor: userColor },
                ]}
              />
            </View>
          </View>
        </Marker>
      </MapView>

      {/* Ultra-fine hollow sonar ripple overlay */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {ripples.map((r) => {
          const pt = ripplePoints[r.id];
          if (!pt) return null;
          return (
            <HollowSonarRipple
              key={r.id}
              x={pt.x}
              y={pt.y}
              variant={r.variant}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#050505',
  },
  dotSlot: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotLime: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
    opacity: 0.78,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 3,
  },
  dotSos: {
    width: 5.5,
    height: 5.5,
    borderRadius: 2.75,
    opacity: 0.92,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  // Gentle 1.8x glow-receive highlight (soft white-lime halo, NOT a giant white ball)
  glowHalo: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'rgba(222, 255, 154, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F4FFE0',
    shadowColor: '#DEFF9A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  userSlot: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userOuterRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCore: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 6,
  },
  rippleAnchor: {
    position: 'absolute',
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hollowRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  rippleCore: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 6,
  },
});
