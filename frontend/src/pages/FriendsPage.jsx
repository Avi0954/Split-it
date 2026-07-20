import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, User, Loader2, HandCoins, UserMinus, Search, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import AddFriendModal from '../components/AddFriendModal';
import SettleUpModal from '../components/SettleUpModal';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { getCurrentUser } from '../services/auth';
import { useSearch } from '../contexts/SearchContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAllRealtimeEvents } from '../hooks/useRealtimeEvents';

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const [activeFilter, setActiveFilter] = useState('all'); // all, owes_me, i_owe, settled

  // Settle Up state
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { showToast } = useToast();
  const { formatAmount } = useCurrency();

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    try {
      const [friendsRes, user] = await Promise.all([
        api.get('/friends/'),
        getCurrentUser()
      ]);
      setFriends(friendsRes.data);
      setCurrentUser(user);
    } catch (err) {
      console.error('Failed to load friends:', err);
      showToast('Failed to load friends list.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  useAllRealtimeEvents((payload) => {
    console.log('Realtime event received, refetching friends page:', payload.type);
    fetchFriends();
  }, [fetchFriends]);

  useEffect(() => {
    let result = friends;

    // Apply Search
    if ((searchQuery || "").trim()) {
      const q = (searchQuery || "").toLowerCase();
      result = result.filter(f =>
        (f.friend?.name || "").toLowerCase().includes(q) ||
        (f.friend?.email || "").toLowerCase().includes(q)
      );
    }

    // Apply Filters
    if (activeFilter === 'owes_me') result = result.filter(f => f.balance > 0);
    else if (activeFilter === 'i_owe') result = result.filter(f => f.balance < 0);
    else if (activeFilter === 'settled') result = result.filter(f => f.balance === 0);

    setFilteredFriends(result);
  }, [friends, searchQuery, activeFilter]);

  const handleSettleUp = (friend) => {
    setSelectedFriend(friend);
    setIsSettleModalOpen(true);
  };

  const handleRemoveFriend = async (friendId) => {
    if (window.confirm("Are you sure you want to unfriend this user? You can only unfriend if all balances are settled.")) {
      // Since friendship is a hidden group, we can delete the group
      // The backend should handle /friends/{id} DELETE but for now we'll show an error if not implemented
      showToast("Unfriend functionality not fully supported in API yet", 'warning');
    }
  };

  const filters = [
    { id: 'all', label: 'All Friends' },
    { id: 'owes_me', label: 'Owes me' },
    { id: 'i_owe', label: 'I owe' },
    { id: 'settled', label: 'Settled up' },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28 lg:pb-0">

        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1F1F2B] pb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#EAEAF0] tracking-tight">Friends</h2>
            <p className="text-[#A1A1AA] text-sm font-medium">Manage your 1-on-1 expenses and shared bills.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            <UserPlus size={18} />
            <span>Add Friend</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={18} />
            <input
              type="text"
              placeholder="Search friends by name or email..."
              className="w-full bg-[#12121A] border border-[#1F1F2B] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#A78BFA] transition-colors font-medium text-[#EAEAF0]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-2 shrink-0">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-200 border ${activeFilter === filter.id
                    ? 'bg-[#A78BFA]/10 border-[#A78BFA]/30 text-[#A78BFA] shadow-[0_0_10px_rgba(167,139,250,0.1)]'
                    : 'bg-[#12121A] border-[#1F1F2B] text-[#A1A1AA] hover:text-[#EAEAF0] hover:bg-[#1F1F2B]'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Friends List */}
        <div className="space-y-3 pt-2">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="card p-5 border-[#1F1F2B] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1F1F2B] rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-[#1F1F2B] rounded animate-pulse" />
                    <div className="w-48 h-3 bg-[#1F1F2B] rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-20 h-6 bg-[#1F1F2B] rounded animate-pulse" />
              </div>
            ))
          ) : filteredFriends.length === 0 ? (
            <div className="card py-16 flex flex-col items-center justify-center text-center bg-transparent border-dashed border-[#1F1F2B]">
              <div className="w-16 h-16 bg-[#12121A] rounded-full flex items-center justify-center text-[#A1A1AA] mb-4">
                {searchQuery || activeFilter !== 'all' ? <Filter size={24} /> : <UserPlus size={24} />}
              </div>
              <h3 className="text-[#EAEAF0] font-semibold mb-2">
                {searchQuery || activeFilter !== 'all' ? "No friends match your filters" : "You haven't added any friends yet"}
              </h3>
              <p className="text-[#A1A1AA] text-sm mb-6 max-w-sm">
                {searchQuery || activeFilter !== 'all'
                  ? "Try adjusting your search terms or clearing your filters."
                  : "Add your friends to easily split expenses directly without creating groups."}
              </p>
              {searchQuery || activeFilter !== 'all' ? (
                <button onClick={() => { setSearchQuery(''); setActiveFilter('all'); }} className="btn-ghost text-sm">
                  Clear Filters
                </button>
              ) : (
                <button onClick={() => setIsModalOpen(true)} className="btn-primary text-sm px-6">
                  Add your first friend
                </button>
              )}
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <div key={friend.id} className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-[#A78BFA]/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 shrink-0 bg-gradient-to-tr from-[#1E1B4B] to-[#09090B] border border-[#1F1F2B] rounded-full flex items-center justify-center text-[#A78BFA] text-lg font-bold">
                    {friend.friend.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#EAEAF0] text-base leading-tight">{friend.friend.name}</h3>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">{friend.friend.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                  <div className="text-left sm:text-right flex-1 sm:flex-none">
                    {friend.balance > 0 ? (
                      <div>
                        <p className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-wider mb-0.5">Owes you</p>
                        <p className="text-lg font-bold text-[#34D399] tracking-tight">{formatAmount(friend.balance)}</p>
                      </div>
                    ) : friend.balance < 0 ? (
                      <div>
                        <p className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-wider mb-0.5">You owe</p>
                        <p className="text-lg font-bold text-[#F87171] tracking-tight">{formatAmount(Math.abs(friend.balance))}</p>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-[#A1A1AA]">Settled up</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {friend.balance !== 0 && (
                      <button
                        onClick={() => handleSettleUp(friend)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${friend.balance < 0
                            ? 'bg-[#1F1F2B] text-[#EAEAF0] hover:bg-[#1A1A24]'
                            : 'bg-[#A78BFA]/10 text-[#A78BFA] hover:bg-[#A78BFA]/20'
                          }`}
                      >
                        <HandCoins size={14} />
                        <span className="hidden sm:inline">{friend.balance < 0 ? 'Settle' : 'Remind'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-transparent border border-transparent hover:bg-rose-500/10 hover:border-rose-500/20 text-[#A1A1AA] hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
                      title="Remove Friend"
                    >
                      <UserMinus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Friend Modal */}
        <AddFriendModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onFriendAdded={fetchFriends}
        />

        {/* Settle Up Modal */}
        {selectedFriend && currentUser && (
          <SettleUpModal
            isOpen={isSettleModalOpen}
            onClose={() => {
              setIsSettleModalOpen(false);
              setSelectedFriend(null);
            }}
            groupId={selectedFriend.group_id}
            currentUser={currentUser}
            onSettled={fetchFriends}
          />
        )}

      </div>
    </Layout>
  );
};

export default FriendsPage;
