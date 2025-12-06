import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingStep1() {
  const router = useRouter();

  return (
    <View className="flex-1" style={{ backgroundColor: '#F5F3FF' }}>
      <SafeAreaView className="flex-1">
        <View className="absolute right-6 top-16 z-10">
          <TouchableOpacity
            onPress={() => router.replace('/login')}
            className="rounded-full bg-white/80 px-5 py-2">
            <Text className="font-semibold text-stone-600">Skip</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-8 rounded-2xl p-4" style={{ backgroundColor: '#8B5CF6' }}>
            <Ionicons name="gift" size={40} color="#fff" />
          </View>

          <View className="items-center">
            <Text className="mb-3 text-center text-4xl font-bold text-stone-900">
              Create Wishlists
            </Text>

            <Text className="mb-6 text-center text-xl font-semibold" style={{ color: '#8B5CF6' }}>
              For Every Occasion
            </Text>

            <Text className="px-4 text-center text-lg leading-relaxed text-stone-700">
              Birthdays, holidays, anniversaries — organize all your gift wishes in one place
            </Text>
          </View>
        </View>

        <View className="px-6 pb-8">
          <View className="mb-8 flex-row justify-center gap-2">
            <View className="h-2 w-8 rounded-full" style={{ backgroundColor: '#8B5CF6' }} />
            <View className="h-2 w-2 rounded-full bg-stone-300" />
            <View className="h-2 w-2 rounded-full bg-stone-300" />
          </View>

          <TouchableOpacity
            onPress={() => router.push('/step2')}
            className="items-center rounded-xl py-5 active:scale-95"
            activeOpacity={0.8}
            style={{ backgroundColor: '#8B5CF6' }}>
            <View className="flex-row items-center">
              <Text className="mr-2 text-xl font-bold text-white">Next</Text>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
