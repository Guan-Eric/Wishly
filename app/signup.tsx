import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../firebase';
import { createUserProfile } from '../services/userService';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email.trim(), 
        password
      );
      
      await updateProfile(userCredential.user, { displayName: name.trim() });
      
      // Create user profile in Firestore
      await createUserProfile(
        userCredential.user.uid,
        email.trim(),
        name.trim()
      );

      Alert.alert(
        '🎉 Welcome!', 
        'Your account has been created successfully!',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/(group)/group') }]
      );
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Email Taken', 'This email is already registered. Please login instead.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else {
        Alert.alert('Signup Failed', 'Failed to create account. Please try again.');
      }
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
                <Text className="text-6xl">🎄</Text>
              </View>
              <Text className="text-4xl font-bold text-stone-900 mb-2">
                Create Account
              </Text>
              <Text className="text-base text-stone-600">
                Join the festive gift exchange
              </Text>
            </View>

            {/* Input Fields */}
            <View className="mb-6">
              <Text className="text-stone-700 font-bold text-sm mb-3 ml-1 uppercase tracking-wider">
                Full Name
              </Text>
              <View className="bg-white border-2 border-stone-200 rounded-xl px-5 py-4 flex-row items-center mb-5">
                <Ionicons name="person-outline" size={22} color="#78716C" />
                <TextInput
                  placeholder="Your name"
                  placeholderTextColor="#A8A29E"
                  value={name}
                  onChangeText={setName}
                  className="flex-1 text-stone-900 text-base ml-3"
                />
              </View>

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
                  placeholder="At least 6 characters"
                  placeholderTextColor="#A8A29E"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  className="flex-1 text-stone-900 text-base ml-3"
                />
              </View>
              <Text className="text-stone-500 text-xs mt-2 ml-1">
                Password must be at least 6 characters long
              </Text>
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              onPress={handleSignup}
              disabled={loading}
              className="py-5 rounded-xl items-center mb-4 active:scale-95"
              style={{ backgroundColor: '#059669' }}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text className="text-white font-bold text-lg ml-2">
                    Create Account
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Terms Notice */}
            <View className="bg-stone-100 rounded-xl p-4 mb-4">
              <Text className="text-stone-600 text-xs text-center">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>

            {/* Login Link */}
            <TouchableOpacity 
              onPress={() => router.push("/login")}
              className="py-4"
            >
              <Text className="text-stone-700 text-center text-base">
                Already have an account?{' '}
                <Text className="font-bold text-emerald-700">
                  Sign in
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Festive Footer */}
            <View className="items-center mt-8">
              <Text className="text-stone-400 text-sm">🎁 ⭐ 🎅 ❄️ 🔔 🎁</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}