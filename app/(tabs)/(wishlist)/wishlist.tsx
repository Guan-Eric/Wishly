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
import { subscribeToUserGroups } from '../../../services/groupService';
import { deleteWishlistItem, subscribeToWishlistItems } from '../../../services/wishlistService';
import { Group, WishlistItem } from '../../../types/index';

export default function WishlistScreen() {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();
  const userId = auth.currentUser?.uid;

  // Load user's groups
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToUserGroups(userId, (groupsData) => {
      setGroups(groupsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  // Load wishlist items for selected group
  useEffect(() => {
    if (!userId || !selectedGroup) {
      setWishlistItems([]);
      return;
    }

    const unsubscribe = subscribeToWishlistItems(userId, selectedGroup, (items) => {
      setWishlistItems(items);
    });

    return unsubscribe;
  }, [userId, selectedGroup]);

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
    if (!selectedGroup) {
      Alert.alert('Select a Group', 'Please select a group first to add items to your wishlist.');
      return;
    }
    router.push({
      pathname: '/(tabs)/(search)/search',
      params: { groupId: selectedGroup },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-stone-50">
      <SafeAreaView edges={['top']} className="bg-emerald-600">
        <View className="px-4 pb-4">
          <Text className="mb-1 text-3xl font-bold text-white">My Wishlist</Text>
          <Text className="text-base text-white/80">Manage your holiday wishes 🎁</Text>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Group Selector */}
        <View className="mb-6 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5">
          <View className="mb-4 flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
              <Ionicons name="list" size={20} color="#fff" />
            </View>
            <Text className="ml-3 text-sm font-bold uppercase tracking-wider text-emerald-900">
              Select Group
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setDropdownVisible(true)}
            className="flex-row items-center justify-between rounded-xl border-2 border-emerald-300 bg-white px-5 py-4 active:bg-stone-50"
            activeOpacity={0.7}>
            {selectedGroup ? (
              <View className="flex-1 flex-row items-center">
                <Text className="mr-3 text-2xl">
                  {groups.find((g) => g.id === selectedGroup)?.emoji}
                </Text>
                <Text className="flex-1 text-base font-semibold text-stone-900">
                  {groups.find((g) => g.id === selectedGroup)?.name}
                </Text>
              </View>
            ) : (
              <Text className="text-base text-stone-500">Select a group...</Text>
            )}
            <Ionicons name="chevron-down" size={20} color="#78716C" />
          </TouchableOpacity>

          {!selectedGroup && (
            <Text className="ml-1 mt-2 text-xs text-emerald-700">
              Choose which group this item is for
            </Text>
          )}
        </View>
        {/* Group Selection Modal */}
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
                    <Text className="text-xl font-bold text-stone-900">Select Group</Text>
                    <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                      <Ionicons name="close" size={28} color="#57534E" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView className="max-h-96">
                    {groups.map((group) => (
                      <TouchableOpacity
                        key={group.id}
                        onPress={() => {
                          setSelectedGroup(group.id);
                          setDropdownVisible(false);
                        }}
                        className="flex-row items-center border-b border-stone-100 px-6 py-4 active:bg-emerald-50"
                        activeOpacity={0.7}>
                        <Text className="mr-4 text-3xl">{group.emoji}</Text>
                        <Text className="flex-1 text-base font-semibold text-stone-900">
                          {group.name}
                        </Text>
                        {selectedGroup === group.id && (
                          <Ionicons name="checkmark-circle" size={24} color="#059669" />
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

        {!selectedGroup ? (
          <View className="items-center py-20">
            <Image
              source={require('../../../assets/logo.png')}
              style={{ width: 100, height: 100, marginBottom: 24 }}
              resizeMode="contain"
            />
            <Text className="mb-2 text-2xl font-semibold text-stone-900">Select a group!</Text>
            <Text className="px-8 text-center text-stone-600">
              Choose a group to view and manage your wishlist
            </Text>
          </View>
        ) : wishlistItems.length === 0 ? (
          <View className="items-center py-20">
            <Text className="mb-6 text-8xl">🎄</Text>
            <Text className="mb-2 text-2xl font-semibold text-stone-900">No items yet!</Text>
            <Text className="mb-6 px-8 text-center text-stone-600">
              Add items to your wishlist so your Secret Santa knows what to get you
            </Text>
            <TouchableOpacity
              onPress={handleAddItems}
              className="rounded-xl bg-emerald-600 px-8 py-4 active:scale-95"
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
                      <Text className="mb-2 text-2xl font-bold text-emerald-700">{item.price}</Text>
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
              className="mb-4 items-center rounded-2xl border-2 border-dashed border-emerald-300 bg-white py-6 active:scale-95"
              activeOpacity={0.7}>
              <Ionicons name="add-circle-outline" size={32} color="#059669" />
              <Text className="mt-2 text-base font-bold text-emerald-700">Add More Items</Text>
            </TouchableOpacity>

            {groups.find((g) => g.id === selectedGroup) && (
              <View className="mb-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-5">
                <View className="flex-row items-start">
                  <Text className="mr-3 text-2xl">🎅</Text>
                  <Text className="flex-1 text-sm text-amber-900">
                    Your Secret Santa in "{groups.find((g) => g.id === selectedGroup)?.name}" can
                    see these items! ✨
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
