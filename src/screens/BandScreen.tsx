import React from 'react';
import { View, Linking, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { Typography, Icon, Button } from '../components/atoms';
import { ScreenLayout, Header } from '../components/organisms';

const GUARDIAN_WEBSITE = 'https://gw-fesq.onrender.com/';

export const BandScreen: React.FC = () => {
  const { theme } = useTheme();

  const handleGetGuardian = () => {
    Linking.openURL(GUARDIAN_WEBSITE);
  };

  return (
    <ScreenLayout
      header={<Header title="My Device" subtitle="Guardian Watch Sync" />}
    >
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Keychain illustration */}
        <View
          style={{
            width: 130,
            height: 130,
            borderRadius: 65,
            backgroundColor: theme.colors.gold + '18',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            borderWidth: 2,
            borderColor: theme.colors.gold + '40',
          }}
        >
          <Icon name="shield" size={56} color={theme.colors.gold} />
        </View>

        {/* Small decorative dots */}
        <View
          style={{
            flexDirection: 'row',
            gap: 6,
            marginBottom: 24,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.gold + '50' }} />
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.gold }} />
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.gold + '50' }} />
        </View>

        {/* Main heading */}
        <Typography
          variant="h2"
          color="primary"
          style={{ textAlign: 'center', marginBottom: 8, fontWeight: '700' }}
        >
          Get Guardian
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h4"
          color="secondary"
          style={{ textAlign: 'center', marginBottom: 16, fontWeight: '600' }}
        >
          Buy Our Keychain (Hardware)
        </Typography>

        {/* Description */}
        <Typography
          variant="body"
          color="muted"
          style={{ textAlign: 'center', marginBottom: 24, lineHeight: 22, paddingHorizontal: 8 }}
        >
          Upgrade your safety with our Guardian Keychain — a compact hardware device that lets you trigger SOS alerts with a single press, even when your phone is locked.
        </Typography>

        {/* Feature highlights */}
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 20,
            marginBottom: 28,
            width: '100%',
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          {[
            { icon: 'signal', text: 'Bluetooth Low Energy connection' },
            { icon: 'battery-full', text: 'Long-lasting battery life' },
            { icon: 'shield', text: 'Instant one-press physical SOS trigger' },
          ].map((feature, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: index < 2 ? 14 : 0,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: theme.colors.gold + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                <Icon name={feature.icon} size={16} color={theme.colors.gold} />
              </View>
              <Typography variant="body" color="primary" style={{ fontWeight: '500', flex: 1 }}>
                {feature.text}
              </Typography>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <Button
          title="Get Guardian Now"
          onPress={handleGetGuardian}
          size="large"
          style={{ width: '100%', marginBottom: 16 }}
        />

        {/* Website link text */}
        <TouchableOpacity onPress={handleGetGuardian} style={{ padding: 8 }}>
          <Typography
            variant="caption"
            color="muted"
            style={{ textAlign: 'center', textDecorationLine: 'underline' }}
          >
            Visit website: https://gw-fesq.onrender.com/
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
};
