import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Region } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import {
  AudioMixState,
  AudioTrackId,
  SANCTUARY_SCENES,
  SanctuaryScene,
  SceneId,
} from '../constants/scenes';
import {
  generateCompanionDots,
  GLOBAL_COMPANION_MESSAGES,
  ResonanceToast,
} from '../constants/resonanceData';
import { COLORS } from '../constants/theme';
import {
  ActiveRipple,
  HK_REGION,
  MapViewMode,
  ResonanceMap,
} from '../components/ResonanceMap';
import { PhraseCapsuleModal } from '../components/PhraseCapsuleModal';
import { SosModal } from '../components/SosModal';
import { ToastOverlay } from '../components/ToastOverlay';
import { AudioMixerModal } from '../components/AudioMixerModal';
import { BreathingGuide } from '../components/BreathingGuide';

const DURATION_OPTIONS = [5, 10, 25];
const USER_DEFAULT_HK = { lat: 22.282, lng: 114.158 }; // Central / Victoria Harbour

interface Props {
  scene: SanctuaryScene;
  audioMix: AudioMixState;
  isMuted: boolean;
  onSelectScene: (id: SceneId) => void;
  onChangeTrackVolume: (trackId: AudioTrackId, value: number) => void;
  onToggleMute: () => void;
  onResetPreset: () => void;
  onOpenSettings: () => void;
  onExit: () => void;
}

