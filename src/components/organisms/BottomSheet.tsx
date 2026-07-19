import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import { Typography } from '../atoms/Typography';
import { IconButton } from '../atoms/IconButton';

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isVisible,
  onClose,
  title,
  children,
}) => {
  const { theme } = useTheme();

  const styles = {
    overlay: {
      flex: 1,
      justifyContent: 'flex-end' as const,
      zIndex: theme.zIndex.overlay,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    content: {
      borderTopLeftRadius: theme.card.radius + 8,
      borderTopRightRadius: theme.card.radius + 8,
      paddingHorizontal: theme.layout.sectionGap,
      paddingBottom: theme.layout.fabBottom + 16,
      elevation: 16,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
    },
    handleWrapper: {
      alignItems: 'center' as const,
      paddingVertical: theme.spacing.sm + 4,
    },
    grabHandle: {
      width: 38,
      height: 5,
      borderRadius: 3,
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: theme.layout.cardGap,
    },
    body: {
      width: '100%' as const,
    },
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          {/* Top Grab Handle */}
          <View style={styles.handleWrapper}>
            <View style={[styles.grabHandle, { backgroundColor: theme.colors.border }]} />
          </View>

          {/* Optional Title Header */}
          {title && (
            <View style={styles.header}>
              <Typography variant="h3" color="primary" weight="600">
                {title}
              </Typography>
              <IconButton 
                icon="close" 
                onPress={onClose} 
                size="medium"
              />
            </View>
          )}

          {/* Children Content Slot */}
          <View style={styles.body}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
};
