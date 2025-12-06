// app/(tabs)/(occasion)/occasions.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebase';
import {
  acceptOccasionInvite,
  declineOccasionInvite,
  subscribeToUserOccasions,
  subscribeToUserInvites,
} from '../../../services/occasionService';
import { Occasion, OccasionInvite } from '../../../types/index';

export default function OccasionsScreen() {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [invites, setInvites] = useState<OccasionInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingInvite, setProcessingInvite] = useState<string | null>(null);
  const router = useRouter();
  const userId = auth.currentUser?.uid;
  const userEmail = auth.currentUser?.email;

  useEffect(() => {
    if (!userId || !userEmail) return;

    const unsubscribeOccasions = subscribeToUserOccasions(userId, (occasionsData) => {
      setOccasions(occasionsData);
      setLoading(false);
    });

    const unsubscribeInvites = subscribeToUserInvites(userEmail, (invitesData) => {
      setInvites(invitesData);
    });

    return () => {
      unsubscribeOccasions();
      unsubscribeInvites();
    };
  }, [userId, userEmail]);

  const handleAcceptInvite = async (invite: OccasionInvite) => {
    if (!userId || !userEmail) return;

    Alert.alert('Accept Invite?', `View "${invite.occasionName}" wishlist?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          setProcessingInvite(invite.id);
          try {
            await acceptOccasionInvite(
              invite.id,
              invite.occasionId,
              userId,
              auth.currentUser?.displayName || 'User',
              userEmail
            );
            Alert.alert('Success', `You can now view ${invite.occasionName}! 🎉`);
          } catch (error) {
            console.error('Error accepting invite:', error);
            Alert.alert('Error', 'Failed to accept invite');
          } finally {
            setProcessingInvite(null);
          }
        },
      },
    ]);
  };

  const handleDeclineInvite = async (invite: OccasionInvite) => {
    Alert.alert('Decline Invite?', `Decline invitation to "${invite.occasionName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          setProcessingInvite(invite.id);
          try {
            await declineOccasionInvite(invite.id);
          } catch (error) {
            console.error('Error declining invite:', error);
            Alert.alert('Error', 'Failed to decline invite');
          } finally {
            setProcessingInvite(null);
          }
        },
      },
    ]);
  };

  const getAccentColor = (accent?: string) => {
    const colors = {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      accent: '#F59E0B',
    };
    return colors[accent as keyof typeof colors] || colors.primary;
  };

  const handleCreateOccasion = () => {
    router.push('/(tabs)/(occasion)/createOccasion');
  };

  const handleOccasionDetails = (occasion: Occasion) => {
    router.push({
      pathname: '/(tabs)/(occasion)/occasionDetail',
      params: { occasionId: occasion.id },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-stone-50">
      <SafeAreaView edges={['top']} className="bg-primary">
        <View className="px-4 pb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="mb-1 text-3xl font-bold text-white">My Wishlists</Text>
              <Text className="text-base text-white/80">All your special occasions 🎁</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/(occasion)/settings')}
              className="ml-4 h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Pending Invites Section */}
        {invites.length > 0 && (
          <View className="mb-6">
            <View className="mb-3 flex-row items-center">
              <Ionicons name="mail" size={20} color="#78716C" />
              <Text className="ml-2 text-lg font-bold text-stone-900">
                Pending Invites ({invites.length})
              </Text>
            </View>

            {invites.map((invite) => (
              <View
                key={invite.id}
                className="mb-3 rounded-2xl border-2 border-secondary/30 bg-white p-5">
                <View className="mb-4 flex-row items-start">
                  <Text className="mr-3 text-4xl">{invite.occasionEmoji}</Text>
                  <View className="flex-1">
                    <Text className="mb-1 text-xl font-bold text-stone-900">
                      {invite.occasionName}
                    </Text>
                    <Text className="text-sm text-stone-600">Shared by {invite.invitedByName}</Text>
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => handleAcceptInvite(invite)}
                    disabled={processingInvite === invite.id}
                    className="flex-1 items-center rounded-xl bg-primary py-3 active:scale-95"
                    activeOpacity={0.8}>
                    {processingInvite === invite.id ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <View className="flex-row items-center">
                        <Ionicons name="checkmark-circle" size={18} color="#fff" />
                        <Text className="ml-2 font-bold text-white">Accept</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeclineInvite(invite)}
                    disabled={processingInvite === invite.id}
                    className="flex-1 items-center rounded-xl border-2 border-red-200 bg-red-50 py-3 active:scale-95"
                    activeOpacity={0.8}>
                    {processingInvite === invite.id ? (
                      <ActivityIndicator color="#991B1B" size="small" />
                    ) : (
                      <View className="flex-row items-center">
                        <Ionicons name="close-circle" size={18} color="#991B1B" />
                        <Text className="ml-2 font-bold text-red-900">Decline</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Occasions Section */}
        {occasions.length === 0 && invites.length === 0 ? (
          <View className="items-center py-20">
            <Image
              source={require('../../../assets/logo.png')}
              style={{ width: 100, height: 100, marginBottom: 24 }}
              resizeMode="contain"
            />
            <Text className="mb-2 text-2xl font-semibold text-stone-900">No wishlists yet! 🎁</Text>
            <Text className="mb-6 px-8 text-center text-stone-600">
              Create a wishlist for any special occasion
            </Text>
            <TouchableOpacity
              onPress={handleCreateOccasion}
              className="rounded-xl bg-primary px-8 py-4 active:scale-95"
              activeOpacity={0.8}>
              <Text className="text-lg font-bold text-white">Create Your First Wishlist</Text>
            </TouchableOpacity>
          </View>
        ) : occasions.length > 0 ? (
          <>
            {invites.length > 0 && (
              <View className="mb-3 flex-row items-center">
                <Ionicons name="gift" size={20} color="#78716C" />
                <Text className="ml-2 text-lg font-bold text-stone-900">
                  My Wishlists ({occasions.length})
                </Text>
              </View>
            )}
            {occasions.map((occasion) => {
              const isCreator = occasion.createdBy === userId;
              return (
                <View
                  key={occasion.id}
                  className="mb-4 overflow-hidden rounded-2xl border-2 border-stone-200 bg-white">
                  <TouchableOpacity
                    onPress={() => handleOccasionDetails(occasion)}
                    activeOpacity={0.7}>
                    <View className="p-6">
                      <View className="mb-4">
                        <View className="mb-2 flex-row items-center">
                          <Text className="mr-3 text-3xl">{occasion.emoji}</Text>
                          <View className="flex-1">
                            <Text className="text-xl font-bold text-stone-900">
                              {occasion.name}
                            </Text>
                            {occasion.date && (
                              <Text className="text-sm text-stone-600">📅 {occasion.date}</Text>
                            )}
                          </View>
                          <Ionicons name="chevron-forward" size={24} color="#A8A29E" />
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons name="people" size={16} color="#78716C" />
                          <Text className="ml-2 text-stone-600">
                            {occasion.members.length}{' '}
                            {occasion.members.length === 1 ? 'person' : 'people'}
                          </Text>
                          {occasion.budget && (
                            <>
                              <Text className="mx-2 text-stone-400">•</Text>
                              <Ionicons name="cash-outline" size={16} color="#78716C" />
                              <Text className="ml-1 text-stone-600">${occasion.budget} budget</Text>
                            </>
                          )}
                        </View>
                      </View>

                      {isCreator ? (
                        <View
                          className="rounded-xl border-2 bg-stone-50 p-4"
                          style={{ borderColor: getAccentColor(occasion.accent) + '30' }}>
                          <View className="flex-row items-center">
                            <View
                              className="mr-3 h-8 w-8 items-center justify-center rounded-lg"
                              style={{ backgroundColor: getAccentColor(occasion.accent) }}>
                              <Ionicons name="person" size={16} color="#fff" />
                            </View>
                            <Text className="flex-1 text-stone-700">
                              Your wishlist • Tap to manage
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View className="rounded-xl border-2 border-primary/30 bg-primary/10 p-4">
                          <View className="flex-row items-center">
                            <Ionicons name="eye-outline" size={20} color="#8B5CF6" />
                            <Text className="ml-2 flex-1 text-primary-dark">
                              Shared by {occasion.creatorName}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        ) : null}

        <View className="h-20" />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleCreateOccasion}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full shadow-lg active:scale-110"
        style={{ backgroundColor: '#8B5CF6' }}
        activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
