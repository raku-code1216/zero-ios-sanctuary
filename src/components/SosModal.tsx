import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { checkMessageSafety } from '../constants/resonanceData';
import { HK_SUPPORT_HOTLINES } from '../constants/scenes';
import { COLORS } from '../constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSendSos: (message: string) => void;
}

export const SosModal: React.FC<Props> = ({ visible, onClose, onSendSos }) => {
  const [struggle, setStruggle] = useState('');
  const [warning, setWarning] = useState<string | null>(null);

  const handleClose = () => {
    setStruggle('');
    setWarning(null);
    onClose();
  };

  const handleSubmit = () => {
    const trimmed = struggle.trim();
    if (trimmed) {
      const check = checkMessageSafety(trimmed);
      if (!check.ok && !check.isCrisis) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        setWarning(check.warning ?? '請以溫和的方式表達感受。');
        return;
      }
      if (check.isCrisis) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        setWarning(check.warning ?? '請先直接致電下方香港 24 小時免費熱線。');
        return;
      }
    }
    handleClose();
    onSendSos(trimmed);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdropPress} onPress={handleClose}>
          <Pressable style={styles.card} onPress={() => {}}>
            <Text style={styles.title}>尋求協助 · SOS 信標</Text>
            <Text style={styles.desc}>
              當你感到壓力爆煲時，讓避風港知道。你的光點將化為暖橘色，並收到來自世界與 Zero 守夜人的溫暖回應。
            </Text>

            <TextInput
              value={struggle}
              onChangeText={(t) => {
                setStruggle(t);
                if (warning) setWarning(null);
              }}
              placeholder="你正在經歷什麼？（選填，限 60 字）"
              placeholderTextColor={COLORS.textMuted}
              maxLength={60}
              style={styles.input}
            />
            {warning && <Text style={styles.warningText}>{warning}</Text>}

            <Pressable onPress={handleSubmit} style={styles.sosBtn}>
              <Text style={styles.sosBtnText}>發送暖橘求助波紋</Text>
            </Pressable>

            <Pressable onPress={handleClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>取消</Text>
            </Pressable>

            <View style={styles.hotlineBox}>
              <Text style={styles.hotlineKicker}>香港 24 小時緊急專業支援（點擊直撥）</Text>
              {HK_SUPPORT_HOTLINES.slice(0, 2).map((h) => (
                <Pressable
                  key={h.phone}
                  onPress={() => Linking.openURL(`tel:${h.phone}`).catch(() => {})}
                  style={styles.hotlineRow}
                >
                  <Text style={styles.hotlineName}>{h.name}</Text>
                  <Text style={styles.hotlineNum}>{h.displayPhone ?? h.phone}</Text>
                </Pressable>
              ))}
              <Text style={styles.disclaimer}>
                本服務為非醫療性質之放鬆與正向鼓勵空間。
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  backdropPress: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(14, 12, 10, 0.96)',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.amberBorder,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.amber,
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  desc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 71, 0.35)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  warningText: {
    fontSize: 11,
    color: COLORS.danger,
    lineHeight: 17,
  },
  sosBtn: {
    paddingVertical: 13,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 179, 71, 0.22)',
    borderWidth: 1,
    borderColor: COLORS.amber,
    alignItems: 'center',
  },
  sosBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.amber,
    letterSpacing: 1.2,
  },
  cancelBtn: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  hotlineBox: {
    marginTop: 4,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    gap: 8,
  },
  hotlineKicker: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  hotlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  hotlineName: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  hotlineNum: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.amber,
    fontVariant: ['tabular-nums'],
  },
  disclaimer: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
