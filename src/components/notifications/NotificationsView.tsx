import React, { useEffect, useState } from 'react';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  CheckCircle2,
  Globe,
  CheckCheck,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  NotificationItem,
  FriendRequest,
} from '../../types';
import {
  subscribeToNotifications,
  markNotificationAsRead,
} from '../../services/dataService';
import {
  subscribeToFriendRequests,
  respondToFriendRequest,
} from '../../services/messagingService';

interface NotificationsViewProps {
  onRequireAuth: () => void;
  onNavigateToPost?: (postId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onRequireAuth,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!currentUser) return;
    const unsubNotifs = subscribeToNotifications(currentUser.uid, setNotifications);
    const unsubRequests = subscribeToFriendRequests(currentUser.uid, setFriendRequests);

    return () => {
      unsubNotifs();
      unsubRequests();
    };
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mb-4">
          <Bell className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">
          Vos notifications
        </h2>
        <p className="text-xs text-neutral-500 mb-6">
          Connectez-vous pour suivre l'activité sur vos photos et vos demandes d'amis.
        </p>
        <button
          onClick={onRequireAuth}
          className="px-6 py-2.5 rounded-full font-bold bg-amber-400 text-neutral-950 text-xs hover:bg-amber-300"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      if (!n.isRead) {
        await markNotificationAsRead(n.id);
      }
    }
  };

  const handleRespondFriend = async (req: FriendRequest, accept: boolean) => {
    if (!userProfile) return;
    await respondToFriendRequest(req.id, accept, req.senderId, userProfile);
    setFriendRequests((prev) => prev.filter((r) => r.id !== req.id));
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-current" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'friend_request':
      case 'new_follower':
        return <UserPlus className="w-4 h-4 text-amber-500" />;
      case 'friend_accepted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'gallery_consent':
        return <Globe className="w-4 h-4 text-indigo-500" />;
      default:
        return <Bell className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white">
            Notifications
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Interactions et activités récentes sur votre compte
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-amber-500 hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tout marquer comme lu</span>
            </button>
          )}
        </div>
      </div>

      {/* Pending Friend Requests Section */}
      {friendRequests.length > 0 && (
        <div className="mb-6 bg-amber-50/60 dark:bg-amber-950/30 rounded-3xl p-4 border border-amber-200/60 dark:border-amber-800/40">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 px-1">
            Demandes d’amis en attente ({friendRequests.length})
          </h3>
          <div className="space-y-2">
            {friendRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between bg-white dark:bg-neutral-900 rounded-2xl p-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                    <img
                      src={req.senderPhotoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      {req.senderName}
                    </span>
                    <p className="text-[11px] text-neutral-400">veut devenir votre ami(e)</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleRespondFriend(req, true)}
                    className="p-2 rounded-full bg-amber-400 text-neutral-950 font-bold hover:bg-amber-300 transition"
                    title="Accepter"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRespondFriend(req, false)}
                    className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 transition"
                    title="Refuser"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
            filter === 'all'
              ? 'bg-amber-400 text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Toutes
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
            filter === 'unread'
              ? 'bg-amber-400 text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Non lues
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8">
          <p className="text-xs text-neutral-400">Aucune notification à afficher.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.isRead) markNotificationAsRead(item.id);
              }}
              className={`flex items-center gap-3.5 p-3.5 rounded-2xl transition cursor-pointer ${
                item.isRead
                  ? 'bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80'
                  : 'bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 shadow-sm'
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                  <img
                    src={item.senderPhotoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-neutral-900 shadow flex items-center justify-center">
                  {getIconForType(item.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200">
                  <span className="font-extrabold text-neutral-900 dark:text-white mr-1">
                    {item.senderName}
                  </span>
                  <span>{item.text}</span>
                </p>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {!item.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
