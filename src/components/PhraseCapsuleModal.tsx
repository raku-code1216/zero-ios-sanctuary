import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  checkMessageSafety,
  DEFAULT_PHRASES,
} from '../constants/resonanceData';
import { COLORS } from '../constants/theme';

interface Props {
  visible: boolean;
  customPhrase: string | null;
  onClose: () => void;
  onSendWave: (message: string, isCustom: boolean) => void;
  onTriggerCrisisHelp: () => void;
}

export const PhraseCapsuleModal: React.FC<Props> = ({
  visible,
  customPhrase,
  onClose,
  onSendWave,
  onTriggerCrisisHelp,
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [draft, setDraft] = useState('');
  const [warning, setWarning] = useState<string | null>(null);

  const resetAndClose = () => {
    setShowCustom(false);
    setDraft('');
    setWarning(null);
    onClose();
  };

  const handleCustomSubmit = () => {
    const check = checkMessageSafety(draft);
    if (!check.ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setWarning(check.warning ?? '請輸入溫柔的共鳴短語。');
      if (check.isCrisis) {
        resetAndClose();
        onTriggerCrisisHelp();
      }
      return;
    }
    const text = draft.trim();
    resetAndClose();
    onSendWave(text, true);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={resetAndClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdropPress} onPress={resetAndClose}>
          <Pressable style={styles.capsule} onPress={() => {}}>
            <Text style={styles.kicker}>發送一圈寂靜共鳴</Text>

            {!showCustom ? (
              <View style={styles.list}>
                {customPhrase && (
                  <Pressable
                    onPress={() => {
                      resetAndClose();
                      onSendWave(customPhrase, false);
                    }}
                    style={[styles.phraseBtn, styles.customSavedBtn]}
                  >
                    <Text style={styles.customSavedText} numberOfLines={1}>
                      {customPhrase}
                    </Text>
                    <View style={styles.customTag}>
                      <Text style={styles.customTagText}>✨ 專屬</Text>
                    </View>
                  </Pressable>
                )}

                {DEFAULT_PHRASES.map((phrase) => (
                  <Pressable
                    key={phrase}
                    onPress={() => {
                      resetAndClose();
                      onSendWave(phrase, false);
                    }}
                    style={styles.phraseBtn}
                  >
                    <Text style={styles.phraseText}>{phrase}</Text>
                  </Pressable>
                ))}

                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setShowCustom(true);
                    setWarning(null);
                  }}
                  style={styles.writeOwnBtn}
                >
                  <Text style={styles.writeOwnText}>或自己寫下一句共鳴...</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.customArea}>
                <TextInput
                  value={draft}
                  onChangeText={(t) => {
                    setDraft(t);
                    if (warning) setWarning(null);
                  }}
                  placeholder="寫一句溫柔的鼓勵（限 50 字）..."
                  placeholderTextColor={COLORS.textMuted}
                  maxLength={50}
                  autoFocus
                  style={styles.input}
                />
                {warning && <Text style={styles.warningText}>{warning}</Text>}
                <View style={styles.btnRow}>
                  <Pressable
                    onPress={() => {
                      setShowCustom(false);
                      setWarning(null);
                    }}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelText}>返回</Text>
                  </Pressable>
                  <Pressable onPress={handleCustomSubmit} style={styles.sendBtn}>
                    <Text style={styles.sendText}>發射波紋</Text>
                  </Pressable>
                </View>
              </View>
            )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  capsule: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(12, 13, 15, 0.94)',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.limeBorder,
    shadowColor: '#000',
    shadowOpacity: 0.65,
    shadowRadius: 24,
  },
  kicker: {
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 14,
  },
  list: {
    gap: 9,
  },
  phraseBtn: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  customSavedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.limeSoft,
    borderColor: COLORS.limeBorder,
  },
  customSavedText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.lime,
    marginRight: 8,
  },
  customTag: {
    backgroundColor: COLORS.lime,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  customTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#050505',
  },
  phraseText: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  writeOwnBtn: {
    marginTop: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  writeOwnText: {
    fontSize: 12,
    color: COLORS.lime,
    textDecorationLine: 'underline',
    letterSpacing: 0.8,
  },
  customArea: {
    gap: 10,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  warningText: {
    fontSize: 11,
    color: COLORS.amber,
    lineHeight: 17,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sendBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: COLORS.lime,
    alignItems: 'center',
  },
  sendText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#050505',
    letterSpacing: 1,
  },
});
