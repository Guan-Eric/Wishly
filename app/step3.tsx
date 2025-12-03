// app/onboarding/step3.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingStep3() {
  const router = useRouter();

  return (
    <View className="flex-1" style={{ backgroundColor: '#FFFBEB' }}>
      <SafeAreaView className="flex-1">
        {/* Back Button */}
        <View className="absolute top-16 left-6 z-10">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-12 h-12 bg-white/80 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#57534E" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 justify-center items-center px-8">
          {/* Icon Badge */}
          <View 
            className="rounded-2xl p-4 mb-8"
            style={{ backgroundColor: '#F59E0B' }}
          >
            <Ionicons name="cart" size={40} color="#fff" />
          </View>

          {/* Text Content */}
          <View className="items-center">
            <Text className="text-4xl font-bold text-stone-900 text-center mb-3">
              Buy the Perfect Gift
            </Text>
            
            <Text 
              className="text-xl font-semibold text-center mb-6"
              style={{ color: '#F59E0B' }}
            >
              Support Our App
            </Text>
            
            <Text className="text-lg text-stone-700 text-center leading-relaxed px-4">
              View your match's wishlist and shop on Amazon. We earn a small commission to keep the app free!
            </Text>
          </View>
        </View>

        {/* Bottom Controls */}
        <View className="px-6 pb-8">
          {/* Dots Indicator */}
          <View className="flex-row justify-center gap-2 mb-8">
            <View className="h-2 w-2 rounded-full bg-stone-300" />
            <View className="h-2 w-2 rounded-full bg-stone-300" />
            <View className="h-2 w-8 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            onPress={() => router.replace('/signup')}
            className="py-5 rounded-xl items-center active:scale-95"
            activeOpacity={0.8}
            style={{ backgroundColor: '#F59E0B' }}
          >
            <View className="flex-row items-center">
              <Text className="text-white font-bold text-xl mr-2">
                Get Started
              </Text>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}