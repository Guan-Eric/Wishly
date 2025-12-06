// app/(tabs)/(occasion)/person-wishlist.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { subscribeToPersonWishlist } from '../../../services/wishlistService';
import { WishlistItem } from '../../../types/index';
import { normalizeAmazonLink } from '../../../services/amazonAPI';

export default function PersonWishlistScreen() {
  const { occasionId, personId, personName, accent } = useLocalSearchParams();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!personId || !occasionId) return;

    const unsubscribe = subscribeToPersonWishlist(
      personId as string,
      occasionId as string,
      (items) => {
        setWishlistItems(items);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [personId, occasionId]);

  const handleBuyOnAmazon = async (url: string) => {
    try {
      const normalizedUrl = await normalizeAmazonLink(url);
      const supported = await Linking.canOpenURL(normalizedUrl);
      if (supported) {
        await Linking.openURL(normalizedUrl);
      } else {
        alert('Cannot open Amazon link');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      alert('Error opening Amazon');
    }
  };

  const getAccentColor = () => {
    const colors = {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      accent: '#F59E0B',
    };
    return colors[accent as keyof typeof colors] || colors.primary;
  };

  const getBgColor = () => {
    const colors = {
      primary: '#F5F3FF',
      secondary: '#FCE7F3',
      accent: '#FEF3C7',
    };
    return colors[accent as keyof typeof colors] || colors.primary;
  };

  const getBorderColor = () => {
    const colors = {
      primary: '#DDD6FE',
      secondary: '#FBCFE8',
      accent: '#FDE68A',
    };
    return colors[accent as keyof typeof colors] || colors.primary;
  };

  return (
    <View className="flex-1 bg-stone-50">
      <SafeAreaView edges={['top']} style={{ backgroundColor: getAccentColor() }}>
        <View className="px-4 pb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white">{personName}'s Wishlist</Text>
              <Text className="text-sm text-white/80">Find the perfect gift 🎁</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={getAccentColor()} />
          <Text className="mt-4 text-stone-600">Loading wishlist...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-6">
          {wishlistItems.length === 0 ? (
            <View className="items-center py-20">
              <Text className="mb-6 text-8xl">🎁</Text>
              <Text className="mb-2 text-center text-2xl font-semibold text-stone-900">
                No items yet!
              </Text>
              <Text className="px-6 text-center text-stone-600">
                {personName} hasn't added any items to their wishlist yet. Check back soon!
              </Text>
            </View>
          ) : (
            <>
              {wishlistItems.map((item) => (
                <View
                  key={item.id}
                  className="mb-4 rounded-3xl border-2 bg-white p-6"
                  style={{ borderColor: getBorderColor() }}>
                  <View className="mb-5 flex-row items-start">
                    <Text className="mr-4 text-6xl">{item.emoji || '🎁'}</Text>
                    <View className="flex-1">
                      <Text className="mb-2 text-2xl font-bold text-stone-900">
                        {item.productName}
                      </Text>
                      {item.price && (
                        <Text
                          className="mb-2 text-3xl font-bold"
                          style={{ color: getAccentColor() }}>
                          {item.price}
                        </Text>
                      )}
                      {item.notes && (
                        <View
                          className="mt-2 rounded-xl p-3"
                          style={{ backgroundColor: getBgColor() }}>
                          <Text className="text-sm text-stone-700">💭 {item.notes}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleBuyOnAmazon(item.productUrl)}
                    className="items-center rounded-xl py-5 active:scale-95"
                    style={{ backgroundColor: getAccentColor() }}
                    activeOpacity={0.8}>
                    <View className="flex-row items-center">
                      <Ionicons name="cart" size={24} color="#fff" />
                      <Text className="ml-3 text-lg font-bold text-white">Buy on Amazon</Text>
                      <Ionicons
                        name="open-outline"
                        size={20}
                        color="#fff"
                        style={{ marginLeft: 8 }}
                      />
                    </View>
                  </TouchableOpacity>

                  <Text className="mt-3 text-center text-xs text-stone-500">
                    Opens Amazon • Supports our app 🎁
                  </Text>
                </View>
              ))}
            </>
          )}

          <View className="mb-4 rounded-2xl border-2 border-primary/30 bg-primary/10 p-5">
            <View className="flex-row items-start">
              <Text className="mr-3 text-2xl">💡</Text>
              <Text className="flex-1 text-sm text-primary-dark">
                {personName} has shared this wishlist with you! When you purchase through Amazon,
                you support our app. 🎁
              </Text>
            </View>
          </View>

          <View className="h-20" />
        </ScrollView>
      )}
    </View>
  );
}
