import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import {
  AudioMixState,
  AudioTrackId,
  SANCTUARY_SCENES,
  SceneId,
} from './src/constants/scenes';
import { COLORS } from './src/constants/theme';
import { HomeScreen } from './src/screens/HomeScreen';
import { SanctuaryScreen } from './src/screens/SanctuaryScreen';
import { CardsPreviewScreen } from './src/screens/CardsPreviewScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type TabKey = 'home' | 'cards' | 'settings';

function RootApp() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [inSanctuary, setInSanctuary] = useState(false);
  const [sceneId, setSceneId] = useState<SceneId>('ferry');
  const [isMuted, setIsMuted] = useState(false);

  const selectedScene = useMemo(
    () => SANCTUARY_SCENES.find((s) => s.id === sceneId) ?? SANCTUARY_SCENES[0],
    [sceneId]
  );

  const [audioMix, setAudioMix] = useState<AudioMixState>(
    SANCTUARY_SCENES[0].defaultMix
  );

  // Strictly use expo-audio (NOT legacy expo-av)
  const harbourPlayer = useAudioPlayer(require('./assets/audio/harbour.wav'));
  const rainPlayer = useAudioPlayer(require('./assets/audio/rain.wav'));
  const tramPlayer = useAudioPlayer(require('./assets/audio/tram.wav'));
  const bowlPlayer = useAudioPlayer(require('./assets/audio/bowl.wav'));

  // Configure iOS/Android background playback & silent switch support
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'mixWithOthers',
      allowsRecording: false,
    }).catch((err) => {
      console.warn('setAudioModeAsync warning:', err);
    });
  }, []);

  // Synchronize multi-track volumes & looping playback
  useEffect(() => {
    const players: Record<AudioTrackId, ReturnType<typeof useAudioPlayer>> = {
      harbour: harbourPlayer,
      rain: rainPlayer,
      tram: tramPlayer,
      bowl: bowlPlayer,
    };

    (Object.keys(players) as AudioTrackId[]).forEach((trackId) => {
      const player = players[trackId];
      const vol = isMuted ? 0 : audioMix[trackId];
      player.loop = true;
      player.volume = vol;

      if (inSanctuary && vol > 0.01) {
        if (!player.playing) {
          player.play();
        }
      } else {
        if (player.playing) {
          player.pause();
        }
      }
    });
  }, [inSanctuary, isMuted, audioMix, harbourPlayer, rainPlayer, tramPlayer, bowlPlayer]);

  const handleSelectScene = (id: SceneId) => {
    setSceneId(id);
    const nextScene = SANCTUARY_SCENES.find((s) => s.id === id);
    if (nextScene) {
      setAudioMix({ ...nextScene.defaultMix });
    }
  };

  const handleChangeTrackVolume = (trackId: AudioTrackId, value: number) => {
    setAudioMix((prev) => ({ ...prev, [trackId]: value }));
  };

  if (inSanctuary) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <SanctuaryScreen
          scene={selectedScene}
          audioMix={audioMix}
          isMuted={isMuted}
          onSelectScene={handleSelectScene}
          onChangeTrackVolume={handleChangeTrackVolume}
          onToggleMute={() => setIsMuted((m) => !m)}
          onResetPreset={() => setAudioMix({ ...selectedScene.defaultMix })}
          onOpenSettings={() => {
            setInSanctuary(false);
            setActiveTab('settings');
          }}
          onExit={() => setInSanctuary(false)}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.content}>
        {activeTab === 'home' && (
          <HomeScreen
            selectedScene={selectedScene}
            onSelectScene={handleSelectScene}
            onEnterSanctuary={() => setInSanctuary(true)}
          />
        )}
        {activeTab === 'cards' && <CardsPreviewScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {(
          [
            { key: 'home', label: '避風港', icon: '🌙' },
            { key: 'cards', label: '鼓勵卡', icon: '✉️' },
            { key: 'settings', label: '設定', icon: '⚙️' },
          ] as { key: TabKey; label: string; icon: string }[]
        ).map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setActiveTab(tab.key);
              }}
              style={styles.tabItem}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <RootApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    backgroundColor: '#0A0B0D',
    paddingVertical: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.lime,
    fontWeight: '600',
  },
});
