import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Post,
  Comment,
  Like,
  Gallery,
  GalleryItem,
  UserProfile,
  NotificationItem,
  FriendRequest,
  SystemSetting,
  ItemConsentStatus,
} from '../types';
import JSZip from 'jszip';

// Initial default settings with BUSSO Studios & Teddy contact info
export const DEFAULT_SETTINGS: SystemSetting = {
  id: 'main',
  heroImageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=2000&q=85',
  heroTitle: 'Hey Teddy',
  heroSubtitle: 'L’émotion capturée dans chaque reflet de lumière. Photographie d’art, mariages d’exception & portraits haute couture signés BUSSO Studios.',
  studioName: 'BUSSO Studios',
  studioPhone: '+228 01 60 60 97 87',
  studioWhatsApp: '2280160609787',
  primaryColor: '#FACC15',
  enableAiAssistant: true,
  tiktokUrl: 'https://www.tiktok.com/@brosansfiltre?_r=1&_t=ZS-9AZ0Gs92mZE',
  instagramUrl: 'https://instagram.com/_teddy_flex?srtk=MTV6cmI5MWppaWJ1YQ%3D%3D',
  tedoraName: 'Tedora',
};

// Seed sample posts if empty
export const SAMPLE_POSTS: Omit<Post, 'id'>[] = [
  {
    authorId: 'admin_official',
    authorName: 'Admin',
    authorPhotoURL: '', // triggers official Hey Teddy logo
    isAuthorAdmin: true,
    mediaType: 'photo',
    mediaUrls: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=85'
    ],
    caption: 'Moments d’éternité lors de la réception champêtre de Sarah & Julien par BUSSO Studios. La lumière dorée de 18h45 a transformé cette clairière en un conte vivant. 🕊️✨',
    likesCount: 168,
    commentsCount: 22,
    visibility: 'public',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    authorId: 'admin_official',
    authorName: 'Admin',
    authorPhotoURL: '',
    isAuthorAdmin: true,
    mediaType: 'photo',
    mediaUrls: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=85'
    ],
    caption: 'Série Studio High-Key signée Teddy : Travail minutieux des contrastes et de l’intensité du regard. Chaque séance est une révélation.',
    likesCount: 114,
    commentsCount: 12,
    visibility: 'public',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    authorId: 'client_camille',
    authorName: 'Camille Leroy',
    authorPhotoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    isAuthorAdmin: false,
    mediaType: 'photo',
    mediaUrls: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=85'
    ],
    caption: 'Tellement reconnaissante envers Teddy & BUSSO Studios pour cette séance en plein air ! Mon shooting préféré de tous les temps. ❤️⛰️',
    likesCount: 78,
    commentsCount: 8,
    visibility: 'public',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    authorId: 'admin_official',
    authorName: 'Admin',
    authorPhotoURL: '',
    isAuthorAdmin: true,
    mediaType: 'photo',
    mediaUrls: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1400&q=85'
    ],
    caption: 'Backstage Éditorial BUSSO Studios : Lumières cinématiques et textures soyeuses pour la nouvelle collection. Un honneur d’orchestrer cette vision.',
    likesCount: 240,
    commentsCount: 31,
    visibility: 'public',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
  }
];

// Fetch or seed settings
export async function getSystemSettings(): Promise<SystemSetting> {
  try {
    const docRef = doc(db, 'settings', 'main');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...(snap.data() as SystemSetting) };
    } else {
      await setDoc(docRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    console.warn('Using local default settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSystemSettings(settings: Partial<SystemSetting>): Promise<void> {
  const docRef = doc(db, 'settings', 'main');
  try {
    await updateDoc(docRef, { ...settings, updatedAt: new Date().toISOString() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'settings/main');
  }
}

// Seed initial posts if Firestore is empty
export async function seedPostsIfEmpty(): Promise<void> {
  try {
    const postsRef = collection(db, 'posts');
    const snap = await getDocs(query(postsRef, limit(1)));
    if (snap.empty) {
      for (const p of SAMPLE_POSTS) {
        const newDoc = doc(postsRef);
        await setDoc(newDoc, { ...p, id: newDoc.id });
      }
    }
  } catch (error) {
    console.warn('Could not seed posts:', error);
  }
}

// Listen to feed posts
export function subscribeToFeedPosts(
  callback: (posts: Post[]) => void,
  currentUserId?: string
) {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, orderBy('createdAt', 'desc'), limit(40));

  return onSnapshot(
    q,
    async (snapshot) => {
      const posts: Post[] = [];
      for (const d of snapshot.docs) {
        const data = d.data() as Post;
        data.id = d.id;

        // Check if liked by current user
        if (currentUserId) {
          try {
            const likeDoc = await getDoc(doc(db, 'posts', d.id, 'likes', currentUserId));
            data.likedByCurrentUser = likeDoc.exists();
          } catch {
            data.likedByCurrentUser = false;
          }
        }
        posts.push(data);
      }
      callback(posts);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'posts');
    }
  );
}

// Create a post
export async function createPost(postData: Omit<Post, 'id' | 'likesCount' | 'commentsCount' | 'createdAt'>): Promise<string> {
  const postsRef = collection(db, 'posts');
  const newDoc = doc(postsRef);
  const now = new Date().toISOString();

  const newPost: Post = {
    ...postData,
    id: newDoc.id,
    likesCount: 0,
    commentsCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(newDoc, newPost);

    // Update user posts count
    const userRef = doc(db, 'users', postData.authorId);
    await updateDoc(userRef, { postsCount: increment(1) });

    return newDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `posts/${newDoc.id}`);
  }
}

