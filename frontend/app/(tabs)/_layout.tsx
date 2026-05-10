import { Tabs } from 'expo-router';
import { Home, Dumbbell, Apple, TrendingUp, Settings, User } from 'lucide-react-native';
import { Colors } from '@/constants/Theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { 
          backgroundColor: Colors.background,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTitleAlign: 'center',
        headerTintColor: Colors.text,
        headerTitleStyle: { 
          fontWeight: '900',
          fontSize: 18,
          letterSpacing: -0.5,
        },
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 10,
          borderTopWidth: 1.5,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Training',
          tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="diet"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, size }) => <Apple color={color} size={size} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={2.5} />,
        }}
      />
    </Tabs>
  );
}
