import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ResonanceToast } from '../constants/resonanceData';
import { COLORS } from '../constants/theme';

interface Props {
  toasts: ResonanceToast[];
  topOffset: number;
  onReportToast: (toast: ResonanceToast) => void;
  onBlockAuthor: (toast: ResonanceToast) => void;
  onDismiss: (id: string) => void;
}

export const ToastOverlay: React.FC<Props> = ({
  toasts,
  topOffset,
  onReportToast,
  onBlockAuthor,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <View pointerEvents="box-none" style={[styles.container, { top: topOffset }]}>
      {toasts.slice(0, 2).map((toast) => {
        const borderColor =
          toast.variant === 'sos'
            ? COLORS.amberBorder
            : toast.variant === 'lime'
            ? COLORS.limeBorder
            : COLORS.glassBorder;
        const titleColor =
          toast.variant === 'sos'
            ? COLORS.amber
            : toast.variant === 'lime'
            ? COLORS.lime
            : COLORS.textSecondary;

        return (
          <View key={toast.id} style={[styles.toastCard, { borderColor }]}>
            <View style={styles.row}>
              <Text style={styles.icon}>{toast.icon}</Text>
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
                    {toast.title}
                  </Text>
                  <Pressable onPress={() => onDismiss(toast.id)} hitSlop={8}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </Pressable>
                </View>
                <Text style={styles.text}>{toast.text}</Text>
                {toast.translation ? (
                  <Text style={styles.trans}>{toast.translation}</Text>
                ) : null}

                {toast.canModerate && (
                  <View style={styles.modRow}>
                    <Pressable
                      onPress={() => onReportToast(toast)}
                      style={styles.modChip}
                    >
                      <Text style={styles.modChipText}>🚩 舉報</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => onBlockAuthor(toast)}
                      style={styles.modChip}
                    >
                      <Text style={styles.modChipText}>🚫 封鎖作者</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 40,
    gap: 8,
    alignItems: 'center',
  },
  toastCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(5, 5, 5, 0.88)',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  icon: {
    fontSize: 20,
    marginTop: 2,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    flex: 1,
  },
  closeBtn: {
    fontSize: 12,
    color: COLORS.textMuted,
    paddingLeft: 8,
  },
  text: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 19,
    fontWeight: '300',
  },
  trans: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  modRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  modChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  modChipText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
});
