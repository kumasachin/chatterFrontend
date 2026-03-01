/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

import { axiosInstance } from "../lib/axios";
import type { FriendRequest, FriendshipStatus } from "../types/friendRequest";
import { toast } from "../utils/toast";

interface FriendRequestStore {
  // State
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  friends: any[];
  isLoading: boolean;

  // Actions
  sendFriendRequest: (receiverId: string, message?: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  getReceivedRequests: () => Promise<void>;
  getSentRequests: () => Promise<void>;
  getFriends: () => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  checkFriendshipStatus: (userId: string) => Promise<FriendshipStatus>;

  // Real-time handlers
  handleNewFriendRequest: (request: FriendRequest) => void;
  handleRequestAccepted: (request: FriendRequest) => void;
}

export const useFriendRequestStore = create<FriendRequestStore>((set, get) => ({
  // Initial state
  receivedRequests: [],
  sentRequests: [],
  friends: [],
  isLoading: false,

  // Send friend request
  sendFriendRequest: async (receiverId: string, message?: string) => {
    try {
      set({ isLoading: true });
      await axiosInstance.post("/friend-requests/send", {
        receiverId,
        message,
      });

      toast.success("Friend request sent successfully!");

      // Refresh sent requests
      get().getSentRequests();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to send friend request";
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Accept friend request
  acceptFriendRequest: async (requestId: string) => {
    try {
      set({ isLoading: true });
      await axiosInstance.put(`/friend-requests/accept/${requestId}`);

      toast.success("Friend request accepted!");

      // Refresh data
      get().getReceivedRequests();
      get().getFriends();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to accept friend request";
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Decline friend request
  declineFriendRequest: async (requestId: string) => {
    try {
      set({ isLoading: true });
      await axiosInstance.put(`/friend-requests/decline/${requestId}`);

      toast.success("Friend request declined");

      // Refresh received requests
      get().getReceivedRequests();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to decline friend request";
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Get received friend requests
  getReceivedRequests: async () => {
    try {
      set({ isLoading: true });
      const response = await axiosInstance.get("/friend-requests/received");
      set({ receivedRequests: response.data as FriendRequest[] });
    } catch (error: any) {
      console.error("Failed to fetch received requests:", error);
      toast.error("Failed to load friend requests");
    } finally {
      set({ isLoading: false });
    }
  },

  // Get sent friend requests
  getSentRequests: async () => {
    try {
      set({ isLoading: true });
      const response = await axiosInstance.get("/friend-requests/sent");
      set({ sentRequests: response.data as FriendRequest[] });
    } catch (error: any) {
      console.error("Failed to fetch sent requests:", error);
      toast.error("Failed to load sent requests");
    } finally {
      set({ isLoading: false });
    }
  },

  // Get friends list
  getFriends: async () => {
    try {
      set({ isLoading: true });
      const response = await axiosInstance.get("/friend-requests/friends");
      set({ friends: response.data as any[] });
    } catch (error: any) {
      console.error("Failed to fetch friends:", error);
      toast.error("Failed to load friends");
    } finally {
      set({ isLoading: false });
    }
  },

  // Remove friend
  removeFriend: async (friendId: string) => {
    try {
      set({ isLoading: true });
      await axiosInstance.delete(`/friend-requests/remove/${friendId}`);

      toast.success("Friend removed");

      // Refresh friends list
      get().getFriends();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to remove friend";
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Check friendship status
  checkFriendshipStatus: async (userId: string): Promise<FriendshipStatus> => {
    try {
      const response = await axiosInstance.get(
        `/friend-requests/status/${userId}`,
      );
      return response.data as FriendshipStatus;
    } catch (error: any) {
      console.error("Failed to check friendship status:", error);
      return { status: "none" };
    }
  },

  // Handle new friend request (real-time)
  handleNewFriendRequest: (request: FriendRequest) => {
    set((state) => ({
      receivedRequests: [request, ...state.receivedRequests],
    }));

    toast.info(`New friend request from ${request.sender.name}`, {
      title: "Friend Request",
    });
  },

  // Handle request accepted (real-time)
  handleRequestAccepted: (request: FriendRequest) => {
    set((state) => ({
      sentRequests: state.sentRequests.filter((req) => req._id !== request._id),
    }));

    // Refresh friends list since a new friend was added
    get().getFriends();

    toast.success(`${request.receiver.name} accepted your friend request!`, {
      title: "Friend Request Accepted",
    });

    // Refresh friends list
    get().getFriends();
  },
}));

// Set up global handlers for socket events
if (typeof window !== "undefined") {
  (window as any).friendRequestStoreHandlers = {
    handleNewFriendRequest: (request: FriendRequest) => {
      useFriendRequestStore.getState().handleNewFriendRequest(request);
    },
    handleRequestAccepted: (request: FriendRequest) => {
      useFriendRequestStore.getState().handleRequestAccepted(request);
    },
  };
}
