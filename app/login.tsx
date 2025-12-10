import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
      router.replace('/(tabs)/(occasion)/occasion');
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
          className="flex-1">
          <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View className="mb-12 items-center">
              <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
                <Text className="text-6xl">💝</Text>
              </View>
              <Text className="mb-2 text-4xl font-bold text-stone-900">Welcome Back</Text>
              <Text className="text-base text-stone-600">Continue your festive gift exchange</Text>
            </View>

            {/* Input Fields */}
            <View className="mb-6">
              <Text className="mb-3 ml-1 text-sm font-bold uppercase tracking-wider text-stone-700">
                Email
              </Text>
              <View className="mb-5 flex-row items-center rounded-xl border-2 border-stone-200 bg-white px-5 py-4">
                <Ionicons name="mail-outline" size={22} color="#78716C" />
                <TextInput
                  placeholder="email@example.com"
                  placeholderTextColor="#A8A29E"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  className="ml-3 flex-1 text-base text-stone-900"
                />
              </View>

              <Text className="mb-3 ml-1 text-sm font-bold uppercase tracking-wider text-stone-700">
                Password
              </Text>
              <View className="flex-row items-center rounded-xl border-2 border-stone-200 bg-white px-5 py-4">
                <Ionicons name="lock-closed-outline" size={22} color="#78716C" />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#A8A29E"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  className="ml-3 flex-1 text-base text-stone-900"
                />
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="mb-4 items-center rounded-xl py-5 active:scale-95"
              style={{ backgroundColor: '#059669' }}
              activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="log-in-outline" size={20} color="#fff" />
                  <Text className="ml-2 text-lg font-bold text-white">Sign In</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Terms Notice */}
            <View className="mb-4 rounded-xl bg-stone-100 p-4">
              <Text className="text-center text-xs text-stone-600">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>

            {/* Signup Link */}
            <TouchableOpacity onPress={() => router.push('/signup')} className="py-4">
              <Text className="text-center text-base text-stone-700">
                Don’t have an account?{' '}
                <Text className="text-primary-700 font-bold">Create one</Text>
              </Text>
            </TouchableOpacity>

            {/* Festive Footer */}
            <View className="mt-8 items-center">
              <Text className="text-sm text-stone-400">💝 ✨ 🎁 💐 🎂 💍</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
