// app/onboarding/step1.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingStep1() {
  const router = useRouter();

  return (
    <View className="flex-1" style={{ backgroundColor: '#ECFDF5' }}>
      <SafeAreaView className="flex-1">
        {/* Skip Button */}
        <View className="absolute top-16 right-6 z-10">
          <TouchableOpacity 
            onPress={() => router.replace('/login')}
            className="bg-white/80 px-5 py-2 rounded-full"
          >
            <Text className="text-stone-600 font-semibold">Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 justify-center items-center px-8">
                    {/* Icon Badge */}
          <View 
            className="rounded-2xl p-4 mb-8"
            style={{ backgroundColor: '#059669' }}
          >
            <Ionicons name="gift" size={40} color="#fff" />
          </View>

          {/* Text Content */}
          <View className="items-center">
            <Text className="text-4xl font-bold text-stone-900 text-center mb-3">
              Organize Secret Santa
            </Text>
            
            <Text 
              className="text-xl font-semibold text-center mb-6"
              style={{ color: '#059669' }}
            >
              Gift Exchanges Made Simple
            </Text>
            
            <Text className="text-lg text-stone-700 text-center leading-relaxed px-4">
              Create groups and get matched anonymously with friends, family, or coworkers
            </Text>
          </View>
        </View>

        {/* Bottom Controls */}
        <View className="px-6 pb-8">
          {/* Dots Indicator */}
          <View className="flex-row justify-center gap-2 mb-8">
            <View className="h-2 w-8 rounded-full" style={{ backgroundColor: '#059669' }} />
            <View className="h-2 w-2 rounded-full bg-stone-300" />
            <View className="h-2 w-2 rounded-full bg-stone-300" />
          </View>

          {/* Next Button */}
          <TouchableOpacity
            onPress={() => router.push('/step2')}
            className="py-5 rounded-xl items-center active:scale-95"
            activeOpacity={0.8}
            style={{ backgroundColor: '#059669' }}
          >
            <View className="flex-row items-center">
              <Text className="text-white font-bold text-xl mr-2">
                Next
              </Text>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
