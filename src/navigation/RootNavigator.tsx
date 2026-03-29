import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions, useNavigation } from '@react-navigation/native';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import LogTimeScreen from '../screens/LogTimeScreen';
import SummaryScreen from '../screens/SummaryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomTabBar from './CustomTabBar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="LogTime" component={LogTimeScreen} options={{ tabBarLabel: 'Log Time' }} />
      <Tab.Screen name="Summary" component={SummaryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function OnboardingWrapper() {
  const navigation = useNavigation();

  const goToMain = () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] })
    );
  };

  return <OnboardingScreen onClockIn={goToMain} onSkip={goToMain} />;
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Onboarding" component={OnboardingWrapper} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}
