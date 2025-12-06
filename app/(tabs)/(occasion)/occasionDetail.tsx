// app/(tabs)/(occasion)/occasionDetail.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebase';
import {
  getOccasionById,
  sendOccasionInvite,
  updateOccasion,
} from '../../../services/occasionService';
import { searchUsersByEmail } from '../../../services/userService';
import { Occasion } from '../../../types/index';

export default function OccasionDetailScreen() {
  const { occasionId } = useLocalSearchParams();
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editDate, setEditDate] = useState('');
  const [saving, setSaving] = useState(false);

  // Add member fields
  const [memberEmail, setMemberEmail] = useState('');
  const [memberName, setMemberName] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [searchingUser, setSearchingUser] = useState(false);

  const router = useRouter();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    loadOccasion();
  }, [occasionId]);

  const loadOccasion = async () => {
    if (!occasionId) return;

    try {
      const occasionData = await getOccasionById(occasionId as string);
      setOccasion(occasionData);
      if (occasionData) {
        setEditName(occasionData.name);
        setEditBudget(occasionData.budget?.toString() || '');
        setEditDate(occasionData.date || '');
      }
    } catch (error) {
      console.error('Error loading occasion:', error);
      Alert.alert('Error', 'Failed to load occasion details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      Alert.alert('Missing Name', 'Please enter an occasion name');
      return;
    }

    if (!occasion) return;

    setSaving(true);
    try {
      await updateOccasion(occasion.id, {
        name: editName.trim(),
        budget: editBudget.trim() ? Number(editBudget) : null,
        date: editDate.trim() || null,
      });

      Alert.alert('Success', 'Occasion details updated!');
      setEditModalVisible(false);
      loadOccasion();
    } catch (error) {
      console.error('Error updating occasion:', error);
      Alert.alert('Error', 'Failed to update occasion details');
    } finally {
      setSaving(false);
    }
  };

  const handleSearchUser = async () => {
    if (!memberEmail.trim()) {
      Alert.alert('Missing Email', 'Please enter an email address');
      return;
    }

    setSearchingUser(true);
    try {
      const users = await searchUsersByEmail(memberEmail.trim().toLowerCase());

      if (users.length === 0) {
        Alert.alert(
          'User Not Found',
          'No user found with this email. They may need to sign up first.',
          [{ text: 'OK' }]
        );
        return;
      }

      const user = users[0];

      if (occasion?.sharedWith.includes(user.id)) {
        Alert.alert('Already Shared', 'This user already has access to this wishlist');
        return;
      }

      setMemberName(user.displayName);
      Alert.alert(
        'User Found',
        `Found: ${user.displayName}. Click "Share Wishlist" to give them access.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error searching user:', error);
      Alert.alert('Error', 'Failed to search for user');
    } finally {
      setSearchingUser(false);
    }
  };

  const handleAddMember = async () => {
    if (!memberEmail.trim() || !memberName.trim()) {
      Alert.alert('Missing Information', 'Please search for a user first');
      return;
    }

    if (!occasion) return;

    setAddingMember(true);
    try {
      const users = await searchUsersByEmail(memberEmail.trim().toLowerCase());

      if (users.length === 0) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const user = users[0];

      await sendOccasionInvite(
        occasion.id,
        occasion.name,
        occasion.emoji,
        user.email,
        user.id,
        auth.currentUser?.displayName || 'Someone',
        userId!
      );

      Alert.alert(
        'Invite Sent!',
        `An invitation has been sent to ${user.displayName}. They can view your wishlist once they accept.`
      );
      setAddMemberModalVisible(false);
      setMemberEmail('');
      setMemberName('');
    } catch (error) {
      console.error('Error sending invite:', error);
      Alert.alert('Error', 'Failed to send invite');
    } finally {
      setAddingMember(false);
    }
  };

  const handleShareOccasion = async () => {
    if (!occasion) return;

    try {
      await Share.share({
        message:
          `🎁 Check out my wishlist for ${occasion.name}!\n\n` +
          `See what I'd love to receive and find the perfect gift! 🎁\n\n` +
          `Download Wishly and search for "${occasion.name}" to view my wishlist!`,
        title: `${occasion.name} - Wishlist`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewWishlist = () => {
    if (!occasion) return;
    router.push({
      pathname: '/(tabs)/(search)/search',
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

  if (!occasion) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50">
        <Text className="text-stone-600">Occasion not found</Text>
      </View>
    );
  }

  const isCreator = occasion.createdBy === userId;

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
              <Text className="text-2xl font-bold text-white">
                {occasion.emoji} {occasion.name}
              </Text>
              <Text className="text-sm text-white/80">Wishlist Details</Text>
            </View>
            <TouchableOpacity
              onPress={handleShareOccasion}
              className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Occasion Info */}
        <View className="mb-4 rounded-2xl border-2 border-stone-200 bg-white p-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-sm uppercase tracking-wider text-stone-500">
              Wishlist Information
            </Text>
            {isCreator && (
              <TouchableOpacity
                onPress={() => setEditModalVisible(true)}
                className="flex-row items-center rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
                <Ionicons name="pencil" size={16} color="#8B5CF6" />
                <Text className="ml-1 text-xs font-semibold text-primary">Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="mb-4">
            <View className="mb-2 flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center">
                <Ionicons name="people" size={20} color="#78716C" />
                <Text className="ml-2 font-semibold text-stone-900">
                  {occasion.members.length} {occasion.members.length === 1 ? 'Person' : 'People'}
                </Text>
              </View>
              {isCreator && (
                <TouchableOpacity
                  onPress={() => setAddMemberModalVisible(true)}
                  className="flex-row items-center rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
                  <Ionicons name="person-add" size={16} color="#8B5CF6" />
                  <Text className="ml-1 text-xs font-semibold text-primary">Share</Text>
                </TouchableOpacity>
              )}
            </View>
            {occasion.members.map((member, index) => (
              <Text key={index} className="ml-7 text-stone-600">
                • {member.name} {member.userId === occasion.createdBy && '(You)'}
              </Text>
            ))}
          </View>

          {occasion.budget && (
            <View className="mb-2 flex-row items-center">
              <Ionicons name="cash-outline" size={20} color="#78716C" />
              <Text className="ml-2 font-semibold text-stone-900">Budget: ${occasion.budget}</Text>
            </View>
          )}

          {occasion.date && (
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={20} color="#78716C" />
              <Text className="ml-2 font-semibold text-stone-900">Date: {occasion.date}</Text>
            </View>
          )}
        </View>

        {/* Your Wishlist Section - Only show if creator */}
        {isCreator && (
          <View className="mb-4 rounded-2xl border-2 border-primary/30 bg-primary/10 p-6">
            <View className="mb-3 flex-row items-center">
              <Ionicons name="gift" size={24} color="#8B5CF6" />
              <Text className="ml-2 text-lg font-bold text-primary-dark">Your Wishlist</Text>
            </View>
            <Text className="mb-4 text-primary-dark/80">
              Add items to your wishlist so your friends and family know what to get you!
            </Text>
            <TouchableOpacity
              onPress={handleViewWishlist}
              className="items-center rounded-xl bg-primary py-4 active:scale-95"
              activeOpacity={0.8}>
              <View className="flex-row items-center">
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text className="ml-2 text-lg font-bold text-white">Add Items to Wishlist</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Shared Wishlist - Show if not creator */}
        {!isCreator && (
          <View className="mb-4 rounded-2xl border-2 border-secondary/30 bg-secondary/10 p-6">
            <View className="mb-3 flex-row items-center">
              <Ionicons name="eye" size={24} color="#EC4899" />
              <Text className="ml-2 text-lg font-bold text-secondary-dark">
                {occasion.creatorName}'s Wishlist
              </Text>
            </View>
            <Text className="mb-4 text-secondary-dark/80">
              View their wishlist to find the perfect gift for {occasion.name}!
            </Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/(occasion)/person-wishlist',
                  params: {
                    occasionId: occasion.id,
                    personId: occasion.createdBy,
                    personName: occasion.creatorName,
                    accent: occasion.accent || 'primary',
                  },
                })
              }
              className="items-center rounded-xl bg-secondary py-4 active:scale-95"
              activeOpacity={0.8}>
              <View className="flex-row items-center">
                <Ionicons name="gift" size={20} color="#fff" />
                <Text className="ml-2 text-lg font-bold text-white">View Wishlist</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Instructions */}
        <View className="mb-4 rounded-2xl border-2 border-stone-200 bg-stone-100 p-5">
          <View className="flex-row items-start">
            <Text className="mr-3 text-2xl">💡</Text>
            <View className="flex-1">
              <Text className="mb-2 font-bold text-stone-900">How sharing works:</Text>
              <Text className="text-sm text-stone-700">
                {isCreator ? (
                  <>
                    1. Click "Share" to add people by email{'\n'}
                    2. Or use the share button to send a link{'\n'}
                    3. They'll be able to view your wishlist{'\n'}
                    4. Add items so they know what to get you!
                  </>
                ) : (
                  <>
                    1. View {occasion.creatorName}'s wishlist{'\n'}
                    2. Find the perfect gift from their list{'\n'}
                    3. Purchase through Amazon links{'\n'}
                    4. Make their {occasion.name} special!
                  </>
                )}
              </Text>
            </View>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}>
        <SafeAreaView edges={['top']} className="flex-1 bg-stone-50">
          <View className="border-b-2 border-stone-200 bg-white px-4 py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-stone-900">Edit Occasion</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={28} color="#57534E" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 pt-6">
            <View className="mb-6">
              <Text className="mb-3 ml-1 text-sm font-bold uppercase tracking-wider text-stone-700">
                Occasion Name *
              </Text>
              <View className="rounded-2xl border-2 border-stone-200 bg-white px-5 py-4">
                <TextInput
                  placeholder="Occasion name"
                  placeholderTextColor="#A8A29E"
                  value={editName}
                  onChangeText={setEditName}
                  className="text-lg text-stone-900"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="mb-3 ml-1 text-sm font-bold uppercase tracking-wider text-stone-700">
                Budget (Optional)
              </Text>
              <View className="flex-row items-center rounded-2xl border-2 border-stone-200 bg-white px-5 py-4">
                <Text className="mr-2 text-xl font-bold text-stone-900">$</Text>
                <TextInput
                  placeholder="e.g., 50"
                  placeholderTextColor="#A8A29E"
                  value={editBudget}
                  onChangeText={setEditBudget}
                  keyboardType="numeric"
                  className="flex-1 text-lg text-stone-900"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="mb-3 ml-1 text-sm font-bold uppercase tracking-wider text-stone-700">
                Date (Optional)
              </Text>
              <View className="rounded-2xl border-2 border-stone-200 bg-white px-5 py-4">
                <TextInput
                  placeholder="e.g., December 25, 2025"
                  placeholderTextColor="#A8A29E"
                  value={editDate}
                  onChangeText={setEditDate}
                  className="text-lg text-stone-900"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSaveEdit}
              disabled={saving}
              className="mb-8 items-center rounded-2xl bg-primary py-5 active:scale-95"
              activeOpacity={0.8}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-xl font-bold text-white">Save Changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        visible={addMemberModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddMemberModalVisible(false)}>
        <SafeAreaView edges={['top']} className="flex-1 bg-stone-50">
          <View className="border-b-2 border-stone-200 bg-white px-4 py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-stone-900">Share Wishlist</Text>
              <TouchableOpacity onPress={() => setAddMemberModalVisible(false)}>
                <Ionicons name="close" size={28} color="#57534E" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 pt-6">
            <View className="mb-6 rounded-2xl border-2 border-primary/30 bg-primary/10 p-5">
              <View className="flex-row items-start">
                <Text className="mr-3 text-2xl">💡</Text>
                <Text className="flex-1 text-sm text-primary-dark">
                  The person must have signed up for the app first. Enter their email to search for
                  them.
                </Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-3 ml-1 text-sm font-bold uppercase tracking-wider text-stone-700">
                Email Address *
              </Text>
              <View className="rounded-2xl border-2 border-stone-200 bg-white px-5 py-4">
                <TextInput
                  placeholder="email@example.com"
                  placeholderTextColor="#A8A29E"
                  value={memberEmail}
                  onChangeText={setMemberEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="text-lg text-stone-900"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSearchUser}
              disabled={searchingUser}
              className="mb-4 items-center rounded-xl bg-primary py-4 active:scale-95"
              activeOpacity={0.8}>
              {searchingUser ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="search" size={20} color="#fff" />
                  <Text className="ml-2 text-lg font-bold text-white">Search User</Text>
                </View>
              )}
            </TouchableOpacity>

            {memberName && (
              <View className="mb-4 rounded-2xl border-2 border-secondary/30 bg-secondary/10 p-5">
                <Text className="mb-1 font-bold text-secondary-dark">User Found:</Text>
                <Text className="text-secondary-dark/80">{memberName}</Text>
              </View>
            )}

            {memberName && (
              <TouchableOpacity
                onPress={handleAddMember}
                disabled={addingMember}
                className="mb-8 items-center rounded-2xl bg-secondary py-5 active:scale-95"
                activeOpacity={0.8}>
                {addingMember ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View className="flex-row items-center">
                    <Ionicons name="person-add" size={20} color="#fff" />
                    <Text className="ml-2 text-xl font-bold text-white">Share Wishlist</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
