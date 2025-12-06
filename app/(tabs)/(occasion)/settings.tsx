import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut, updateProfile } from 'firebase/auth';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebase';
import { updateUserProfile } from '../../../services/userService';

export default function SettingsScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const appVersion = '1.0.0';

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Missing Name', 'Please enter your display name');
      return;
    }

    if (!user) return;

    setSaving(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      await updateUserProfile(user.uid, { displayName: displayName.trim() });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await signOut(auth);
            router.replace('/login');
          } catch (error) {
            console.error('Error logging out:', error);
            Alert.alert('Error', 'Failed to logout');
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will remove all your groups, wishlists, and data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Please contact support to delete your account. This ensures all your data is properly removed from our systems.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    const email = 'support@secretsantaapp.com';
    const subject = 'Secret Santa App Support';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    Linking.openURL(url);
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://yourwebsite.com/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://yourwebsite.com/terms');
  };

  return (
    <View className="flex-1 bg-stone-50">
      <SafeAreaView edges={['top']} className="bg-primary">
        <View className="px-4 pb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white">Settings</Text>
              <Text className="text-sm text-white/80">Manage your account</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Profile Section */}
        <View className="mb-4 rounded-2xl border-2 border-stone-200 bg-white p-6">
          <View className="mb-5 flex-row items-center">
            <View className="mr-4 h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Ionicons name="person" size={32} color="#059669" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-stone-900">
                {user?.displayName || 'User'}
              </Text>
              <Text className="text-sm text-stone-600">{user?.email}</Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="mb-2 font-semibold text-stone-700">Display Name</Text>
            <View className="rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3">
              <TextInput
                placeholder="Your name"
                placeholderTextColor="#A8A29E"
                value={displayName}
                onChangeText={setDisplayName}
                className="text-base text-stone-900"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSaveProfile}
            disabled={saving}
            className="bg-primary items-center rounded-xl py-3 active:scale-95"
            activeOpacity={0.8}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text className="ml-2 font-bold text-white">Save Changes</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View className="mb-4 overflow-hidden rounded-2xl border-2 border-stone-200 bg-white">
          <Text className="px-6 pb-3 pt-5 text-sm uppercase tracking-wider text-stone-500">
            Account
          </Text>

          <TouchableOpacity
            onPress={handleLogout}
            disabled={loggingOut}
            className="flex-row items-center justify-between border-t-2 border-stone-100 px-6 py-4 active:bg-stone-50"
            activeOpacity={0.7}>
            <View className="flex-1 flex-row items-center">
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <Text className="ml-4 font-semibold text-stone-900">Logout</Text>
            </View>
            {loggingOut ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#A8A29E" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="flex-row items-center justify-between border-t-2 border-stone-100 px-6 py-4 active:bg-stone-50"
            activeOpacity={0.7}>
            <View className="flex-1 flex-row items-center">
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
              <Text className="ml-4 font-semibold text-red-600">Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A8A29E" />
          </TouchableOpacity>
        </View>

        {/* Support & Legal */}
        {/* <View className="bg-white rounded-2xl mb-4 border-2 border-stone-200 overflow-hidden">
          <Text className="text-sm text-stone-500 uppercase tracking-wider px-6 pt-5 pb-3">
            Support & Legal
          </Text>

          <TouchableOpacity
            onPress={handleContactSupport}
            className="px-6 py-4 flex-row items-center justify-between border-t-2 border-stone-100 active:bg-stone-50"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <Ionicons name="help-circle-outline" size={24} color="#78716C" />
              <Text className="text-stone-900 font-semibold ml-4">Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A8A29E" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePrivacyPolicy}
            className="px-6 py-4 flex-row items-center justify-between border-t-2 border-stone-100 active:bg-stone-50"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <Ionicons name="shield-checkmark-outline" size={24} color="#78716C" />
              <Text className="text-stone-900 font-semibold ml-4">Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A8A29E" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleTermsOfService}
            className="px-6 py-4 flex-row items-center justify-between border-t-2 border-stone-100 active:bg-stone-50"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <Ionicons name="document-text-outline" size={24} color="#78716C" />
              <Text className="text-stone-900 font-semibold ml-4">Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A8A29E" />
          </TouchableOpacity>
        </View> */}

        {/* App Info */}
        <View className="mb-4 rounded-2xl border-2 border-stone-200 bg-white p-6">
          <Text className="mb-3 text-sm uppercase tracking-wider text-stone-500">About</Text>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-stone-700">App Version</Text>
            <Text className="font-semibold text-stone-900">{appVersion}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-stone-700">Made with</Text>
            <Text className="font-semibold text-stone-900">❤️ for the holidays</Text>
          </View>
        </View>

        {/* Affiliate Disclosure */}
        <View className="border-primary-200 bg-primary/10 mb-6 rounded-2xl border-2 p-5">
          <View className="flex-row items-start">
            <Text className="mr-3 text-2xl">🎅</Text>
            <Text className="text-primary-800 flex-1 text-xs">
              This app uses Amazon affiliate links. When you purchase through our links, we earn a
              small commission at no extra cost to you. This helps keep the app free! Thank you for
              your support.
            </Text>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
