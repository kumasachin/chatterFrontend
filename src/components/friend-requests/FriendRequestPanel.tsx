import { Users, UserPlus, Check, X, Clock } from "lucide-react";
import React, { useEffect, useState } from "react";

import { useFriendRequestStore } from "../../store/friendRequest.store";
import type { FriendRequest } from "../../types/friendRequest";

const FriendRequestPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"received" | "sent" | "friends">(
    "received",
  );

  const {
    receivedRequests,
    sentRequests,
    friends,
    isLoading,
    getReceivedRequests,
    getSentRequests,
    getFriends,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
  } = useFriendRequestStore();

  useEffect(() => {
    getReceivedRequests();
    getSentRequests();
    getFriends();
  }, [getReceivedRequests, getSentRequests, getFriends]);

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
    } catch (error) {
      console.error("Failed to decline friend request:", error);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (window.confirm("Are you sure you want to remove this friend?")) {
      try {
        await removeFriend(friendId);
      } catch (error) {
        console.error("Failed to remove friend:", error);
      }
    }
  };

  const renderReceivedRequests = () => (
    <div className="space-y-4">
      {receivedRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <UserPlus className="mx-auto h-12 w-12 mb-4" />
          <p>No pending friend requests</p>
        </div>
      ) : (
        receivedRequests.map((request: FriendRequest) => (
          <div
            key={request._id}
            className="bg-white rounded-lg p-4 shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {request.sender.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {request.sender.name}
                  </h3>
                  {request.message && (
                    <p className="text-sm text-gray-600">{request.message}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAccept(request._id)}
                  disabled={isLoading}
                  className="p-2 bg-[#FB406C] text-white rounded-full hover:bg-[#fb406cd9] disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDecline(request._id)}
                  disabled={isLoading}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderSentRequests = () => (
    <div className="space-y-4">
      {sentRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="mx-auto h-12 w-12 mb-4" />
          <p>No sent friend requests</p>
        </div>
      ) : (
        sentRequests.map((request: FriendRequest) => (
          <div
            key={request._id}
            className="bg-white rounded-lg p-4 shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {request.receiver.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {request.receiver.name}
                  </h3>
                  {request.message && (
                    <p className="text-sm text-gray-600">{request.message}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : request.status === "accepted"
                        ? "bg-pink-100 text-[#FB406C]"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderFriends = () => (
    <div className="space-y-4">
      {friends.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="mx-auto h-12 w-12 mb-4" />
          <p>No friends yet</p>
        </div>
      ) : (
        friends.map((friend) => (
          <div
            key={friend._id}
            className="bg-white rounded-lg p-4 shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {friend.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{friend.name}</h3>
                  <p className="text-sm text-green-600">✓ Friends</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFriend(friend._id)}
                disabled={isLoading}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Friend Requests</h1>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("received")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "received"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Received ({receivedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("sent")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "sent"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Sent ({sentRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("friends")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "friends"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Friends ({friends.length})
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            Loading friend requests...
          </p>
        </div>
      ) : (
        <>
          {activeTab === "received" && renderReceivedRequests()}
          {activeTab === "sent" && renderSentRequests()}
          {activeTab === "friends" && renderFriends()}
        </>
      )}
    </div>
  );
};

export default FriendRequestPanel;
