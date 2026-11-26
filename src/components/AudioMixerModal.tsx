import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import {
  AUDIO_TRACKS,
  AudioMixState,
  AudioTrackId,
} from '../constants/scenes';
import { COLORS } from '../constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  mix: AudioMixState;
  isMuted: boolean;
  accentColor: string;
  onChangeTrackVolume: (trackId: AudioTrackId, value: number) => void;
  onToggleMute: () => void;
  onResetPreset: () => void;
}

export const AudioMixerModal: React.FC<Props> = ({
  visible,
  onClose,
  mix,
  isMuted,
  accentColor,
  onChangeTrackVolume,
  onToggleMute,
  onResetPreset,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>多軌白噪音混音器</Text>
              <Text style={styles.subtitle}>支援 iOS 背景播放 · 自由調配專屬音場</Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onToggleMute();
              }}
              style={[
                styles.muteBtn,
                { borderColor: isMuted ? COLORS.danger : `${accentColor}66` },
              ]}
            >
              <Text style={[styles.muteBtnText, { color: isMuted ? COLORS.danger : accentColor }]}>
                {isMuted ? '🔇 已靜音' : '🔊 播放中'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.trackList}>
            {AUDIO_TRACKS.map((track) => {
              const value = mix[track.id];
              return (
                <View key={track.id} style={styles.trackRow}>
                  <View style={styles.trackLabelRow}>
                    <Text style={styles.trackName}>
                      {track.icon} {track.label}
                    </Text>
                    <Text style={styles.trackPct}>{Math.round(value * 100)}%</Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    step={0.05}
                    value={value}
                    minimumTrackTintColor={accentColor}
                    maximumTrackTintColor="rgba(255,255,255,0.16)"
                    thumbTintColor={accentColor}
                    onValueChange={(v) => onChangeTrackVolume(track.id, v)}
                  />
                </View>
              );
            })}
          </View>

          <View style={styles.footerRow}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onResetPreset();
              }}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>還原場景預設</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={[styles.primaryBtn, { backgroundColor: accentColor }]}
            >
              <Text style={styles.primaryBtnText}>完成</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111317',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  muteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  muteBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trackList: {
    gap: 12,
  },
  trackRow: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  trackLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackName: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  trackPct: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  slider: {
    width: '100%',
    height: 36,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#050505',
    fontSize: 14,
    fontWeight: '700',
  },
});
