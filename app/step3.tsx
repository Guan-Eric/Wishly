import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingStep3() {
  const router = useRouter();

  return (
    <View className="flex-1" style={{ backgroundColor: '#FEF3C7' }}>
      <SafeAreaView className="flex-1">
        <View className="absolute left-6 top-16 z-10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-12 w-12 items-center justify-center rounded-full bg-white/80">
            <Ionicons name="arrow-back" size={24} color="#57534E" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-8 rounded-2xl p-4" style={{ backgroundColor: '#F59E0B' }}>
            <Ionicons name="cart" size={40} color="#fff" />
          </View>

          <View className="items-center">
            <Text className="mb-3 text-center text-4xl font-bold text-stone-900">
              Buy Through Amazon
            </Text>

            <Text className="mb-6 text-center text-xl font-semibold" style={{ color: '#F59E0B' }}>
              Support Our App
            </Text>

            <Text className="px-4 text-center text-lg leading-relaxed text-stone-700">
              When you shop through our Amazon links, we earn a small commission to keep the app
              free!
            </Text>
          </View>
        </View>

        <View className="px-6 pb-8">
          <View className="mb-8 flex-row justify-center gap-2">
            <View className="h-2 w-2 rounded-full bg-stone-300" />
            <View className="h-2 w-2 rounded-full bg-stone-300" />
            <View className="h-2 w-8 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
          </View>

          <TouchableOpacity
            onPress={() => router.replace('/signup')}
            className="items-center rounded-xl py-5 active:scale-95"
            activeOpacity={0.8}
            style={{ backgroundColor: '#F59E0B' }}>
            <View className="flex-row items-center">
              <Text className="mr-2 text-xl font-bold text-white">Get Started</Text>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