// Delete post
export async function deletePost(postId: string, authorId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'posts', postId));
    const userRef = doc(db, 'users', authorId);
    await updateDoc(userRef, { postsCount: increment(-1) });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
  }
}

// Toggle like
export async function toggleLike(
  post: Post,
  user: UserProfile
): Promise<boolean> {
  const likeRef = doc(db, 'posts', post.id, 'likes', user.uid);
  const postRef = doc(db, 'posts', post.id);

  try {
    const snap = await getDoc(likeRef);
    if (snap.exists()) {
      // Remove like
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likesCount: increment(-1) });
      return false;
    } else {
      // Add like
      const newLike: Like = {
        id: user.uid,
        postId: post.id,
        userId: user.uid,
        userName: user.displayName,
        userPhotoURL: user.photoURL,
        createdAt: new Date().toISOString(),
      };
      await setDoc(likeRef, newLike);
      await updateDoc(postRef, { likesCount: increment(1) });

      // Create notification for author if not self
      if (post.authorId !== user.uid) {
        await createNotification({
          recipientId: post.authorId,
          senderId: user.uid,
          senderName: user.displayName,
          senderPhotoURL: user.photoURL,
          type: 'like',
          targetId: post.id,
          text: `a aimé votre publication.`,
          isRead: false,
        });
      }
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `posts/${post.id}/likes/${user.uid}`);
  }
}

// Comments
export function subscribeToComments(postId: string, callback: (comments: Comment[]) => void) {
  const colRef = collection(db, 'posts', postId, 'comments');
  const q = query(colRef, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const comments: Comment[] = snapshot.docs.map((d) => ({
        ...(d.data() as Comment),
        id: d.id,
      }));
      callback(comments);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `posts/${postId}/comments`);
    }
  );
}

export async function addComment(
  post: Post,
  user: UserProfile,
  text: string
): Promise<void> {
  const colRef = collection(db, 'posts', post.id, 'comments');
  const newDoc = doc(colRef);
  const comment: Comment = {
    id: newDoc.id,
    postId: post.id,
    authorId: user.uid,
    authorName: user.displayName,
    authorPhotoURL: user.photoURL,
    text,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(newDoc, comment);
    await updateDoc(doc(db, 'posts', post.id), { commentsCount: increment(1) });

    if (post.authorId !== user.uid) {
      await createNotification({
        recipientId: post.authorId,
        senderId: user.uid,
        senderName: user.displayName,
        senderPhotoURL: user.photoURL,
        type: 'comment',
        targetId: post.id,
        text: `a commenté : "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`,
        isRead: false,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `posts/${post.id}/comments/${newDoc.id}`);
  }
}

// Notifications
export async function createNotification(
  notif: Omit<NotificationItem, 'id' | 'createdAt'>
): Promise<void> {
  const notifRef = collection(db, 'notifications');
  const newDoc = doc(notifRef);
  try {
    await setDoc(newDoc, {
      ...notif,
      id: newDoc.id,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Notification creation error:', error);
  }
}

export function subscribeToNotifications(
  userId: string,
  callback: (notifications: NotificationItem[]) => void
) {
  const colRef = collection(db, 'notifications');
  const q = query(
    colRef,
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(40)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        ...(d.data() as NotificationItem),
        id: d.id,
      }));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'notifications');
    }
  );
}

