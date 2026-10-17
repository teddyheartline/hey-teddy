export type UserRole = 'client' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  photoURL?: string;
  bio?: string;
  notes?: string;
  role: UserRole;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
  updatedAt?: string;
}

export type MediaType = 'photo' | 'video' | 'gallery';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  isAuthorAdmin: boolean;
  mediaType: MediaType;
  mediaUrls: string[];
  caption: string;
  likesCount: number;
  commentsCount: number;
  visibility: 'public' | 'followers' | 'private';
  galleryId?: string;
  galleryItemId?: string;
  likedByCurrentUser?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  text: string;
  createdAt: string;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt?: string;
}

export interface Friendship {
  id: string;
  userA: string;
  userB: string;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantDetails?: {
    [uid: string]: {
      displayName: string;
      photoURL?: string;
      username: string;
    };
  };
  isAiAssistant?: boolean;
  lastMessage?: string;
  lastSenderId?: string;
  lastMessageAt?: string;
  theme?: 'classic' | 'warm-amber' | 'neon-yellow' | 'cyber-dark' | 'rose';
  customNicknames?: { [uid: string]: string };
  isMuted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  text: string;
  mediaType: 'text' | 'image' | 'voice';
  mediaUrl?: string;
  audioDuration?: number;
  createdAt: string;
}

export type NotificationType =
  | 'like'
  | 'comment'
  | 'friend_request'
  | 'friend_accepted'
  | 'new_follower'
  | 'gallery_consent'
  | 'gallery_authorized'
  | 'gallery_published'
  | 'system';

export interface NotificationItem {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  type: NotificationType;
  targetId?: string;
  targetGalleryId?: string;
  targetItemId?: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export type ClientConsentStatus = 'pending' | 'authorized' | 'declined';
export type ItemConsentStatus = 'none' | 'client_authorized' | 'admin_published' | 'client_declined';
export type GalleryStatus = 'new' | 'available' | 'updated' | 'archived' | 'expired';

export interface Gallery {
  id: string;
  title: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  assignedClientUids?: string[];
  status?: GalleryStatus;
  sessionDate?: string;
  description?: string;
  accessCode?: string;
  accessLinkToken: string;
  coverUrl: string;
  clientConsentStatus: ClientConsentStatus;
  clientConsentDate?: string;
  qualityMode: 'high' | 'watermark_preview';
  photoCount: number;
  videoCount?: number;
  downloadCount: number;
  expiresAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GalleryItem {
  id: string;
  galleryId: string;
  title?: string;
  previewUrl: string;
  originalUrl: string;
  mediaType?: 'photo' | 'video';
  fileSize?: number;
  aspectRatio?: string;
  consentStatus?: ItemConsentStatus;
  consentDate?: string;
  publishedPostId?: string;
  caption?: string;
  createdAt: string;
}

export interface SystemSetting {
  id: string;
  heroImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  studioName: string;
  studioPhone: string;
  studioWhatsApp: string;
  primaryColor: string;
  enableAiAssistant: boolean;
  tiktokUrl?: string;
  instagramUrl?: string;
  tedoraName?: string;
  tedoraSystemPrompt?: string;
  updatedAt?: string;
}
