// app/(tabs)/(wishlist)/wishlist.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebase';
import { subscribeToUserOccasions } from '../../../services/occasionService';
import { deleteWishlistItem, subscribeToWishlistItems } from '../../../services/wishlistService';
import { Occasion, WishlistItem } from '../../../types/index';

export default function WishlistScreen() {
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();
  const userId = auth.currentUser?.uid;

  // Load user's occasions
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToUserOccasions(userId, (occasionsData) => {
      setOccasions(occasionsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  // Load wishlist items for selected occasion
  useEffect(() => {
    if (!userId || !selectedOccasion) {
      setWishlistItems([]);
      return;
    }

    const unsubscribe = subscribeToWishlistItems(userId, selectedOccasion, (items) => {
      setWishlistItems(items);
    });

    return unsubscribe;
  }, [userId, selectedOccasion]);

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    Alert.alert('Remove Item', `Remove "${itemName}" from your wishlist?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setDeleting(itemId);
          try {
            await deleteWishlistItem(itemId);
          } catch (error) {
            console.error('Error deleting item:', error);
            Alert.alert('Error', 'Failed to remove item');
          } finally {
            setDeleting(null);
          }
        },
      },
    ]);
  };

  const handleAddItems = () => {
    if (!selectedOccasion) {
      Alert.alert(
        'Select an Occasion',
        'Please select an occasion first to add items to your wishlist.'
      );
      return;
    }
    router.push({
      pathname: '/(tabs)/(search)/search',
      params: { occasionId: selectedOccasion },
    });
  };

  const getOccasionColor = (type?: string) => {
    const colors = {
      birthday: '#EC4899', // Pink
      valentine: '#EF4444', // Red
      anniversary: '#8B5CF6', // Purple
      wedding: '#F59E0B', // Amber
      graduation: '#10B981', // Emerald/Green
      other: '#3B82F6', // Blue
    };
    return colors[type as keyof typeof colors] || colors.other;
  };
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50">
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  const currentOccasion = occasions.find((o) => o.id === selectedOccasion);
  const occasionColor = getOccasionColor(currentOccasion?.type);

  return (
    <View className="flex-1 bg-stone-50">
      <SafeAreaView edges={['top']} style={{ backgroundColor: occasionColor }}>
        <View className="px-4 pb-4">
          <Text className="mb-1 text-3xl font-bold text-white">My Wishlist</Text>
          <Text className="text-base text-white/80">Manage your wishes 🎁</Text>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Occasion Selector */}
        <View
          className="mb-6 rounded-2xl border-2 p-5"
          style={{
            borderColor: selectedOccasion ? `${occasionColor}40` : '#FED7AA',
            backgroundColor: selectedOccasion ? `${occasionColor}10` : '#FFFBEB',
          }}>
          <View className="mb-4 flex-row items-center">
            <View
              className="h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: selectedOccasion ? occasionColor : '#F59E0B',
              }}>
              <Ionicons name="calendar" size={20} color="#fff" />
            </View>
            <Text
              className="ml-3 text-sm font-bold uppercase tracking-wider"
              style={{
                color: selectedOccasion ? occasionColor : '#92400E',
              }}>
              Select Occasion
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setDropdownVisible(true)}
            className="flex-row items-center justify-between rounded-xl border-2 bg-white px-5 py-4 active:bg-stone-50"
            style={{ borderColor: selectedOccasion ? `${occasionColor}60` : '#FED7AA' }}
            activeOpacity={0.7}>
            {selectedOccasion ? (
              <View className="flex-1 flex-row items-center">
                <Text className="mr-3 text-2xl">
                  {occasions.find((o) => o.id === selectedOccasion)?.emoji}
                </Text>
                <Text className="flex-1 text-base font-semibold text-stone-900">
                  {occasions.find((o) => o.id === selectedOccasion)?.name}
                </Text>
              </View>
            ) : (
              <Text className="text-base text-stone-500">Select an occasion...</Text>
            )}
            <Ionicons name="chevron-down" size={20} color="#78716C" />
          </TouchableOpacity>

          {!selectedOccasion && (
            <Text className="ml-1 mt-2 text-xs" style={{ color: '#92400E' }}>
              Choose which occasion to view
            </Text>
          )}
        </View>

        {/* Occasion Selection Modal */}
        <Modal
          visible={dropdownVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setDropdownVisible(false)}>
          <TouchableOpacity
            className="flex-1 bg-black/50"
            activeOpacity={1}
            onPress={() => setDropdownVisible(false)}>
            <View className="flex-1 justify-end">
              <TouchableOpacity activeOpacity={1}>
                <View className="rounded-t-3xl bg-white">
                  <View className="flex-row items-center justify-between border-b-2 border-stone-100 px-6 py-5">
                    <Text className="text-xl font-bold text-stone-900">Select Occasion</Text>
                    <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                      <Ionicons name="close" size={28} color="#57534E" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView className="max-h-96">
                    {occasions.map((occasion) => (
                      <TouchableOpacity
                        key={occasion.id}
                        onPress={() => {
                          setSelectedOccasion(occasion.id);
                          setDropdownVisible(false);
                        }}
                        className="flex-row items-center border-b border-stone-100 px-6 py-4 active:bg-stone-50"
                        activeOpacity={0.7}>
                        <Text className="mr-4 text-3xl">{occasion.emoji}</Text>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-stone-900">
                            {occasion.name}
                          </Text>
                          <Text className="text-xs capitalize text-stone-500">
                            {occasion.type} • {occasion.date || 'No date set'}
                          </Text>
                        </View>
                        {selectedOccasion === occasion.id && (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            style={{ color: getOccasionColor(occasion.type) }}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <View className="h-8" />
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {!selectedOccasion ? (
          <View className="items-center py-20">
            <Image
              source={require('../../../assets/logo.png')}
              style={{ width: 100, height: 100, marginBottom: 24 }}
              resizeMode="contain"
            />
            <Text className="mb-2 text-2xl font-semibold text-stone-900">Select an occasion!</Text>
            <Text className="px-8 text-center text-stone-600">
              Choose an occasion to view and manage your wishlist
            </Text>
          </View>
        ) : wishlistItems.length === 0 ? (
          <View className="items-center py-20">
            <Text className="mb-6 text-8xl">🎁</Text>
            <Text className="mb-2 text-2xl font-semibold text-stone-900">No items yet!</Text>
            <Text className="mb-6 px-8 text-center text-stone-600">
              Add items to your wishlist so people know what to get you for {currentOccasion?.name}
            </Text>
            <TouchableOpacity
              onPress={handleAddItems}
              className="rounded-xl px-8 py-4 active:scale-95"
              style={{ backgroundColor: occasionColor }}
              activeOpacity={0.8}>
              <View className="flex-row items-center">
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text className="ml-2 text-lg font-bold text-white">Add Items</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {wishlistItems.map((item) => (
              <View
                key={item.id}
                className="mb-4 rounded-2xl border-2 border-stone-200 bg-white p-5">
                <View className="mb-4 flex-row items-start">
                  <Text className="mr-4 text-6xl">{item.emoji || '🎁'}</Text>
                  <View className="flex-1">
                    <Text className="mb-1 text-xl font-bold text-stone-900">
                      {item.productName}
                    </Text>
                    {item.price && (
                      <Text className="mb-2 text-2xl font-bold" style={{ color: occasionColor }}>
                        {item.price}
                      </Text>
                    )}
                    {item.notes && (
                      <View className="mt-2 rounded-xl bg-stone-50 p-3">
                        <Text className="text-sm text-stone-600">💭 {item.notes}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleDeleteItem(item.id, item.productName)}
                  disabled={deleting === item.id}
                  className="items-center rounded-xl border-2 border-red-200 bg-red-50 py-3 active:scale-95"
                  activeOpacity={0.7}>
                  {deleting === item.id ? (
                    <ActivityIndicator color="#991B1B" />
                  ) : (
                    <View className="flex-row items-center">
                      <Ionicons name="trash-outline" size={20} color="#991B1B" />
                      <Text className="ml-2 font-bold text-red-900">Remove</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={handleAddItems}
              className="mb-4 items-center rounded-2xl border-2 border-dashed bg-white py-6 active:scale-95"
              style={{ borderColor: `${occasionColor}60` }}
              activeOpacity={0.7}>
              <Ionicons name="add-circle-outline" size={32} style={{ color: occasionColor }} />
              <Text className="mt-2 text-base font-bold" style={{ color: occasionColor }}>
                Add More Items
              </Text>
            </TouchableOpacity>

            {currentOccasion && (
              <View
                className="mb-4 rounded-2xl border-2 p-5"
                style={{
                  borderColor: `${occasionColor}40`,
                  backgroundColor: `${occasionColor}10`,
                }}>
                <View className="flex-row items-start">
                  <Text className="mr-3 text-2xl">💝</Text>
                  <Text className="flex-1 text-sm" style={{ color: occasionColor }}>
                    Share your "{currentOccasion.name}" wishlist with friends and family so they
                    know what to get you! ✨
                  </Text>
                </View>
              </View>
            )}
          </>
        )}

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
