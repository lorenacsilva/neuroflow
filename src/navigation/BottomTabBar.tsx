import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, CalendarCheck, Layers, Users, MessageCircle } from 'lucide-react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeProvider';

const ICONS: Record<string, any> = {
  HomeTab: Home,
  RotinaTab: CalendarCheck,
  FasesTab: Layers,
  ComunidadeTab: Users,
  IATab: MessageCircle,
};

const LABELS: Record<string, string> = {
  HomeTab: 'Home',
  RotinaTab: 'Rotina',
  FasesTab: 'Fases',
  ComunidadeTab: 'Comunidade',
  IATab: 'IA / SOS',
};

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: Math.max(insets.bottom, 14),
        backgroundColor: palette.bg + 'F5',
        borderTopWidth: 1,
        borderTopColor: palette.divider,
      }}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const Icon = ICONS[route.name] ?? Home;
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={{ width: 66, alignItems: 'center', gap: 4 }}
          >
            <Icon size={21} color={focused ? palette.tabActive : palette.tabInactive} strokeWidth={1.9} />
            <Text
              style={{
                fontFamily: focused ? 'Lexend_500Medium' : 'Lexend_400Regular',
                fontSize: 9.5,
                color: focused ? palette.tabActive : palette.tabInactive,
              }}
            >
              {LABELS[route.name]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
