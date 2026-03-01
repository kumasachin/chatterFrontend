import { Search } from "lucide-react";
import { useEffect, useCallback, useMemo, useState } from "react";

import LazyUserCard from "../../components/lazy-user-card/LazyUserCard.tsx";
import { useAuthStore } from "../../store/auth.store.ts";
import { useFriendRequestStore } from "../../store/friendRequest.store.ts";
import { useChatStore } from "../../store/messages.store.ts";
import useUserStore from "../../store/user.store.ts";
import type { User } from "../../types/auth.ts";

interface LazyLoadUserListProps {
  onUserClick: (user: User) => void;
}

const LazyLoadUserList = ({ onUserClick }: LazyLoadUserListProps) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentRecipient = useUserStore(
    (state) => state.setCurrentRecipient,
  );
  const {
    getUsers,
    users,
    setSelectedUser,
    searchUsers,
    isUsersLoading,
    totalUsers,
  } = useChatStore();
  const {
    friends,
    receivedRequests,
    sentRequests,
    getFriends,
    getReceivedRequests,
    getSentRequests,
  } = useFriendRequestStore();
  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounceTimer, setSearchDebounceTimer] =
    useState<ReturnType<typeof setTimeout> | null>(null);

  // handle search with debouncing to avoid too many API calls
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);

      // clear existing timer
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }

      // set new timer
      const timer = setTimeout(() => {
        searchUsers(value);
      }, 300); // 300ms debounce

      setSearchDebounceTimer(timer);
    },
    [searchUsers, searchDebounceTimer],
  );

  const messageUser = useCallback(
    (user: User) => {
      if (user) {
        setCurrentRecipient(user);
        setSelectedUser({
          _id: user._id,
          name: user.name,
        });
        onUserClick(user);
      }
    },
    [setCurrentRecipient, setSelectedUser, onUserClick],
  );

  const isUserOnline = useCallback(
    (userId: string) => {
      return onlineUsers.includes(userId);
    },
    [onlineUsers],
  );

  // Filter and sort users (client-side filtering for priority, server handles search)
  const filteredUsers = useMemo(() => {
    const allUsers =
      users?.filter((user) => user._id !== currentUser?._id) || [];

    // Create sets for quick lookup
    const friendIds = new Set(friends.map((friend: any) => friend._id));
    const pendingReceivedIds = new Set(
      receivedRequests.map((req: any) => req.sender._id),
    );
    const pendingSentIds = new Set(
      sentRequests.map((req: any) => req.receiver._id),
    );

    // Sort users by priority: Friends > Pending Requests > Others
    const sortedUsers = allUsers.sort((a, b) => {
      // Priority scoring: 3 = friends, 2 = pending requests, 1 = others
      const getPriority = (user: any) => {
        if (friendIds.has(user._id)) return 3;
        if (pendingReceivedIds.has(user._id) || pendingSentIds.has(user._id))
          return 2;
        return 1;
      };

      const priorityA = getPriority(a);
      const priorityB = getPriority(b);

      // Sort by priority first, then by name within same priority
      if (priorityA !== priorityB) {
        return priorityB - priorityA; // Higher priority first
      }
      return a.name.localeCompare(b.name); // Alphabetical within same priority
    });

    return sortedUsers;
  }, [users, currentUser?._id, friends, receivedRequests, sentRequests]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  // Load friend request data for sorting
  useEffect(() => {
    getFriends();
    getReceivedRequests();
    getSentRequests();
  }, [getFriends, getReceivedRequests, getSentRequests]);

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Header with search */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold">
          Users
          {filteredUsers.length > 0 && (
            <span className="text-sm text-gray-500 font-normal">
              ({filteredUsers.length})
            </span>
          )}
        </h2>

        <div className="flex items-center gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FB406C] focus:border-[#FB406C]"
            />
            {isUsersLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-[#FB406C] border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lazy loaded users container */}
      <div className="flex-1 overflow-auto">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredUsers.map((user) => (
            <LazyUserCard
              key={user._id}
              user={user}
              onChatClick={() => messageUser(user)}
              isOnline={isUserOnline(user._id)}
              rootMargin="100px" // Load content 100px before it comes into view
            />
          ))}
        </div>
      </div>

      {/* Status info */}
      <div className="mt-4 text-xs text-gray-500 flex justify-between items-center flex-shrink-0">
        <span>Showing {filteredUsers.length} users</span>
        <span>Total: {totalUsers} users</span>
      </div>

      {/* No users message */}
      {filteredUsers.length === 0 && !isUsersLoading && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? (
            <>
              <p>No users match "{searchTerm}"</p>
              <button
                onClick={() => handleSearchChange("")}
                className="mt-2 text-[#FB406C] hover:text-[#fb406cd9] text-sm"
              >
                Clear search
              </button>
            </>
          ) : (
            <p>No users found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LazyLoadUserList;
