import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Conversation, Message, UserProfile, FriendRequest } from '../types';
import { askTedora } from './gemini';

// Tedora AI pre-pinned conversation ID
export const TEDORA_CONVERSATION_ID = 'conversation_tedora_ai';
export const LUMINA_CONVERSATION_ID = TEDORA_CONVERSATION_ID; // alias for compatibility

export const TEDORA_PROFILE: UserProfile = {
  uid: 'tedora_ai',
  displayName: 'Tedora — Assistant Hey Teddy',
  username: 'tedora_ai',
  email: 'tedora@bussostudios.photo',
  photoURL: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
  bio: 'Assistant Personnel Officiel de Teddy & BUSSO Studios — Galeries, réservations et conseils.',
  role: 'admin',
  followersCount: 2450,
  followingCount: 1,
  postsCount: 15,
  createdAt: '2026-01-01T00:00:00.000Z',
};
export const LUMINA_PROFILE = TEDORA_PROFILE; // alias for compatibility

// Subscribe to user conversations
export function subscribeToUserConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
) {
  const colRef = collection(db, 'conversations');
  const q = query(
    colRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc'),
    limit(30)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const convs: Conversation[] = snapshot.docs.map((d) => ({
        ...(d.data() as Conversation),
        id: d.id,
      }));
      callback(convs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'conversations');
    }
  );
}

// Get or create conversation between two users
export async function getOrCreateConversation(
  userA: UserProfile,
  userB: UserProfile
): Promise<string> {
  const sortedIds = [userA.uid, userB.uid].sort();
  const convId = `conv_${sortedIds[0]}_${sortedIds[1]}`;
  const convRef = doc(db, 'conversations', convId);

  try {
    const snap = await getDoc(convRef);
    if (!snap.exists()) {
      const now = new Date().toISOString();
      const newConv: Conversation = {
        id: convId,
        participants: [userA.uid, userB.uid],
        participantDetails: {
          [userA.uid]: {
            displayName: userA.displayName,
            photoURL: userA.photoURL,
            username: userA.username,
          },
          [userB.uid]: {
            displayName: userB.displayName,
            photoURL: userB.photoURL,
            username: userB.username,
          },
        },
        lastMessage: 'Discussion démarrée',
        lastSenderId: userA.uid,
        lastMessageAt: now,
        theme: 'classic',
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(convRef, newConv);
    }
    return convId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `conversations/${convId}`);
  }
}

// Subscribe to messages
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
) {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((d) => ({
        ...(d.data() as Message),
        id: d.id,
      }));
      callback(msgs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `conversations/${conversationId}/messages`);
    }
  );
}

// Send message
export async function sendMessage(
  conversationId: string,
  sender: UserProfile,
  text: string,
  mediaType: 'text' | 'image' | 'voice' = 'text',
  mediaUrl?: string,
  audioDuration?: number
): Promise<void> {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const newDoc = doc(messagesRef);
  const now = new Date().toISOString();

  const newMsg: Message = {
    id: newDoc.id,
    conversationId,
    senderId: sender.uid,
    senderName: sender.displayName,
    senderPhotoURL: sender.photoURL,
    text,
    mediaType,
    mediaUrl,
    audioDuration,
    createdAt: now,
  };

  try {
    await setDoc(newDoc, newMsg);

    // Update conversation last message
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      lastMessage: mediaType === 'voice' ? '🎤 Message vocal' : mediaType === 'image' ? '📷 Photo' : text,
      lastSenderId: sender.uid,
      lastMessageAt: now,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `conversations/${conversationId}/messages/${newDoc.id}`);
  }
}

// Send message to Tedora AI and get AI response
export async function sendMessageToTedora(
  conversationId: string,
  user: UserProfile,
  prompt: string,
  history: { role: 'user' | 'model'; text: string }[] = [],
  customSystemPrompt?: string
): Promise<void> {
  await sendMessage(conversationId, user, prompt, 'text');

  // Trigger Tedora response
  const aiAnswer = await askTedora(prompt, history, customSystemPrompt);

  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const newDoc = doc(messagesRef);
  const now = new Date().toISOString();

  const tedoraMsg: Message = {
    id: newDoc.id,
    conversationId,
    senderId: TEDORA_PROFILE.uid,
    senderName: TEDORA_PROFILE.displayName,
    senderPhotoURL: TEDORA_PROFILE.photoURL,
    text: aiAnswer,
    mediaType: 'text',
    createdAt: now,
  };

  await setDoc(newDoc, tedoraMsg);

  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: aiAnswer,
    lastSenderId: TEDORA_PROFILE.uid,
    lastMessageAt: now,
    updatedAt: now,
  });
}
// Alias for compatibility
export const sendMessageToLumina = sendMessageToTedora;

// Update conversation theme
export async function updateConversationTheme(
  conversationId: string,
  theme: 'classic' | 'warm-amber' | 'neon-yellow' | 'cyber-dark' | 'rose'
): Promise<void> {
  try {
    await updateDoc(doc(db, 'conversations', conversationId), { theme, updatedAt: new Date().toISOString() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `conversations/${conversationId}`);
  }
}

// Friends
export async function sendFriendRequest(sender: UserProfile, receiverId: string): Promise<void> {
  const colRef = collection(db, 'friendRequests');
  const newDoc = doc(colRef);
  const req: FriendRequest = {
    id: newDoc.id,
    senderId: sender.uid,
    senderName: sender.displayName,
    senderPhotoURL: sender.photoURL,
    receiverId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(newDoc, req);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `friendRequests/${newDoc.id}`);
  }
}

export function subscribeToFriendRequests(
  userId: string,
  callback: (requests: FriendRequest[]) => void
) {
  const colRef = collection(db, 'friendRequests');
  const q = query(
    colRef,
    where('receiverId', '==', userId),
    where('status', '==', 'pending')
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({
        ...(d.data() as FriendRequest),
        id: d.id,
      }));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'friendRequests');
    }
  );
}

export async function respondToFriendRequest(
  requestId: string,
  accept: boolean,
  senderId: string,
  receiver: UserProfile
): Promise<void> {
  try {
    await updateDoc(doc(db, 'friendRequests', requestId), {
      status: accept ? 'accepted' : 'declined',
      updatedAt: new Date().toISOString(),
    });

    if (accept) {
      // Add friendship record
      const friendshipRef = doc(collection(db, 'friendships'));
      await setDoc(friendshipRef, {
        id: friendshipRef.id,
        userA: senderId,
        userB: receiver.uid,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `friendRequests/${requestId}`);
  }
}

// Search users
export async function searchUsers(searchTerm: string): Promise<UserProfile[]> {
  if (!searchTerm.trim()) return [];
  try {
    const q = query(collection(db, 'users'), limit(20));
    const snap = await getDocs(q);
    const lower = searchTerm.toLowerCase();
    const results: UserProfile[] = [];

    snap.forEach((d) => {
      const u = d.data() as UserProfile;
      if (
        u.displayName?.toLowerCase().includes(lower) ||
        u.username?.toLowerCase().includes(lower)
      ) {
        results.push(u);
      }
    });

    return results;
  } catch (error) {
    console.warn('User search error:', error);
    return [];
  }
}
