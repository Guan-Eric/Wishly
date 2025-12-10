// app/(tabs)/(search)/search.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebase';
import { subscribeToUserOccasions } from '../../../services/occasionService';
import { addWishlistItem } from '../../../services/wishlistService';
import { Occasion } from '../../../types/index';

const AMAZON_ASSOCIATE_TAG = Constants.expoConfig?.extra?.amazonAssociateTag;

export default function SearchScreen() {
  const params = useLocalSearchParams();
  const [selectedOccasion, setSelectedOccasion] = useState((params.occasionId as string) || '');
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [manualProductName, setManualProductName] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();
  const userId = auth.currentUser?.uid;

  // Load user's occasions
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToUserOccasions(userId, (occasionsData) => {
      setOccasions(occasionsData);
      setLoading(false);

      if (params.occasionId) {
        setSelectedOccasion(params.occasionId as string);
      }
    });

    return unsubscribe;
  }, [userId]);

  const addAffiliateTag = (url: string): string => {
    if (!url.trim()) return '';

    try {
      // Handle amzn.to short links
      if (url.includes('amzn.to/') || url.includes('a.co/')) {
        // These short links will automatically redirect with our tag when opened
        // But we should still try to add the tag
        return url.includes('?')
          ? `${url}&tag=${AMAZON_ASSOCIATE_TAG}`
          : `${url}?tag=${AMAZON_ASSOCIATE_TAG}`;
      }

      const urlObj = new URL(url);

      // Check if it's an Amazon URL
      if (!urlObj.hostname.includes('amazon.com') && !urlObj.hostname.includes('amzn.')) {
        return url;
      }

      // Add or update the tag parameter
      urlObj.searchParams.set('tag', AMAZON_ASSOCIATE_TAG);
      return urlObj.toString();
    } catch (error) {
      // If URL parsing fails, just append the tag
      return url.includes('?')
        ? `${url}&tag=${AMAZON_ASSOCIATE_TAG}`
        : `${url}?tag=${AMAZON_ASSOCIATE_TAG}`;
    }
  };

  const extractProductInfoFromUrl = (url: string): { name: string; asin: string | null } => {
    try {
      const urlObj = new URL(url);

      // Extract ASIN from URL
      const dpMatch = urlObj.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
      const gpMatch = urlObj.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/i);
      const asin = dpMatch?.[1] || gpMatch?.[1] || null;

      // Try to extract product name from URL path
      let productName = '';
      const pathParts = urlObj.pathname.split('/');
      const nameIndex = pathParts.findIndex((part) => part === 'dp' || part === 'product') - 1;
      if (nameIndex >= 0 && pathParts[nameIndex]) {
        productName = decodeURIComponent(pathParts[nameIndex])
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
      }

      return { name: productName, asin };
    } catch (error) {
      return { name: '', asin: null };
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      // Note: This is just a UX helper - the actual paste happens in the TextInput
      Alert.alert(
        'Paste Amazon Link',
        'Copy any Amazon product link and paste it in the URL field below.',
        [{ text: 'Got it!' }]
      );
    } catch (error) {
      console.error('Error with clipboard:', error);
    }
  };

  const handleAddManualItem = async () => {
    if (!selectedOccasion) {
      Alert.alert('Select an Occasion', 'Please select an occasion first');
      return;
    }

    if (!manualProductName.trim()) {
      Alert.alert('Missing Product Name', 'Please enter a product name');
      return;
    }

    if (!amazonUrl.trim()) {
      Alert.alert('Missing Amazon URL', 'Please enter an Amazon product URL');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setAdding(true);
    try {
      const affiliateUrl = addAffiliateTag(amazonUrl);
      const { asin } = extractProductInfoFromUrl(amazonUrl);

      await addWishlistItem({
        userId,
        occasionId: selectedOccasion,
        productName: manualProductName.trim(),
        productUrl: affiliateUrl,
        price: manualPrice.trim() || '',
        notes: manualNotes.trim() || '',
        emoji: '🎁',
        asin: asin || undefined,
      });

      Alert.alert('Added! 🎁', `${manualProductName} has been added to your wishlist!`, [
        {
          text: 'Add Another',
          style: 'cancel',
          onPress: () => {
            setManualProductName('');
            setAmazonUrl('');
            setManualPrice('');
            setManualNotes('');
          },
        },
        {
          text: 'View Wishlist',
          onPress: () => router.push('/(tabs)/(wishlist)/wishlist'),
        },
      ]);

      setManualProductName('');
      setAmazonUrl('');
      setManualPrice('');
      setManualNotes('');
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item to wishlist');
    } finally {
      setAdding(false);
    }
  };

  const getOccasionColor = (type?: string) => {
    const colors = {
      birthday: '#EC4899',
      valentine: '#EF4444',
      anniversary: '#8B5CF6',
      wedding: '#F59E0B',
      graduation: '#10B981',
      other: '#3B82F6',
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

  return (
    <View className="flex-1 bg-stone-50">
      <SafeAreaView
        edges={['top']}
        style={{
          backgroundColor:
            getOccasionColor(occasions.find((o) => o.id === selectedOccasion)?.type) || '#EC4899',
        }}>
        <View className="px-4 pb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white">Add to Wishlist</Text>
              <Text className="text-sm text-white/80">Add items from Amazon 🎁</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Occasion Selector */}
        <View
          className="mb-6 rounded-2xl border-2 p-5"
          style={{
            borderColor: selectedOccasion
              ? `${getOccasionColor(occasions.find((o) => o.id === selectedOccasion)?.type)}40`
              : '#FED7AA',
            backgroundColor: selectedOccasion
              ? `${getOccasionColor(occasions.find((o) => o.id === selectedOccasion)?.type)}10`
              : '#FFFBEB',
          }}>
          <View className="mb-4 flex-row items-center">
            <View
              className="h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: selectedOccasion
                  ? getOccasionColor(occasions.find((o) => o.id === selectedOccasion)?.type)
                  : '#F59E0B',
              }}>
              <Ionicons name="calendar" size={20} color="#fff" />
            </View>
            <Text
              className="ml-3 text-sm font-bold uppercase tracking-wider"
              style={{
                color: selectedOccasion
                  ? getOccasionColor(occasions.find((o) => o.id === selectedOccasion)?.type)
                  : '#92400E',
              }}>
              Select Occasion
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setDropdownVisible(true)}
            className="flex-row items-center justify-between rounded-xl border-2 bg-white px-5 py-4 active:bg-stone-50"
            style={{
              borderColor: selectedOccasion
                ? `${getOccasionColor(occasions.find((o) => o.id === selectedOccasion)?.type)}60`
                : '#FED7AA',
            }}
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
              Choose which occasion this item is for
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
            <Text className="mb-2 text-2xl font-semibold text-stone-900">
              Select an Occasion First
            </Text>
            <Text className="px-8 text-center text-stone-600">
              Choose an occasion above to start adding items to your wishlist
            </Text>
          </View>
        ) : (
          <>
            {/* Quick Add Instructions Card */}
            <View className="mb-6 rounded-2xl border-2 border-blue-200 bg-blue-50 p-5">
              <View className="mb-3 flex-row items-start">
                <Text className="mr-3 text-3xl">🔗</Text>
                <View className="flex-1">
                  <Text className="mb-2 text-lg font-bold text-blue-900">
                    Quick Add from Amazon
                  </Text>
                  <Text className="mb-3 text-sm leading-5 text-blue-800">
                    Find a product on Amazon, copy the link (regular or short link works!), and
                    paste it below. We'll automatically add our affiliate tag to support the app.
                  </Text>
                </View>
              </View>
            </View>

            {/* Instructions Card */}
            <View className="mb-6 rounded-2xl border-2 border-amber-200 bg-amber-50 p-5">
              <View className="mb-3 flex-row items-start">
                <Text className="mr-3 text-3xl">💡</Text>
                <View className="flex-1">
                  <Text className="mb-2 text-lg font-bold text-amber-900">How to Add Items</Text>
                  <Text className="text-sm leading-5 text-amber-800">
                    1. Browse Amazon and find a product{'\n'}
                    2. Copy the product URL{'\n'}
                    3. Paste it below with the product name{'\n'}
                    4. Share your wishlist with loved ones!
                  </Text>
                </View>
              </View>
            </View>

            {/* Manual Entry Form */}
            <View className="mb-6 rounded-2xl border-2 border-stone-200 bg-white p-6">
              <Text className="mb-5 text-xl font-bold text-stone-900">✍️ Add Item Details</Text>

              {/* Product Name */}
              <View className="mb-4">
                <Text className="mb-2 font-semibold text-stone-700">Product Name *</Text>
                <View className="rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3">
                  <TextInput
                    placeholder="e.g., Wireless Headphones"
                    placeholderTextColor="#A8A29E"
                    value={manualProductName}
                    onChangeText={setManualProductName}
                    className="text-base text-stone-900"
                  />
                </View>
              </View>

              {/* Amazon URL */}
              <View className="mb-4">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="font-semibold text-stone-700">Amazon Product URL *</Text>
                  <TouchableOpacity
                    onPress={handlePasteFromClipboard}
                    className="rounded-lg bg-blue-100 px-3 py-1">
                    <Text className="text-xs font-semibold text-blue-900">📋 Paste</Text>
                  </TouchableOpacity>
                </View>
                <View className="rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3">
                  <TextInput
                    placeholder="https://amazon.com/... or amzn.to/..."
                    placeholderTextColor="#A8A29E"
                    value={amazonUrl}
                    onChangeText={setAmazonUrl}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    className="text-base text-stone-900"
                    multiline
                  />
                </View>
                <Text className="ml-1 mt-2 text-xs text-stone-500">
                  Copy any Amazon product link - we'll add our affiliate tag automatically
                </Text>
              </View>

              {/* Price (Optional) */}
              <View className="mb-4">
                <Text className="mb-2 font-semibold text-stone-700">Price (Optional)</Text>
                <View className="flex-row items-center rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3">
                  <Text className="mr-2 text-lg font-bold text-stone-900">$</Text>
                  <TextInput
                    placeholder="29.99"
                    placeholderTextColor="#A8A29E"
                    value={manualPrice}
                    onChangeText={setManualPrice}
                    keyboardType="decimal-pad"
                    className="flex-1 text-base text-stone-900"
                  />
                </View>
              </View>

              {/* Notes (Optional) */}
              <View className="mb-5">
                <Text className="mb-2 font-semibold text-stone-700">Notes (Optional)</Text>
                <View className="rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3">
                  <TextInput
                    placeholder="e.g., Prefer blue color, Size M"
                    placeholderTextColor="#A8A29E"
                    value={manualNotes}
                    onChangeText={setManualNotes}
                    multiline
                    numberOfLines={3}
                    className="text-base text-stone-900"
                    style={{ minHeight: 80, textAlignVertical: 'top' }}
                  />
                </View>
              </View>

              {/* Add Button */}
              <TouchableOpacity
                onPress={handleAddManualItem}
                disabled={adding}
                className="items-center rounded-xl py-4 active:scale-95"
                style={{
                  backgroundColor: getOccasionColor(
                    occasions.find((o) => o.id === selectedOccasion)?.type
                  ),
                }}
                activeOpacity={0.8}>
                {adding ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View className="flex-row items-center">
                    <Ionicons name="add-circle" size={24} color="#fff" />
                    <Text className="ml-3 text-lg font-bold text-white">Add to Wishlist</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Affiliate Disclosure */}
            <View
              className="mb-6 rounded-2xl border-2 p-5"
              style={{
                borderColor: `${getOccasionColor(occasions.find((o) => o.id === selectedOccasion)?.type)}40`,
                backgroundColor: `${getOccasionColor(occasions.find((o) => o.id === selectedOccasion)?.type)}10`,
              }}>
              <View className="flex-row items-start">
                <Text className="mr-3 text-2xl">💝</Text>
                <Text
                  className="flex-1 text-sm"
                  style={{
                    color: getOccasionColor(occasions.find((o) => o.id === selectedOccasion)?.type),
                  }}>
                  When someone buys through your Amazon links, we earn a small commission that helps
                  keep the app free! Your affiliate tag is automatically added to all links. 🎁
                </Text>
              </View>
            </View>
          </>
        )}

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
