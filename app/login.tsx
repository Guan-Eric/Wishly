import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)/(group)/group');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-stone-50">
      <SafeAreaView edges={['top']} className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView 
            className="flex-1 px-6"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View className="items-center mb-12">
              <View className="w-24 h-24 bg-emerald-100 rounded-full items-center justify-center mb-6">
                <Text className="text-6xl">🎅</Text>
              </View>
              <Text className="text-4xl font-bold text-stone-900 mb-2">
                Welcome Back
              </Text>
              <Text className="text-base text-stone-600">
                Sign in to continue your Secret Santa
              </Text>
            </View>

            {/* Input Fields */}
            <View className="mb-6">
              <Text className="text-stone-700 font-bold text-sm mb-3 ml-1 uppercase tracking-wider">
                Email
              </Text>
              <View className="bg-white border-2 border-stone-200 rounded-xl px-5 py-4 flex-row items-center mb-5">
                <Ionicons name="mail-outline" size={22} color="#78716C" />
                <TextInput
                  placeholder="email@example.com"
                  placeholderTextColor="#A8A29E"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  className="flex-1 text-stone-900 text-base ml-3"
                />
              </View>

              <Text className="text-stone-700 font-bold text-sm mb-3 ml-1 uppercase tracking-wider">
                Password
              </Text>
              <View className="bg-white border-2 border-stone-200 rounded-xl px-5 py-4 flex-row items-center">
                <Ionicons name="lock-closed-outline" size={22} color="#78716C" />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#A8A29E"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  className="flex-1 text-stone-900 text-base ml-3"
                />
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="py-5 rounded-xl items-center mb-4 active:scale-95"
              style={{ backgroundColor: '#059669' }}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="log-in-outline" size={20} color="#fff" />
                  <Text className="text-white font-bold text-lg ml-2">
                    Sign In
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-stone-300" />
              <Text className="text-stone-500 px-4 text-sm">or</Text>
              <View className="flex-1 h-px bg-stone-300" />
            </View>

            {/* Sign Up Link */}
            <TouchableOpacity 
              onPress={() => router.push('/signup')}
              className="bg-stone-100 py-5 rounded-xl items-center active:scale-95"
              activeOpacity={0.8}
            >
              <Text className="text-stone-900 font-bold text-lg">
                Create New Account
              </Text>
            </TouchableOpacity>

            {/* Festive Footer */}
            <View className="items-center mt-8">
              <Text className="text-stone-400 text-sm">🎄 ⛄ 🎁 ⭐ 🔔 🎄</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}