export const SanctuaryScreen: React.FC<Props> = ({
  scene,
  audioMix,
  isMuted,
  onSelectScene,
  onChangeTrackVolume,
  onToggleMute,
  onResetPreset,
  onOpenSettings,
  onExit,
}) => {
  const insets = useSafeAreaInsets();

  // Map & Resonance state
  const [viewMode, setViewMode] = useState<MapViewMode>('hk');
  const currentRegionRef = useRef<Region>(HK_REGION);
  const allDots = useMemo(() => generateCompanionDots(), []);
  const [blockedAuthors, setBlockedAuthors] = useState<string[]>([]);
  const [ripples, setRipples] = useState<ActiveRipple[]>([]);
  const [glowingDotIds, setGlowingDotIds] = useState<Record<string, boolean>>({});
  const [isUserSos, setIsUserSos] = useState(false);
  const [liveCount, setLiveCount] = useState(128);

  // Interactive modals & auxiliary tools
  const [pendingTap, setPendingTap] = useState<{ lat: number; lng: number } | null>(null);
  const [customPhrase, setCustomPhrase] = useState<string | null>(null);
  const [sosOpen, setSosOpen] = useState(false);
  const [mixerOpen, setMixerOpen] = useState(false);
  const [breathingOpen, setBreathingOpen] = useState(false);

  // Top stacked toasts
  const [toasts, setToasts] = useState<ResonanceToast[]>([]);
  const toastCounter = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Focus countdown timer
  const [durationMin, setDurationMin] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);

  const visibleDots = useMemo(
    () => allDots.filter((d) => !blockedAuthors.includes(d.authorId)),
    [allDots, blockedAuthors]
  );

  const scheduleTimer = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    setSecondsLeft(durationMin * 60);
  }, [durationMin]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Gentle online counter fluctuation
  useEffect(() => {
    const iv = setInterval(() => {
      setLiveCount((c) => Math.max(96, c + Math.floor(Math.random() * 3) - 1));
    }, 5500);
    return () => clearInterval(iv);
  }, []);

  const pushToast = useCallback(
    (payload: Omit<ResonanceToast, 'id'>, durationMs = 6500) => {
      if (blockedAuthors.includes(payload.authorId)) return;
      const id = `toast-${++toastCounter.current}`;
      setToasts((prev) => [{ ...payload, id }, ...prev.slice(0, 1)]);
      scheduleTimer(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, durationMs);
    },
    [blockedAuthors, scheduleTimer]
  );

  // Spawn a hollow sonar ripple & trigger distance-delayed glow-receive on nearby dots
  const triggerRippleAt = useCallback(
    (lat: number, lng: number, variant: 'lime' | 'sos'): number => {
      const rippleId = `rip-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
      setRipples((prev) => [...prev.slice(-5), { id: rippleId, lat, lng, variant }]);
      scheduleTimer(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 3900);

      // Compute geo radius proportional to current map zoom span so lit dots match visual ring
      const latDelta = currentRegionRef.current.latitudeDelta || 0.24;
      const maxDegRadius = latDelta * (variant === 'sos' ? 0.34 : 0.24);

      let litCount = 0;
      visibleDots.forEach((dot) => {
        const dist = Math.hypot(dot.lat - lat, dot.lng - lng);
        if (dist <= maxDegRadius) {
          litCount += 1;
          const delayMs = Math.round((dist / maxDegRadius) * 1100) + 100;
          scheduleTimer(() => {
            setGlowingDotIds((prev) => ({ ...prev, [dot.id]: true }));
            scheduleTimer(() => {
              setGlowingDotIds((prev) => {
                const next = { ...prev };
                delete next[dot.id];
                return next;
              });
            }, 4000);
          }, delayMs);
        }
      });

      return litCount;
    },
    [scheduleTimer, visibleDots]
  );

  // Ambient companion ripples & periodic gentle resonance messages
  useEffect(() => {
    const waveIv = setInterval(() => {
      const pool = viewMode === 'hk' ? visibleDots.filter((d) => d.isHk) : visibleDots;
      if (pool.length === 0) return;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      triggerRippleAt(pick.lat, pick.lng, pick.isSos ? 'sos' : 'lime');
    }, 9000);

    const msgIv = setInterval(() => {
      const eligible = GLOBAL_COMPANION_MESSAGES.filter(
        (m) => !blockedAuthors.includes(m.authorId)
      );
      if (eligible.length === 0) return;
      const m = eligible[Math.floor(Math.random() * eligible.length)];
      pushToast({
        authorId: m.authorId,
        icon: '〰️',
        title: `來自 ${m.loc} 的同行者`,
        text: `「${m.text}」`,
        translation: m.trans || undefined,
        variant: 'lime',
        canModerate: true,
      });
    }, 24000);

    return () => {
      clearInterval(waveIv);
      clearInterval(msgIv);
    };
  }, [blockedAuthors, pushToast, triggerRippleAt, viewMode, visibleDots]);

  const handleSendWave = (message: string, isCustom: boolean) => {
    if (!pendingTap) return;
    if (isCustom) setCustomPhrase(message);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const litCount = triggerRippleAt(pendingTap.lat, pendingTap.lng, 'lime');
    setPendingTap(null);

    pushToast(
      {
        authorId: 'system-self',
        icon: '〰️',
        title: litCount > 0 ? `共鳴波紋已點亮 ${litCount} 位同行者` : '寂靜波紋已向四周擴散',
        text: `「${message}」`,
        variant: 'lime',
        canModerate: false,
      },
      4800
    );
  };

  const handleSendSos = (struggleMsg: string) => {
    setIsUserSos(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    triggerRippleAt(USER_DEFAULT_HK.lat, USER_DEFAULT_HK.lng, 'sos');

    pushToast({
      authorId: 'system-sos',
      icon: '🫂',
      title: '暖橘求助信標已發出',
      text: struggleMsg
        ? `已傳達：「${struggleMsg}」。請記住，你並不是孤單一人。`
        : '波紋已向周圍擴散。請深呼吸，避風港正陪著你。',
      variant: 'sos',
      canModerate: false,
    });

    // AI Night Watchman warm empathy reply (5s)
    scheduleTimer(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      pushToast(
        {
          authorId: 'zero-night-watchman',
          icon: '🕯️',
          title: 'Zero 守夜人 · 暖心回信',
          text: '「辛苦晒，唔使急住撐起晒所有嘢。先放低手機深呼吸三下，呢度永遠留返個位俾你。」',
          variant: 'sos',
          canModerate: false,
        },
        8000
      );
    }, 5000);

    // Companion empathy reply (13s)
    scheduleTimer(() => {
      pushToast(
        {
          authorId: 'anon-hk-empathy',
          icon: '🫂',
          title: '來自 香港 的同行者',
          text: '「無論你而家經歷緊咩，撐埋今晚先，我哋喺維港另一邊陪緊你。」',
          variant: 'sos',
          canModerate: true,
        },
        8000
      );
    }, 13000);
  };

  const handleReportToast = (toast: ResonanceToast) => {
    Alert.alert(
      '舉報此訊息',
      '已即時從你的畫面隱藏，並送交 24 小時審核處理（Apple Guideline 1.2 合規保護）。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確認舉報',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            setToasts((prev) => prev.filter((t) => t.id !== toast.id));
          },
        },
      ]
    );
  };

  const handleBlockAuthor = (toast: ResonanceToast) => {
    Alert.alert(
      '封鎖此匿名作者',
      '封鎖後將即時隱藏該作者於地圖上嘅光點與所有訊息。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確認封鎖',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            setBlockedAuthors((prev) => [...prev, toast.authorId]);
            setToasts((prev) => prev.filter((t) => t.authorId !== toast.authorId));
          },
        },
      ]
    );
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <View style={styles.root}>
      {/* Centerpiece: Native Apple Maps Dark Resonance Map */}
      <ResonanceMap
        viewMode={viewMode}
        dots={visibleDots}
        userLocation={USER_DEFAULT_HK}
        isUserSos={isUserSos}
        ripples={ripples}
        glowingDotIds={glowingDotIds}
        onRegionChange={(region) => {
          currentRegionRef.current = region;
        }}
        onMapTap={({ lat, lng }) => {
          Haptics.selectionAsync().catch(() => {});
          setPendingTap({ lat, lng });
        }}
      />

      {/* Top Stacked Resonance Toasts (cleanly below top capsule row, symmetric margins) */}
      <ToastOverlay
        toasts={toasts}
        topOffset={insets.top + 68}
        onReportToast={handleReportToast}
        onBlockAuthor={handleBlockAuthor}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Foreground HUD */}
      <View
        pointerEvents="box-none"
        style={[
          styles.overlay,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 14 },
        ]}
      >
        {/* Top Bar: Exit | Timer | View Switcher + Minimalist Settings Icon */}
        <View style={styles.topRow}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onExit();
            }}
            style={styles.glassPill}
          >
            <Text style={styles.pillText}>← 離開</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              const idx = DURATION_OPTIONS.indexOf(durationMin);
              setDurationMin(DURATION_OPTIONS[(idx + 1) % DURATION_OPTIONS.length]);
              Haptics.selectionAsync().catch(() => {});
            }}
            style={styles.timerPill}
          >
            <Text style={styles.timerLabel}>避難倒數</Text>
            <Text style={styles.timerValue}>
              {mm}:{ss}
            </Text>
          </Pressable>

          <View style={styles.topRightGroup}>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setViewMode((m) => (m === 'hk' ? 'global' : 'hk'));
              }}
              style={[styles.glassPill, styles.limeBorder]}
            >
              <Text style={styles.limePillText}>
                {viewMode === 'hk' ? '香港' : '全球'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onOpenSettings();
              }}
              style={styles.settingsBtn}
              accessibilityLabel="開啟設定"
            >
              <Text style={styles.settingsIcon}>⚙</Text>
            </Pressable>
          </View>
        </View>

        {/* Bottom Frosted Glass Resonance Panel */}
        <View style={styles.bottomCard}>
          <View style={styles.bottomHeader}>
            <Text style={styles.kicker}>GLOBAL RESONANCE</Text>
            <View style={styles.liveRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveNum}>{liveCount}</Text>
              <Text style={styles.liveSuffix}>在線</Text>
            </View>
          </View>

          <Text style={styles.mapHint}>
            點擊地圖任何一處，發送你的寂靜波紋。點亮波紋內的同行者。
          </Text>

          {/* Compact Auxiliary Bar: Audio Mixer + 4-7-8 Breathing + SOS */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setMixerOpen(true);
              }}
              style={styles.auxBtn}
            >
              <Text style={styles.auxBtnText}>
                {isMuted ? '🔇 混音' : '🎚️ 白噪音'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setBreathingOpen(true);
              }}
              style={styles.auxBtn}
            >
              <Text style={styles.auxBtnText}>🌬️ 4-7-8 呼吸</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                setSosOpen(true);
              }}
              style={[styles.sosBtn, isUserSos && styles.sosBtnActive]}
            >
              <Text style={styles.sosBtnText}>🆘 求助 SOS</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Phrase Capsule Modal (on map tap) */}
      <PhraseCapsuleModal
        visible={Boolean(pendingTap)}
        customPhrase={customPhrase}
        onClose={() => setPendingTap(null)}
        onSendWave={handleSendWave}
        onTriggerCrisisHelp={() => setSosOpen(true)}
      />

      {/* SOS Modal */}
      <SosModal
        visible={sosOpen}
        onClose={() => setSosOpen(false)}
        onSendSos={handleSendSos}
      />

      {/* White Noise Mixer Modal (Auxiliary) */}
      <AudioMixerModal
        visible={mixerOpen}
        onClose={() => setMixerOpen(false)}
        mix={audioMix}
        isMuted={isMuted}
        accentColor={COLORS.lime}
        onChangeTrackVolume={onChangeTrackVolume}
        onToggleMute={onToggleMute}
        onResetPreset={onResetPreset}
      />

      {/* 4-7-8 Haptic Breathing Overlay Modal (Auxiliary) */}
      <Modal
        visible={breathingOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setBreathingOpen(false)}
      >
        <Pressable
          style={styles.breathBackdrop}
          onPress={() => setBreathingOpen(false)}
        >
          <Pressable style={styles.breathCard} onPress={() => {}}>
            <Text style={styles.breathTitle}>4-7-8 閉眼震動呼吸</Text>
            <Text style={styles.breathSub}>
              背景音場：{scene.title}（{scene.location}）
            </Text>
            <View style={{ marginVertical: 14 }}>
              <BreathingGuide accentColor={COLORS.lime} active={breathingOpen} />
            </View>
            <View style={styles.presetRow}>
              {SANCTUARY_SCENES.slice(0, 2).map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    onSelectScene(s.id);
                  }}
                  style={[
                    styles.presetChip,
                    s.id === scene.id && styles.presetChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      s.id === scene.id && { color: COLORS.lime },
                    ]}
                  >
                    {s.title}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={() => setBreathingOpen(false)}
              style={styles.closeBreathBtn}
            >
              <Text style={styles.closeBreathText}>返回共鳴地圖</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  glassPill: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(5, 5, 5, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  limeBorder: {
    borderColor: COLORS.limeBorder,
  },
  pillText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  limePillText: {
    fontSize: 12,
    color: COLORS.lime,
    fontWeight: '600',
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(5, 5, 5, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  timerPill: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(5, 5, 5, 0.80)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 8,
    color: 'rgba(222, 255, 154, 0.7)',
    letterSpacing: 1.5,
  },
  timerValue: {
    fontSize: 16,
    color: COLORS.lime,
    fontWeight: '400',
    letterSpacing: 1.5,
    fontVariant: ['tabular-nums'],
  },
  bottomCard: {
    backgroundColor: 'rgba(5, 5, 5, 0.82)',
    borderRadius: 24,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    gap: 10,
  },
  bottomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  kicker: {
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.lime,
  },
  liveNum: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.lime,
    fontVariant: ['tabular-nums'],
  },
  liveSuffix: {
    fontSize: 10,
    color: 'rgba(222, 255, 154, 0.65)',
  },
  mapHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '300',
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  auxBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
  },
  auxBtnText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  sosBtn: {
    flex: 1.15,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.amberSoft,
    borderWidth: 1,
    borderColor: COLORS.amberBorder,
    alignItems: 'center',
  },
  sosBtnActive: {
    backgroundColor: 'rgba(255, 179, 71, 0.28)',
    borderColor: COLORS.amber,
  },
  sosBtnText: {
    fontSize: 11,
    color: COLORS.amber,
    fontWeight: '700',
  },
  breathBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 5, 0.84)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  breathCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(12, 13, 15, 0.96)',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.limeBorder,
    alignItems: 'center',
  },
  breathTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.lime,
    letterSpacing: 1.2,
  },
  breathSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  presetChipActive: {
    borderColor: COLORS.limeBorder,
    backgroundColor: COLORS.limeSoft,
  },
  presetText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  closeBreathBtn: {
    marginTop: 18,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: COLORS.lime,
    alignItems: 'center',
  },
  closeBreathText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#050505',
  },
});
