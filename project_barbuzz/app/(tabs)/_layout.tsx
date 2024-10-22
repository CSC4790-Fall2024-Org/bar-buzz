// TabLayout.tsx
import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import SettingsModal from '@/components/SettingsModal'; // Adjust path as necessary

const TabLayout: React.FC = () => {
  const colorScheme = useColorScheme();
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState<boolean>(false);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'location' : 'location-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Bars',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'pint' : 'pint-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="new"
          options={{
            title: 'Personal Stats',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Settings Icon */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 10, right: 10 }}
        onPress={() => setIsSettingsModalVisible(true)}
      >
        <TabBarIcon name="settings" color={Colors[colorScheme ?? 'light'].tint} />
      </TouchableOpacity>

      {/* Settings Modal */}
      <SettingsModal
        visible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
      />
    </View>
  );
};

export default TabLayout;
