/* eslint-disable @typescript-eslint/no-explicit-any */
import toast from "react-hot-toast";
import { create } from "zustand";

import { axiosInstance } from "../lib/axios";
import type { User } from "../types/auth";
import type { Message, ChatStore } from "../types/messages";

import { useAuthStore } from "./auth.store";

interface ChatStoreFun extends Omit<ChatStore, "messages"> {
  messages: Record<string, Message[]>;
  totalUsers: number;

  getUsers: (search?: string) => Promise<void>;
  searchUsers: (searchTerm: string) => Promise<void>; // for search functionality
  setUsers: (users: User[]) => void;
  resetUsers: () => void; // reset state
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (messageData: {
    content: string;
    senderId?: string;
    recipientId: string;
  }) => Promise<void>;
  subscribeToMessages: (recipient: User) => void;
  unsubscribeFromMessages: (recipientId: string) => void;
  setSelectedUser: (selectedUser: User | null) => void;
}

const messageListeners: { [recipientId: string]: (msg: Message) => void } = {};

export const useChatStore = create<ChatStoreFun>((set, get) => ({
  messages: {},
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  totalUsers: 0,

  getUsers: async (search = "") => {
    set({ isUsersLoading: true });

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      const queryString = params.toString();
      const url = queryString
        ? `/messages/users?${queryString}`
        : "/messages/users";
      const res: any = await axiosInstance.get(url);
      const { users, totalUsers } = res.data;

      set({
        users,
        totalUsers,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  searchUsers: async (searchTerm: string) => {
    await get().getUsers(searchTerm);
  },

  resetUsers: () => {
    set({
      users: [],
      totalUsers: 0,
    });
  },

  setUsers: (users: User[]) => {
    set({ users });
  },

  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res: any = await axiosInstance.get(`/messages/${userId}`);
      set((state) => ({
        messages: {
          ...state.messages,
          [userId]: res.data || [],
        },
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    try {
      const res: any = await axiosInstance.post(
        `/messages/send/${messageData.recipientId}`,
        messageData,
      );

      set((state) => ({
        messages: {
          ...state.messages,
          [messageData.recipientId]: [
            ...(state.messages[messageData.recipientId] || []),
            res.data,
          ],
        },
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: (recipient: User) => {
    const recipientId = recipient._id;
    if (!recipientId || messageListeners[recipientId]) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      toast.error("Socket connection is not available");
      return;
    }

    const handler = (newMessage: Message) => {
      const isRelevant =
        newMessage.senderId === recipientId ||
        newMessage.recipientId === recipientId;

      if (!isRelevant) return;

      set((state) => ({
        messages: {
          ...state.messages,
          [recipientId]: [...(state.messages[recipientId] || []), newMessage],
        },
      }));
    };

    socket.on("newMessage", handler);
    messageListeners[recipientId] = handler;
  },

  unsubscribeFromMessages: (recipientId: string) => {
    const socket = useAuthStore.getState().socket;
    const handler = messageListeners[recipientId];
    if (socket && handler) {
      socket.off("newMessage", handler);
      delete messageListeners[recipientId];
    }
  },

  setSelectedUser: (selectedUser: User | null) => set({ selectedUser }),
}));

export default useChatStore;
