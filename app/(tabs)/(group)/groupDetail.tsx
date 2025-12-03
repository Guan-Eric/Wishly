// app/(tabs)/(group)/groupDetail.tsx
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
  getGroupById,
  sendGroupInvite,
  updateGroup,
  updateGroupMatching,
} from '../../../services/groupService';
import { searchUsersByEmail } from '../../../services/userService';
import { Group } from '../../../types/index';

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editExchangeDate, setEditExchangeDate] = useState('');
  const [saving, setSaving] = useState(false);

  // Add member fields
  const [memberEmail, setMemberEmail] = useState('');
  const [memberName, setMemberName] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [searchingUser, setSearchingUser] = useState(false);

  const router = useRouter();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    if (!groupId) return;

    try {
      const groupData = await getGroupById(groupId as string);
      setGroup(groupData);
      if (groupData) {
        setEditName(groupData.name);
        setEditBudget(groupData.budget?.toString() || '');
        setEditExchangeDate(groupData.exchangeDate || '');
      }
    } catch (error) {
      console.error('Error loading group:', error);
      Alert.alert('Error', 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      Alert.alert('Missing Name', 'Please enter a group name');
      return;
    }

    if (!group) return;

    setSaving(true);
    try {
      await updateGroup(group.id, {
        name: editName.trim(),
        budget: editBudget.trim() ? Number(editBudget) : null,
        exchangeDate: editExchangeDate.trim() || null,
      });

      Alert.alert('Success', 'Group details updated!');
      setEditModalVisible(false);
      loadGroup();
    } catch (error) {
      console.error('Error updating group:', error);
      Alert.alert('Error', 'Failed to update group details');
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

      // Check if already a member
      if (group?.memberIds.includes(user.id)) {
        Alert.alert('Already a Member', 'This user is already in the group');
        return;
      }

      setMemberName(user.displayName);
      Alert.alert(
        'User Found',
        `Found: ${user.displayName}. Click "Add Member" to add them to the group.`,
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

    if (!group) return;

    if (group.matched) {
      Alert.alert(
        'Cannot Add Members',
        'Secret Santas have already been matched. You cannot add new members after matching.',
        [{ text: 'OK' }]
      );
      return;
    }

    setAddingMember(true);
    try {
      const users = await searchUsersByEmail(memberEmail.trim().toLowerCase());

      if (users.length === 0) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const user = users[0];

      // Send invite with user ID
      await sendGroupInvite(
        group.id,
        group.name,
        group.emoji,
        user.email,
        user.id, // Pass user ID
        auth.currentUser?.displayName || 'Someone',
        userId!
      );

      Alert.alert(
        'Invite Sent!',
        `An invitation has been sent to ${user.displayName}. They will need to accept it to join the group.`
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

  const handleMatchSecretSantas = async () => {
    if (!group || group.members.length < 2) {
      Alert.alert('Not Enough Members', 'You need at least 2 members to match Secret Santas!');
      return;
    }

    Alert.alert(
      'Match Secret Santas?',
      `This will randomly assign Secret Santas for ${group.members.length} members. This action cannot be undone!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Match Now',
          style: 'default',
          onPress: async () => {
            setMatching(true);
            try {
              const assignments = matchSecretSantas(group.members);
              await updateGroupMatching(group.id, assignments);
              Alert.alert(
                '🎅 Success!',
                'Secret Santas have been matched! Everyone can now see their assignments.'
              );
              loadGroup();
            } catch (error: any) {
              console.error('Error matching:', error);
              Alert.alert('Error', error.message || 'Failed to match Secret Santas');
            } finally {
              setMatching(false);
            }
          },
        },
      ]
    );
  };

  const handleShareGroup = async () => {
    if (!group) return;

    try {
      await Share.share({
        message:
          `🎄 You're invited to join "${group.name}" Secret Santa exchange!\n\n` +
          `Join the festive fun and surprise your friends with the perfect gift! 🎁\n\n` +
          `Created by: ${group.creatorName}\n\n` +
          `Download the Secret Santa app and search for this group to join!`,
        title: `Join ${group.name}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!group) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50">
        <Text className="text-stone-600">Group not found</Text>
      </View>
    );
  }

  const isCreator = group.createdBy === userId;

  return (
    <View className="flex-1 bg-stone-50">
      <SafeAreaView edges={['top']} className="bg-emerald-600">
        <View className="px-4 pb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white">
                {group.emoji} {group.name}
              </Text>
              <Text className="text-sm text-white/80">Group Details</Text>
            </View>
            <TouchableOpacity
              onPress={handleShareGroup}
              className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Group Info */}
        <View className="mb-4 rounded-2xl border-2 border-stone-200 bg-white p-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-sm uppercase tracking-wider text-stone-500">
              Group Information
            </Text>
            {isCreator && (
              <TouchableOpacity
                onPress={() => setEditModalVisible(true)}
                className="flex-row items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                <Ionicons name="pencil" size={16} color="#059669" />
                <Text className="ml-1 text-xs font-semibold text-emerald-700">Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="mb-4">
            <View className="mb-2 flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center">
                <Ionicons name="people" size={20} color="#78716C" />
                <Text className="ml-2 font-semibold text-stone-900">
                  {group.members.length} Participants
                </Text>
              </View>
              {isCreator && !group.matched && (
                <TouchableOpacity
                  onPress={() => setAddMemberModalVisible(true)}
                  className="flex-row items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <Ionicons name="person-add" size={16} color="#059669" />
                  <Text className="ml-1 text-xs font-semibold text-emerald-700">Add</Text>
                </TouchableOpacity>
              )}
            </View>
            {group.members.map((member, index) => (
              <Text key={index} className="ml-7 text-stone-600">
                • {member.name} {member.userId === group.createdBy && '(Creator)'}
              </Text>
            ))}
          </View>

          {group.budget && (
            <View className="mb-2 flex-row items-center">
              <Ionicons name="cash-outline" size={20} color="#78716C" />
              <Text className="ml-2 font-semibold text-stone-900">Budget: ${group.budget}</Text>
            </View>
          )}

          {group.exchangeDate && (
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={20} color="#78716C" />
              <Text className="ml-2 font-semibold text-stone-900">
                Exchange: {group.exchangeDate}
              </Text>
            </View>
          )}
        </View>

        {/* Matching Status */}
        {group.matched ? (
          <View className="mb-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6">
            <View className="mb-2 flex-row items-center">
              <Ionicons name="checkmark-circle" size={24} color="#059669" />
              <Text className="ml-2 text-lg font-bold text-emerald-900">
                Secret Santas Matched!
              </Text>
            </View>
            <Text className="text-emerald-700">
              Everyone has been assigned their Secret Santa. Check the main screen to see who you
              got! 🎅
            </Text>
          </View>
        ) : (
          <View className="mb-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
            <View className="mb-3 flex-row items-center">
              <Ionicons name="time-outline" size={24} color="#F59E0B" />
              <Text className="ml-2 text-lg font-bold text-amber-900">Not Matched Yet</Text>
            </View>
            <Text className="mb-4 text-amber-700">
              {isCreator
                ? `You can match Secret Santas once you have at least 2 members. Currently: ${group.members.length} members.`
                : 'Waiting for the group creator to match Secret Santas.'}
            </Text>
            {isCreator && group.members.length >= 2 && (
              <TouchableOpacity
                onPress={handleMatchSecretSantas}
                disabled={matching}
                className="items-center rounded-xl bg-amber-600 py-4 active:scale-95"
                activeOpacity={0.8}>
                {matching ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View className="flex-row items-center">
                    <Ionicons name="shuffle" size={20} color="#fff" />
                    <Text className="ml-2 text-lg font-bold text-white">
                      Match Secret Santas Now!
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Instructions */}
        <View className="mb-4 rounded-2xl border-2 border-stone-200 bg-stone-100 p-5">
          <View className="flex-row items-start">
            <Text className="mr-3 text-2xl">💡</Text>
            <View className="flex-1">
              <Text className="mb-2 font-bold text-stone-900">How to invite members:</Text>
              <Text className="text-sm text-stone-700">
                {isCreator ? (
                  <>
                    1. Click "Add" button above to add members by email{'\n'}
                    2. Or share this group using the share button{'\n'}
                    3. Members need to sign up with the app first{'\n'}
                    4. Once everyone joins, match Secret Santas!
                  </>
                ) : (
                  <>
                    1. Only the creator can add members{'\n'}
                    2. Share the group link with the creator{'\n'}
                    3. They can add you using your email{'\n'}
                    4. Wait for Secret Santa matching!
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
              <Text className="text-2xl font-bold text-stone-900">Edit Group</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={28} color="#57534E" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 pt-6">
            <View className="mb-6">
              <Text className="mb-3 ml-1 text-sm font-bold uppercase tracking-wider text-stone-700">
                Group Name *
              </Text>
              <View className="rounded-2xl border-2 border-stone-200 bg-white px-5 py-4">
                <TextInput
                  placeholder="Group name"
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
                Exchange Date (Optional)
              </Text>
              <View className="rounded-2xl border-2 border-stone-200 bg-white px-5 py-4">
                <TextInput
                  placeholder="e.g., December 25, 2025"
                  placeholderTextColor="#A8A29E"
                  value={editExchangeDate}
                  onChangeText={setEditExchangeDate}
                  className="text-lg text-stone-900"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSaveEdit}
              disabled={saving}
              className="mb-8 items-center rounded-2xl bg-emerald-600 py-5 active:scale-95"
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
              <Text className="text-2xl font-bold text-stone-900">Add Member</Text>
              <TouchableOpacity onPress={() => setAddMemberModalVisible(false)}>
                <Ionicons name="close" size={28} color="#57534E" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 pt-6">
            <View className="mb-6 rounded-2xl border-2 border-amber-200 bg-amber-50 p-5">
              <View className="flex-row items-start">
                <Text className="mr-3 text-2xl">💡</Text>
                <Text className="flex-1 text-sm text-amber-900">
                  The person must have signed up for the app first. Enter their email to search for
                  them.
                </Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-3 ml-1 text-sm font-bold uppercase tracking-wider text-stone-700">
                Member Email *
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
              className="mb-4 items-center rounded-xl bg-emerald-600 py-4 active:scale-95"
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
              <View className="mb-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5">
                <Text className="mb-1 font-bold text-emerald-900">User Found:</Text>
                <Text className="text-emerald-800">{memberName}</Text>
              </View>
            )}

            {memberName && (
              <TouchableOpacity
                onPress={handleAddMember}
                disabled={addingMember}
                className="mb-8 items-center rounded-2xl bg-emerald-600 py-5 active:scale-95"
                activeOpacity={0.8}>
                {addingMember ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View className="flex-row items-center">
                    <Ionicons name="person-add" size={20} color="#fff" />
                    <Text className="ml-2 text-xl font-bold text-white">Add Member</Text>
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
