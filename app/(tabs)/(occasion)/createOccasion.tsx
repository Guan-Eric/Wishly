// app/(tabs)/(occasion)/createOccasion.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebase';
import { createOccasion } from '../../../services/occasionService';

const OCCASION_TYPES = [
  { value: 'birthday', label: 'Birthday', emoji: '🎂', color: '#EC4899' },
  { value: 'valentine', label: "Valentine's", emoji: '💝', color: '#EF4444' },
  { value: 'anniversary', label: 'Anniversary', emoji: '💐', color: '#8B5CF6' },
  { value: 'christmas', label: 'Christmas', emoji: '🎄', color: '#10B981' },
  { value: 'wedding', label: 'Wedding', emoji: '💍', color: '#F59E0B' },
  { value: 'other', label: 'Other', emoji: '🎁', color: '#6366F1' },
];

export default function CreateOccasionScreen() {
  const [occasionName, setOccasionName] = useState('');
  const [budget, setBudget] = useState('');
  const [date, setDate] = useState('');
  const [occasionType, setOccasionType] = useState<
    'birthday' | 'valentine' | 'anniversary' | 'christmas' | 'wedding' | 'other'
  >('birthday');
  const [emails, setEmails] = useState(['']);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const removeEmail = (index: number) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
  };

  const handleCreateOccasion = async () => {
    if (!occasionName.trim()) {
      Alert.alert('Missing Name', 'Please enter an occasion name! 🎁');
      return;
    }

    try {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Not authenticated');

      const validEmails = emails.map((e) => e.trim()).filter((e) => e !== '');

      const occasionData = {
        name: occasionName.trim(),
        budget: budget.trim() ? Number(budget) : null,
        date: date.trim() || null,
        type: occasionType,
        createdBy: userId,
        memberEmails: validEmails,
        creatorName: auth.currentUser?.displayName || 'You',
      };

      await createOccasion(occasionData);

      Alert.alert('🎉 Success!', 'Your wishlist has been created!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error creating occasion:', error);
      Alert.alert('Error', 'Failed to create occasion. Please try again.', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
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
              <Text className="text-3xl font-bold text-white">Create Wishlist</Text>
              <Text className="text-sm text-white/80">For any special occasion 🎁</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Occasion Name */}
        <View className="mb-6">
          <Text className="mb-3 ml-1 text-sm font-bold uppercase tracking-wider text-stone-700">
            Occasion Name *
          </Text>
          <View className="rounded-2xl border-2 border-stone-200 bg-white px-5 py-4">
            <TextInput
              placeholder="e.g., Mom's Birthday 2025"
              placeholderTextColor="#A8A29E"
              value={occasionName}
              onChangeText={setOccasionName}
              className="text-lg text-stone-900"
            />
          </View>
        </View>

        {/* Occasion Type */}
        <View className="mb-6">
          <Text className="mb-3 ml-1 text-sm font-bold uppercase tracking-wider text-stone-700">
            Occasion Type *
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-4 flex-row px-4">
            {OCCASION_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                onPress={() =>
                  setOccasionType(
                    type.value as
                      | 'birthday'
                      | 'valentine'
                      | 'anniversary'
                      | 'christmas'
                      | 'wedding'
                      | 'other'
                  )
                }
                className={`mr-3 rounded-2xl border-2 px-6 py-4 ${
                  occasionType === type.value
                    ? 'border-primary bg-primary/10'
                    : 'border-stone-200 bg-white'
                }`}>
                <Text className="mb-1 text-center text-3xl">{type.emoji}</Text>
                <Text
                  className={`text-center font-bold ${
                    occasionType === type.value ? 'text-primary' : 'text-stone-600'
                  }`}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Budget */}
        <View className="mb-6">
          <Text className="mb-3 ml-1 text-sm font-bold uppercase tracking-wider text-stone-700">
            Budget (Optional)
          </Text>
          <View className="flex-row items-center rounded-2xl border-2 border-stone-200 bg-white px-5 py-4">
            <Text className="mr-2 text-xl font-bold text-stone-900">$</Text>
            <TextInput
              placeholder="e.g., 100"
              placeholderTextColor="#A8A29E"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              className="flex-1 text-lg text-stone-900"
            />
          </View>
          <Text className="ml-1 mt-2 text-xs text-stone-500">Set a spending limit for gifts</Text>
        </View>

        {/* Date */}
        <View className="mb-6">
          <Text className="mb-3 ml-1 text-sm font-bold uppercase tracking-wider text-stone-700">
            Date (Optional)
          </Text>
          <View className="rounded-2xl border-2 border-stone-200 bg-white px-5 py-4">
            <TextInput
              placeholder="e.g., March 15, 2025"
              placeholderTextColor="#A8A29E"
              value={date}
              onChangeText={setDate}
              className="text-lg text-stone-900"
            />
          </View>
          <Text className="ml-1 mt-2 text-xs text-stone-500">When is this occasion?</Text>
        </View>

        {/* Email Invitations */}
        <View className="mb-6">
          <Text className="mb-3 ml-1 text-sm font-bold uppercase tracking-wider text-stone-700">
            Share With (Optional)
          </Text>
          <Text className="mb-3 ml-1 text-xs text-stone-500">
            Add email addresses of people you want to share your wishlist with
          </Text>
          {emails.map((email, index) => (
            <View key={index} className="mb-3 flex-row items-center">
              <View className="flex-1 rounded-2xl border-2 border-stone-200 bg-white px-5 py-4">
                <TextInput
                  placeholder="email@example.com"
                  placeholderTextColor="#A8A29E"
                  value={email}
                  onChangeText={(value) => updateEmail(index, value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="text-lg text-stone-900"
                />
              </View>
              {emails.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeEmail(index)}
                  className="ml-3 h-12 w-12 items-center justify-center rounded-xl border-2 border-red-200 bg-red-50 active:scale-95"
                  activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity
            onPress={addEmailField}
            className="items-center rounded-2xl border-2 border-dashed border-stone-300 bg-white py-4 active:scale-95"
            activeOpacity={0.7}>
            <View className="flex-row items-center">
              <Ionicons name="add-circle-outline" size={20} color="#78716C" />
              <Text className="ml-2 font-bold text-stone-600">Add Another Email</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View className="mb-6 rounded-2xl border-2 border-primary/20 bg-primary/10 p-5">
          <View className="flex-row items-start">
            <Text className="mr-3 text-2xl">💡</Text>
            <View className="flex-1">
              <Text className="mb-1 font-bold text-primary-dark">How it works:</Text>
              <Text className="text-sm text-primary-dark/80">
                Share your wishlist with friends and family so they know exactly what to get you!
                You can add people now or invite them later.
              </Text>
            </View>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          onPress={handleCreateOccasion}
          disabled={loading}
          className="mb-8 items-center rounded-2xl bg-primary py-5 active:scale-95"
          activeOpacity={0.8}>
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="#fff" />
              <Text className="ml-3 text-xl font-bold text-white">Creating...</Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="gift" size={24} color="#fff" />
              <Text className="ml-3 text-xl font-bold text-white">Create Wishlist</Text>
            </View>
          )}
        </TouchableOpacity>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
