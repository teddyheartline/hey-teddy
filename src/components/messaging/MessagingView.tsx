import React, { useEffect, useState, useRef } from 'react';
import {
  Search,
  Send,
  Image,
  Mic,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Bot,
  Sparkles,
  ArrowLeft,
  X,
  MicOff,
  VideoOff,
  Palette,
  BellOff,
  Bell,
  UserCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Conversation,
  Message,
  UserProfile,
} from '../../types';
import {
  TEDORA_CONVERSATION_ID,
  TEDORA_PROFILE,
  LUMINA_CONVERSATION_ID,
  LUMINA_PROFILE,
  subscribeToUserConversations,
  subscribeToMessages,
  sendMessage,
  sendMessageToTedora,
  sendMessageToLumina,
  updateConversationTheme,
  searchUsers,
  getOrCreateConversation,
} from '../../services/messagingService';

interface MessagingViewProps {
  onRequireAuth: () => void;
}

export const MessagingView: React.FC<MessagingViewProps> = ({ onRequireAuth }) => {
  const { currentUser, userProfile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Call simulation modal states
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoCamOff, setIsVideoCamOff] = useState(false);

  // Chat settings drawer
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [chatTheme, setChatTheme] = useState<'classic' | 'warm-amber' | 'neon-yellow' | 'cyber-dark' | 'rose'>('classic');
  const [isChatMuted, setIsChatMuted] = useState(false);

  // Voice recording simulation
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);

  // Emoji picker quick drawer
  const [showEmojis, setShowEmojis] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Friends avatars list
  const sampleFriends: UserProfile[] = [
    TEDORA_PROFILE,
    {
      uid: 'sarah_m',
      displayName: 'Sarah Morin',
      username: 'sarah_m',
      email: 'sarah@example.com',
      photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      bio: 'Mariée par Teddy ! 💍',
      role: 'client',
      followersCount: 84,
      followingCount: 110,
      postsCount: 5,
      createdAt: '',
    },
    {
      uid: 'julien_b',
      displayName: 'Julien Bernard',
      username: 'julien_b',
      email: 'julien@example.com',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      bio: 'Architecte d’intérieur & amateur d’argentique',
      role: 'client',
      followersCount: 120,
      followingCount: 95,
      postsCount: 14,
      createdAt: '',
    },
    {
      uid: 'elena_v',
      displayName: 'Elena Vasquez',
      username: 'elena_v',
      email: 'elena@example.com',
      photoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
      bio: 'Mannequin & créatrice de contenu mode',
      role: 'client',
      followersCount: 420,
      followingCount: 230,
      postsCount: 38,
      createdAt: '',
    },
  ];

  // Subscribe to user conversations
  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToUserConversations(currentUser.uid, setConversations);
    return () => unsub();
  }, [currentUser]);

  // Subscribe to messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;
    const unsub = subscribeToMessages(activeConversationId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
    return () => unsub();
  }, [activeConversationId]);

  // Handle Call Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCalling) {
      timer = setInterval(() => setCallSeconds((prev) => prev + 1), 1000);
    } else {
      setCallSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isCalling]);

  // Handle Voice Recording Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecordingVoice) {
      timer = setInterval(() => setVoiceSeconds((prev) => prev + 1), 1000);
    } else {
      setVoiceSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  // Search logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const delayDebounce = setTimeout(async () => {
      const results = await searchUsers(searchTerm);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-500 mb-4 shadow">
          <Send className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">
          Messagerie privée
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Connectez-vous pour échanger avec Teddy, vos amis ou discuter avec l'IA Lumina.
        </p>
        <button
          onClick={onRequireAuth}
          className="px-6 py-3 rounded-full font-bold bg-amber-400 text-neutral-950 shadow-md hover:bg-amber-300 transition"
        >
          Se connecter
        </button>
      </div>
    );
  }

  // Open Tedora AI Chat
  const handleOpenTedora = () => {
    setActiveConversationId(TEDORA_CONVERSATION_ID);
    setActivePartner(TEDORA_PROFILE);
  };
  const handleOpenLumina = handleOpenTedora; // alias

  // Open Chat with a Friend
  const handleOpenFriendChat = async (friend: UserProfile) => {
    if (!userProfile) return;
    if (friend.uid === TEDORA_PROFILE.uid) {
      handleOpenTedora();
      return;
    }
    const convId = await getOrCreateConversation(userProfile, friend);
    setActiveConversationId(convId);
    setActivePartner(friend);
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversationId || !userProfile) return;

    const textToSend = inputText.trim();
    setInputText('');

    if (activeConversationId === TEDORA_CONVERSATION_ID) {
      const history = messages.slice(-6).map((m) => ({
        role: (m.senderId === TEDORA_PROFILE.uid ? 'model' : 'user') as 'user' | 'model',
        text: m.text,
      }));
      await sendMessageToTedora(activeConversationId, userProfile, textToSend, history);
    } else {
      await sendMessage(activeConversationId, userProfile, textToSend, 'text');
    }
  };

  // Send Voice Note
  const handleStopAndSendVoice = async () => {
    if (!activeConversationId || !userProfile) return;
    setIsRecordingVoice(false);
    const duration = voiceSeconds;
    setVoiceSeconds(0);

    await sendMessage(
      activeConversationId,
      userProfile,
      `Message vocal (${duration}s)`,
      'voice',
      undefined,
      duration
    );
  };

  // Start Call Simulation
  const handleStartCall = (type: 'audio' | 'video') => {
    setCallType(type);
    setIsCalling(true);
    setIsMuted(false);
    setIsVideoCamOff(false);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Theme styles for active conversation
  const themeClasses: Record<string, { bubbleUser: string; bg: string }> = {
    classic: {
      bubbleUser: 'bg-amber-400 text-neutral-950 font-medium',
      bg: 'bg-white dark:bg-neutral-900',
    },
    'warm-amber': {
      bubbleUser: 'bg-amber-500 text-white font-medium',
      bg: 'bg-amber-50/30 dark:bg-neutral-900',
    },
    'neon-yellow': {
      bubbleUser: 'bg-yellow-300 text-black font-semibold',
      bg: 'bg-yellow-50/20 dark:bg-neutral-900',
    },
    'cyber-dark': {
      bubbleUser: 'bg-neutral-800 text-amber-300 border border-neutral-700',
      bg: 'bg-neutral-950',
    },
    rose: {
      bubbleUser: 'bg-rose-500 text-white font-medium',
      bg: 'bg-rose-50/30 dark:bg-neutral-900',
    },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-28 h-[calc(100vh-5rem)]">
      <div className="h-full bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm flex overflow-hidden">
        {/* Left Sidebar: Friends & Discussions List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-neutral-200/80 dark:border-neutral-800/80 flex flex-col ${
            activeConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Top Bar: Search */}
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-3">
              Messages
            </h2>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un ami sur hey Teddy,..."
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-amber-400 dark:text-white"
              />
            </div>
          </div>

          {/* Search Results if typing */}
          {searchTerm.trim() ? (
            <div className="flex-1 overflow-y-auto p-3">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 px-2">
                Résultats de recherche
              </h4>
              {searchResults.length === 0 ? (
                <p className="text-xs text-neutral-400 px-2 py-4">Aucun utilisateur trouvé.</p>
              ) : (
                searchResults.map((user) => (
                  <button
                    key={user.uid}
                    onClick={() => {
                      handleOpenFriendChat(user);
                      setSearchTerm('');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
                      <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {user.displayName}
                      </span>
                      <p className="text-[11px] text-neutral-400">@{user.username}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            <>
              {/* Horizontal Friends Avatars */}
              <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                  Amis & Studio
                </span>
                <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {sampleFriends.map((friend) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={friend.uid}
                      onClick={() => handleOpenFriendChat(friend)}
                      className="flex flex-col items-center flex-shrink-0 group"
                    >
                      <div className="relative w-12 h-12 rounded-full p-0.5 ring-2 ring-amber-400/70 group-hover:ring-amber-400 transition overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                        {friend.uid === LUMINA_PROFILE.uid ? (
                          <div className="w-full h-full bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center text-neutral-950">
                            <Bot className="w-6 h-6" />
                          </div>
                        ) : (
                          <img
                            src={friend.photoURL}
                            alt={friend.displayName}
                            className="w-full h-full object-cover rounded-full"
                          />
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mt-1 max-w-[60px] truncate">
                        {friend.displayName.split(' ')[0]}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Discussions List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {/* Pre-pinned Tedora AI Discussion */}
                <div
                  onClick={handleOpenTedora}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition select-none ${
                    activeConversationId === TEDORA_CONVERSATION_ID
                      ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300/50'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-neutral-950 flex-shrink-0 shadow-md">
                    <Sparkles className="w-6 h-6" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-neutral-900 rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white flex items-center gap-1">
                        <span>Tedora</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-black bg-amber-400 text-neutral-950 uppercase">
                          IA
                        </span>
                      </span>
                      <span className="text-[10px] text-amber-500 font-bold">Épinglé</span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      Assistant officiel BUSSO Studios & Hey Teddy
                    </p>
                  </div>
                </div>

                {/* Other Discussions */}
                {sampleFriends
                  .filter((f) => f.uid !== TEDORA_PROFILE.uid)
                  .map((friend) => (
                    <div
                      key={friend.uid}
                      onClick={() => handleOpenFriendChat(friend)}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition select-none ${
                        activePartner?.uid === friend.uid
                          ? 'bg-neutral-100 dark:bg-neutral-800'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
                        <img
                          src={friend.photoURL}
                          alt={friend.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white truncate">
                            {friend.displayName}
                          </span>
                          <span className="text-[10px] text-neutral-400">Récemment</span>
                        </div>
                        <p className="text-xs text-neutral-400 truncate">{friend.bio}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Right Main: Active Chat Thread */}
        <div
          className={`flex-1 flex flex-col bg-neutral-50/50 dark:bg-neutral-900/50 ${
            activeConversationId ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeConversationId && activePartner ? (
            <>
              {/* Active Conversation Top Bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConversationId(null)}
                    className="md:hidden p-1.5 rounded-full text-neutral-500 hover:bg-neutral-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                    {activePartner.uid === LUMINA_PROFILE.uid ? (
                      <div className="w-full h-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-neutral-950 font-black">
                        <Bot className="w-5 h-5" />
                      </div>
                    ) : (
                      <img
                        src={activePartner.photoURL}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <span>{activePartner.displayName}</span>
                      {activePartner.uid === LUMINA_PROFILE.uid && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-neutral-950">
                          IA
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>En ligne</span>
                    </p>
                  </div>
                </div>

                {/* Top Action Icons: Audio call, Video call, Settings */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleStartCall('audio')}
                    className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    title="Appel audio"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleStartCall('video')}
                    className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    title="Appel vidéo"
                  >
                    <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>

                  <div className="relative">
                    <button
                      onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                      className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    >
                      <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {/* Chat Settings Popup */}
                    {showSettingsMenu && (
                      <div className="absolute right-0 top-10 w-56 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-2 z-30">
                        <span className="block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Thème de la discussion
                        </span>
                        <div className="flex gap-2 px-3 py-2 mb-2">
                          {[
                            { id: 'classic', color: 'bg-amber-400' },
                            { id: 'warm-amber', color: 'bg-amber-600' },
                            { id: 'neon-yellow', color: 'bg-yellow-300' },
                            { id: 'rose', color: 'bg-rose-500' },
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setChatTheme(t.id as any);
                                updateConversationTheme(activeConversationId, t.id as any);
                              }}
                              className={`w-6 h-6 rounded-full ${t.color} ring-2 ${
                                chatTheme === t.id ? 'ring-black dark:ring-white scale-110' : 'ring-transparent'
                              }`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={() => setIsChatMuted(!isChatMuted)}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            {isChatMuted ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                            <span>{isChatMuted ? 'Activer notifications' : 'Muet'}</span>
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div
                className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 ${
                  themeClasses[chatTheme]?.bg || ''
                }`}
              >
                {/* Intro message for Tedora */}
                {activePartner.uid === TEDORA_PROFILE.uid && (
                  <div className="max-w-md mx-auto text-center py-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-3xl p-4 border border-amber-200/50 mb-4">
                    <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                    <h4 className="text-xs font-black text-neutral-900 dark:text-white">
                      Bienvenue dans votre espace Tedora IA
                    </h4>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                      Je réponds instantanément à toutes vos interrogations sur BUSSO Studios, les galeries privées,
                      les téléchargements originaux et les réservations avec Teddy (+228 01 60 60 97 87).
                    </p>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="text-center py-16 text-neutral-400">
                    <p className="text-xs">Démarrez votre échange en toute élégance.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUser.uid;

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
                            {msg.senderId === LUMINA_PROFILE.uid ? (
                              <div className="w-full h-full bg-amber-400 flex items-center justify-center text-[10px] font-black">
                                hT
                              </div>
                            ) : (
                              <img src={msg.senderPhotoURL} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                        )}

                        <div
                          className={`max-w-[78%] sm:max-w-md rounded-3xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                            isMe
                              ? themeClasses[chatTheme]?.bubbleUser || 'bg-amber-400 text-neutral-950'
                              : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-100 dark:border-neutral-700'
                          }`}
                        >
                          {msg.mediaType === 'voice' ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center">
                                <Mic className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold">Message vocal</span>
                              <span className="text-[10px] opacity-75">{msg.audioDuration || 3}s</span>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 sm:p-4 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
                {/* Voice recording state indicator */}
                {isRecordingVoice ? (
                  <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/40 border border-rose-300 rounded-full px-4 py-2">
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-xs animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>Enregistrement en cours... {voiceSeconds}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsRecordingVoice(false)}
                        className="text-xs text-neutral-500 hover:text-neutral-800 px-2 py-1"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleStopAndSendVoice}
                        className="px-3 py-1 rounded-full bg-rose-500 text-white font-bold text-xs shadow hover:bg-rose-600"
                      >
                        Envoyer le vocal
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    {/* Voice record trigger */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => setIsRecordingVoice(true)}
                      className="p-2.5 rounded-full text-neutral-500 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      title="Enregistrer un message vocal"
                    >
                      <Mic className="w-5 h-5" />
                    </motion.button>

                    {/* Quick Emojis trigger */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmojis(!showEmojis)}
                        className="p-2.5 rounded-full text-neutral-500 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                      {showEmojis && (
                        <div className="absolute bottom-12 left-0 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-2 flex gap-1 z-30">
                          {['✨', '📸', '❤️', '👏', '🔥', '💍', '🕊️'].map((em) => (
                            <button
                              key={em}
                              type="button"
                              onClick={() => {
                                setInputText((prev) => prev + em);
                                setShowEmojis(false);
                              }}
                              className="text-lg p-1.5 hover:scale-125 transition"
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Text input */}
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={
                        activePartner.uid === TEDORA_PROFILE.uid
                          ? 'Posez votre question à Tedora IA...'
                          : `Message à ${activePartner.displayName}...`
                      }
                      className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-amber-400 dark:text-white"
                    />

                    {/* Send button */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-2.5 rounded-full bg-amber-400 text-neutral-950 font-bold hover:bg-amber-300 disabled:opacity-40 transition shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </form>
                )}
              </div>
            </>
          ) : (
            /* Empty state when no chat is open on desktop */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mb-4">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Vos conversations privées
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
                Sélectionnez un contact ou échangez directement avec Tedora, l'IA dédiée de BUSSO Studios & Hey Teddy.
              </p>
              <button
                onClick={handleOpenTedora}
                className="px-6 py-2.5 rounded-full font-bold text-xs bg-amber-400 text-neutral-950 shadow hover:bg-amber-300 transition"
              >
                Parler avec Tedora IA
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Call Simulation Modal */}
      <AnimatePresence>
        {isCalling && activePartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-neutral-950 rounded-3xl p-8 text-center text-white border border-neutral-800 shadow-2xl overflow-hidden"
            >
              {/* Video Camera Preview Simulation */}
              {callType === 'video' && !isVideoCamOff && (
                <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-neutral-900 mb-6 border border-neutral-800 flex items-center justify-center">
                  <img
                    src={activePartner.photoURL}
                    alt=""
                    className="w-full h-full object-cover filter brightness-90"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-emerald-400 font-bold">
                    HD 1080p
                  </div>
                </div>
              )}

              {/* Avatar when audio or video off */}
              {(callType === 'audio' || isVideoCamOff) && (
                <div className="w-24 h-24 mx-auto rounded-full ring-4 ring-amber-400/80 overflow-hidden mb-6 bg-neutral-800 animate-pulse">
                  <img
                    src={activePartner.photoURL}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h3 className="text-xl font-bold mb-1">{activePartner.displayName}</h3>
              <p className="text-xs text-amber-400 font-semibold mb-2">
                {callType === 'video' ? 'Appel Vidéo en direct' : 'Appel Audio Sécurisé'}
              </p>
              <p className="text-lg font-mono font-bold text-neutral-400 mb-8">
                {formatTimer(callSeconds)}
              </p>

              {/* Call Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-full transition ${
                    isMuted ? 'bg-rose-500 text-white' : 'bg-neutral-800 text-neutral-300'
                  }`}
                  title={isMuted ? 'Micro coupé' : 'Couper le micro'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {callType === 'video' && (
                  <button
                    onClick={() => setIsVideoCamOff(!isVideoCamOff)}
                    className={`p-3.5 rounded-full transition ${
                      isVideoCamOff ? 'bg-rose-500 text-white' : 'bg-neutral-800 text-neutral-300'
                    }`}
                    title={isVideoCamOff ? 'Caméra coupée' : 'Couper la caméra'}
                  >
                    {isVideoCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>
                )}

                {/* Hang up button */}
                <button
                  onClick={() => setIsCalling(false)}
                  className="p-4 rounded-full bg-rose-600 text-white shadow-lg hover:bg-rose-700 transition"
                  title="Raccrocher"
                >
                  <Phone className="w-6 h-6 rotate-[135deg]" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
