import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, User, MessageSquare, MoreVertical, Phone, Info, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ChatInboxView: React.FC = () => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setupChat();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.partner.id);

            const channel = supabase
                .channel(`room:${selectedChat.partner.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                }, (payload) => {
                    if ((payload.new.sender_id === selectedChat.partner.id && payload.new.receiver_id === currentUser?.id) ||
                        (payload.new.sender_id === currentUser?.id && payload.new.receiver_id === selectedChat.partner.id)) {
                        setMessages(prev => [...prev, payload.new]);
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const setupChat = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            await fetchConversations(user?.id);
        } catch (error) {
            console.error('Error in setupChat:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchConversations = async (userId: string | undefined) => {
        if (!userId) return;
        const { data, error } = await supabase
            .from('messages')
            .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*)
      `)
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching conversations:', error);
            return;
        }

        const groups: any = {};
        data?.forEach((msg: any) => {
            const partner = msg.sender_id === userId ? msg.receiver : msg.sender;
            if (!partner) return;
            if (!groups[partner.id]) {
                groups[partner.id] = { partner, lastMessage: msg };
            }
        });

        setConversations(Object.values(groups));
    };

    const fetchMessages = async (partnerId: string) => {
        if (!currentUser) return;
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUser.id})`)
            .order('created_at', { ascending: true });

        if (!error) {
            setMessages(data || []);
            // Mark as read
            await supabase.from('messages').update({ is_read: true }).eq('sender_id', partnerId).eq('receiver_id', currentUser.id);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || !currentUser) return;

        const content = newMessage.trim();
        setNewMessage('');

        const { error } = await supabase
            .from('messages')
            .insert({
                sender_id: currentUser.id,
                receiver_id: selectedChat.partner.id,
                content
            });

        if (error) console.error('Error sending message:', error);
    };

    return (
        <div className="flex h-[calc(100vh-14rem)] md:h-[calc(100vh-12rem)] bg-[#16181b] border border-white/5 rounded-[2.5rem] overflow-hidden animate-in fade-in duration-500 relative">
            {/* Sidebar: Chat List */}
            <div className={`
                ${selectedChat ? 'hidden md:flex' : 'flex'} 
                w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col bg-black/20
            `}>
                <div className="p-4 md:p-6 space-y-4">
                    <h2 className="text-xl font-bold">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full bg-[#0f1113] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-[#c0ff72] outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 md:px-3 space-y-1">
                    {conversations.map((chat) => (
                        <button
                            key={chat.partner.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl transition-all ${selectedChat?.partner.id === chat.partner.id
                                ? 'bg-[#c0ff72]/10 border border-[#c0ff72]/20'
                                : 'hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#0f1113] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                {chat.partner.avatar_url ? (
                                    <img src={chat.partner.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-[#c0ff72]">{chat.partner.full_name?.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-center mb-0.5 md:mb-1">
                                    <h4 className="font-bold text-sm truncate">{chat.partner.full_name}</h4>
                                    <span className="text-[9px] md:text-[10px] text-gray-500">
                                        {new Date(chat.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{chat.lastMessage.content}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`
                ${selectedChat ? 'flex' : 'hidden md:flex'} 
                flex-1 flex flex-col min-w-0
            `}>
                {selectedChat ? (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                        {/* Header */}
                        <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-black/10">
                            <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                <button
                                    onClick={() => setSelectedChat(null)}
                                    className="md:hidden p-2 -ml-2 hover:bg-white/5 rounded-lg text-gray-400"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-[#0f1113] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                    {selectedChat.partner.avatar_url ? (
                                        <img src={selectedChat.partner.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={20} className="text-gray-600" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold truncate text-sm md:text-base">{selectedChat.partner.full_name}</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-[#c0ff72] rounded-full animate-pulse" />
                                        <span className="text-[9px] md:text-[10px] text-[#c0ff72] font-bold uppercase tracking-widest whitespace-nowrap">Active Now</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2 shrink-0">
                                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400"><Phone size={18} md:size={20} /></button>
                                <button className="hidden sm:block p-2 hover:bg-white/5 rounded-lg text-gray-400"><Info size={20} /></button>
                                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400"><MoreVertical size={18} md:size={20} /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender_id === currentUser?.id;
                                return (
                                    <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] md:max-w-[70%] space-y-1 ${isMe ? 'items-end ml-12' : 'items-start mr-12'}`}>
                                            <div className={`px-4 md:px-5 py-2.5 md:py-3 rounded-[1.25rem] md:rounded-3xl ${isMe
                                                ? 'bg-[#c0ff72] text-black font-medium rounded-tr-none shadow-[0_0_20px_rgba(192,255,114,0.1)]'
                                                : 'bg-[#0f1113] border border-white/5 text-white rounded-tl-none'
                                                }`}>
                                                <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                                            </div>
                                            <span className="text-[9px] md:text-[10px] text-gray-600 px-1">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 md:p-6 bg-black/10 border-t border-white/5">
                            <div className="flex items-center gap-2 md:gap-4 bg-[#0f1113] border border-white/5 rounded-xl md:rounded-2xl p-1.5 md:p-2 pl-4 md:pl-6">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your response..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm min-w-0"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-[#c0ff72] text-black p-2.5 md:p-3 rounded-lg md:rounded-xl hover:shadow-[0_0_20px_rgba(192,255,114,0.3)] transition-all disabled:opacity-50 shrink-0"
                                >
                                    <Send size={16} md:size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center space-y-6 p-12 text-center">
                        <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-700">
                            <MessageSquare size={48} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Your Conversations</h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                Select a chat from the sidebar to start messaging with prospective tenants.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatInboxView;