export async function markNotificationAsRead(notifId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notifications/${notifId}`);
  }
}

// Private Galleries
export async function createGallery(galleryData: Omit<Gallery, 'id' | 'photoCount' | 'downloadCount' | 'createdAt'>): Promise<string> {
  const colRef = collection(db, 'galleries');
  const newDoc = doc(colRef);
  const now = new Date().toISOString();

  const newGallery: Gallery = {
    ...galleryData,
    id: newDoc.id,
    status: galleryData.status || 'new',
    photoCount: 0,
    videoCount: 0,
    downloadCount: 0,
    assignedClientUids: galleryData.assignedClientUids || [],
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(newDoc, newGallery);
    return newDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `galleries/${newDoc.id}`);
  }
}

export function subscribeToGalleries(callback: (galleries: Gallery[]) => void) {
  const colRef = collection(db, 'galleries');
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        ...(d.data() as Gallery),
        id: d.id,
      }));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'galleries');
    }
  );
}

// Subscribe to Client-specific Galleries for the "Studio" tab
export function subscribeToUserGalleries(
  userId: string,
  userEmail: string | undefined,
  callback: (galleries: Gallery[]) => void
) {
  const colRef = collection(db, 'galleries');
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const allGalleries = snapshot.docs.map((d) => ({
        ...(d.data() as Gallery),
        id: d.id,
      }));

      // Filter: only galleries assigned to this user, matching email, or unlocked
      const filtered = allGalleries.filter((g) => {
        const matchesUid = g.assignedClientUids && g.assignedClientUids.includes(userId);
        const matchesEmail = userEmail && g.clientEmail && g.clientEmail.toLowerCase() === userEmail.toLowerCase();
        return matchesUid || matchesEmail;
      });

      callback(filtered);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'galleries');
    }
  );
}

// Assign gallery to client once authenticated or through link
export async function assignGalleryToClient(galleryId: string, userId: string): Promise<void> {
  const galleryRef = doc(db, 'galleries', galleryId);
  try {
    await updateDoc(galleryRef, {
      assignedClientUids: arrayUnion(userId),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `galleries/${galleryId}`);
  }
}

export async function getGalleryByIdOrToken(identifier: string): Promise<Gallery | null> {
  try {
    // Try by ID first
    const directDoc = await getDoc(doc(db, 'galleries', identifier));
    if (directDoc.exists()) {
      return { ...(directDoc.data() as Gallery), id: directDoc.id };
    }

    // Try by token
    const q = query(collection(db, 'galleries'), where('accessLinkToken', '==', identifier), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { ...(docSnap.data() as Gallery), id: docSnap.id };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `galleries/${identifier}`);
  }
}

export async function addGalleryItem(galleryId: string, itemData: Omit<GalleryItem, 'id' | 'galleryId' | 'createdAt'>): Promise<string> {
  const colRef = collection(db, 'galleries', galleryId, 'items');
  const newDoc = doc(colRef);
  const newItem: GalleryItem = {
    ...itemData,
    id: newDoc.id,
    galleryId,
    mediaType: itemData.mediaType || 'photo',
    consentStatus: 'none',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(newDoc, newItem);
    const updateField = itemData.mediaType === 'video' ? { videoCount: increment(1) } : { photoCount: increment(1) };
    await updateDoc(doc(db, 'galleries', galleryId), {
      ...updateField,
      updatedAt: new Date().toISOString(),
    });
    return newDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `galleries/${galleryId}/items/${newDoc.id}`);
  }
}

export function subscribeToGalleryItems(galleryId: string, callback: (items: GalleryItem[]) => void) {
  const colRef = collection(db, 'galleries', galleryId, 'items');
  const q = query(colRef, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        ...(d.data() as GalleryItem),
        id: d.id,
      }));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `galleries/${galleryId}/items`);
    }
  );
}

// PHOTO-BY-PHOTO CONSENT: Client authorizes or declines specific photo
export async function updateItemConsent(
  galleryId: string,
  itemId: string,
  consent: ItemConsentStatus,
  clientName: string,
  galleryTitle: string,
  adminUid?: string
): Promise<void> {
  const itemRef = doc(db, 'galleries', galleryId, 'items', itemId);
  const now = new Date().toISOString();

  try {
    await updateDoc(itemRef, {
      consentStatus: consent,
      consentDate: now,
    });

    // If client authorized, notify the administrator
    if (consent === 'client_authorized') {
      // Find admin recipients
      const adminCol = collection(db, 'admins');
      const adminSnap = await getDocs(adminCol);
      const adminUids: string[] = [];
      adminSnap.forEach((d) => adminUids.push(d.id));

      const targetAdmin = adminUids.length > 0 ? adminUids[0] : (adminUid || 'admin_official');

      await createNotification({
        recipientId: targetAdmin,
        senderId: 'system',
        senderName: clientName || 'Client',
        senderPhotoURL: '',
        type: 'gallery_authorized',
        targetGalleryId: galleryId,
        targetItemId: itemId,
        text: `a autorisé la proposition d’une photo pour publication dans la galerie "${galleryTitle}". Examinez-la pour décider de sa mise en ligne.`,
        isRead: false,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `galleries/${galleryId}/items/${itemId}`);
  }
}

// Admin validates authorized photo and publishes it to the public feed
export async function publishItemToFeed(
  gallery: Gallery,
  item: GalleryItem,
  authorUid: string,
  customCaption?: string
): Promise<string> {
  const itemRef = doc(db, 'galleries', gallery.id, 'items', item.id);
  const caption = customCaption || `Séance exclusive "${gallery.title}" par Teddy • BUSSO Studios ✨ (${gallery.clientName})`;

  const postId = await createPost({
    authorId: authorUid,
    authorName: 'Admin',
    authorPhotoURL: '',
    isAuthorAdmin: true,
    mediaType: item.mediaType || 'photo',
    mediaUrls: [item.originalUrl || item.previewUrl],
    caption,
    visibility: 'public',
    galleryId: gallery.id,
  });

  // Mark item as published
  await updateDoc(itemRef, {
    consentStatus: 'admin_published',
    publishedPostId: postId,
  });

  // Notify client if assigned
  if (gallery.assignedClientUids && gallery.assignedClientUids.length > 0) {
    for (const cUid of gallery.assignedClientUids) {
      await createNotification({
        recipientId: cUid,
        senderId: authorUid,
        senderName: 'Teddy (Admin)',
        senderPhotoURL: '',
        type: 'gallery_published',
        targetId: postId,
        text: `Votre photo de la galerie "${gallery.title}" a été validée et publiée avec succès sur le fil public Hey Teddy !`,
        isRead: false,
      });
    }
  }

  return postId;
}

// Client revokes consent -> photo is declined and removed from public feed if published
export async function revokeItemConsent(
  galleryId: string,
  item: GalleryItem
): Promise<void> {
  const itemRef = doc(db, 'galleries', galleryId, 'items', item.id);
  try {
    await updateDoc(itemRef, {
      consentStatus: 'client_declined',
      consentDate: new Date().toISOString(),
    });

    // If already published on feed, delete the post to maintain strict privacy!
    if (item.publishedPostId) {
      await deleteDoc(doc(db, 'posts', item.publishedPostId));
      await updateDoc(itemRef, { publishedPostId: '' });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `galleries/${galleryId}/items/${item.id}`);
  }
}

// Update overall gallery consent status (compatibility)
export async function updateGalleryConsent(
  galleryId: string,
  consent: 'authorized' | 'declined'
): Promise<void> {
  const galleryRef = doc(db, 'galleries', galleryId);
  try {
    const now = new Date().toISOString();
    await updateDoc(galleryRef, {
      clientConsentStatus: consent,
      clientConsentDate: now,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `galleries/${galleryId}`);
  }
}

// Increment gallery downloads
export async function incrementGalleryDownloads(galleryId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'galleries', galleryId), {
      downloadCount: increment(1),
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // Ignore non-fatal
  }
}

// Helper to download entire gallery as ZIP
export async function downloadGalleryAsZip(gallery: Gallery, items: GalleryItem[], onProgress?: (percent: number) => void): Promise<void> {
  const zip = new JSZip();
  const folderName = `${gallery.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_BUSSO_Studios`;
  const folder = zip.folder(folderName) || zip;

  let loaded = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const response = await fetch(item.originalUrl);
      const blob = await response.blob();
      const isVideo = item.mediaType === 'video' || blob.type.includes('mp4');
      const ext = isVideo ? 'mp4' : blob.type.includes('png') ? 'png' : 'jpg';
      folder.file(`Original_${i + 1}_BUSSO_Studios.${ext}`, blob);
    } catch {
      console.warn('Direct fetch failed for item:', item.id);
    }
    loaded++;
    if (onProgress) {
      onProgress(Math.round((loaded / items.length) * 80));
    }
  }

  const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    if (onProgress) {
      onProgress(80 + Math.round(metadata.percent * 0.2));
    }
  });

  // Trigger download in browser
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = `${folderName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  await incrementGalleryDownloads(gallery.id);
}
