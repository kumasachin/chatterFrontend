/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import toast from "react-hot-toast";
import io from "socket.io-client";
import { create } from "zustand";

import { BasePath } from "../config";
import { axiosInstance } from "../lib/axios";
import type {
  AuthStore,
  User,
  LoginData,
  SignupData,
  UpdateProfileData,
  UpdateUserInfoData,
} from "../types/auth";
import type { Notification } from "../types/notifications";
import { enhancedPerf as perf, timeAsync } from "../utils/enhancedPerformance";
import {
  clearUserSession,
  isUserLoggedOut,
  setLogoutFlag,
} from "../utils/sessionCleanup";
import { TokenStorage } from "../utils/tokenStorage";
import { visibilityManager } from "../utils/visibilityManager";

import { useChatWindowsStore } from "./chatWindows.store";
import useChatStore from "./messages.store";

// extend the base AuthStore with additional functions
interface AuthStoreFun extends AuthStore {
  socket: any;
  notifications: Notification[];
  checkAuth: () => Promise<void>;
  signup: (data: SignupData) => Promise<User | null>;
  login: (data: LoginData) => Promise<User | null>;
  guestLogin: () => Promise<User | null>;
  logout: () => Promise<void>;
  checkUser: () => Promise<User | null>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  updateUserInfo: (data: UpdateUserInfoData) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

// main auth store using zustand
export const useAuthStore = create<AuthStoreFun>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  notifications: [], // array to hold user notifications

  checkAuth: async () => {
    try {
      const res: any = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error: unknown) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null });
      get().disconnectSocket();
      window.location.href = "/";
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data: SignupData) => {
    set({ isSigningUp: true });
    try {
      const res: any = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Signup failed");
      return null;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data: LoginData) => {
    set({ isLoggingIn: true });
    perf.start("total-login-flow");

    try {
      // Time the API request
      const res: any = await timeAsync("login-api-request", async () => {
        return axiosInstance.post("/auth/login", data);
      });

      // Time setting auth user
      perf.start("set-auth-user");
      set({ authUser: res.data });
      perf.end("set-auth-user");

      // Time socket connection
      await timeAsync("socket-connection", async () => {
        get().connectSocket();
      });

      // Show appropriate welcome message
      if (res.data.isFirstLogin) {
        toast.success(
          "Welcome to Chatter! 🎉 Check your email for the complete guide.",
        );
      } else {
        toast.success("Welcome back! 👋");
      }

      perf.end("total-login-flow");
      perf.logReport();

      return res.data;
    } catch (error: any) {
      perf.end("total-login-flow");
      toast.error(error.response?.data?.message || "Login failed");
      return null;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  guestLogin: async () => {
    set({ isLoggingIn: true });
    perf.start("guest-login-flow");

    try {
      // Time the guest API request
      const res: any = await timeAsync("guest-login-api-request", async () => {
        return axiosInstance.post("/auth/guest-login");
      });

      // Time setting auth user
      perf.start("set-guest-auth-user");
      set({ authUser: res.data });
      perf.end("set-guest-auth-user");

      // Time socket connection
      await timeAsync("guest-socket-connection", async () => {
        get().connectSocket();
      });

      toast.success("Logged in as guest successfully");

      perf.end("guest-login-flow");
      perf.logReport();

      return res.data;
    } catch (error: any) {
      perf.end("guest-login-flow");
      toast.error(error.response?.data?.message || "Guest login failed");
      return null;
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      console.log("Starting logout process...");

      // First disconnect socket to appear offline to other users
      get().disconnectSocket();

      // Call backend logout to clear server-side session/cookie FIRST
      await axiosInstance.post("/auth/logout");

      // Clear all user session data thoroughly
      clearUserSession();
      TokenStorage.removeToken();

      // Clear auth store state
      set({ authUser: null, onlineUsers: [], notifications: [] });

      // Set logout flag to prevent auto-login
      setLogoutFlag();

      console.log("Logout successful");
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);

      // Even if backend fails, clear everything aggressively
      clearUserSession();
      TokenStorage.removeToken();
      get().disconnectSocket();

      // Clear auth store state
      set({ authUser: null, onlineUsers: [], notifications: [] });

      // Set logout flag
      setLogoutFlag();

      toast.error("Logout completed (with errors)");
    }
  },

  checkUser: async () => {
    try {
      // Check if user just logged out
      if (isUserLoggedOut()) {
        console.log("Skipping user check - user just logged out");
        return null;
      }

      // Check if we have a token
      const token = TokenStorage.getToken();
      if (!token) {
        console.log("No token found - user not authenticated");
        return null;
      }

      const res: any = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      return res.data ?? null;
    } catch (error: any) {
      console.error("Error in checkUser:", error);

      // Clear any stale tokens on 401 or other auth errors
      if (error.response?.status === 401) {
        TokenStorage.removeToken();
        set({ authUser: null });
      }

      return null;
    }
  },

  updateProfile: async (data: UpdateProfileData) => {
    set({ isUpdatingProfile: true });
    try {
      const res: any = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error in updateProfile:", error);
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  updateUserInfo: async (data: UpdateUserInfoData) => {
    set({ isUpdatingProfile: true });
    try {
      console.log("Updating user info with data:", data);
      const res: any = await axiosInstance.put("/auth/update-info", data);
      console.log("Update response:", res.data);
      set({ authUser: res.data });
      toast.success("Profile information updated successfully");
    } catch (error: any) {
      console.error("Error in updateUserInfo:", error);
      toast.error(
        error.response?.data?.message || "Failed to update profile information",
      );
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    perf.start("socket-connect-setup");
    const { authUser } = get();
    if (!authUser || get().socket?.connected) {
      perf.end("socket-connect-setup");
      return;
    }

    perf.start("socket-io-connection");
    const socket = io(BasePath, {
      auth: {
        userId: authUser._id,
      },
    } as any);
    socket.connect();
    perf.end("socket-io-connection");

    set({ socket });
    perf.end("socket-connect-setup");

    // Listen for online users
    socket.on("getOnlineUsers", (userIds: string[]) => {
      const previousOnlineUsers = get().onlineUsers;
      set({ onlineUsers: userIds });

      // Check for newly online users
      const newlyOnlineUsers = userIds.filter(
        (id) => !previousOnlineUsers.includes(id) && id !== authUser._id,
      );

      newlyOnlineUsers.forEach((userId) => {
        get().addNotification({
          type: "user_online",
          title: "User Online",
          message: `Someone is now online`,
          fromUser: {
            _id: userId,
            name: "Friend",
          },
        });
      });
    });

    // Listen for new messages
    socket.on("newMessage", async (messageData: any) => {
      if (messageData.senderId !== authUser._id) {
        // Check if the user is currently viewing this conversation
        const chatStore = useChatStore.getState();
        const chatWindowsStore = useChatWindowsStore.getState();
        const selectedUser = chatStore.selectedUser;

        // Check if there's an open, non-minimized chat window for this sender
        const openChatWindow = chatWindowsStore.openChats.find(
          (chat) => chat.user._id === messageData.senderId && !chat.minimized,
        );

        // Check if the browser tab is active
        const isTabActive = visibilityManager.isTabActive();

        // Don't show toast notification if:
        // 1. User is actively viewing this chat (selectedUser matches), OR
        // 2. There's an open, non-minimized chat window for this sender AND tab is active
        const isViewingThisChat =
          selectedUser && selectedUser._id === messageData.senderId;
        const hasActiveChatWindow = !!openChatWindow && isTabActive;

        if (!isViewingThisChat && !hasActiveChatWindow) {
          // Get sender's name from users store or use fallback
          let senderUser = chatStore.users.find(
            (user: any) => user._id === messageData.senderId,
          );
          let senderName = senderUser?.name || messageData.senderName;

          // If we don't have the sender's info, try to get it from the API
          if (!senderName && messageData.senderId) {
            try {
              const response = await axiosInstance.get(
                `/users/${messageData.senderId}`,
              );
              senderUser = response.data as User;
              senderName = senderUser?.name;
            } catch (error) {
              console.error("Failed to fetch sender info:", error);
            }
          }

          // Final fallback
          senderName = senderName || "Someone";

          get().addNotification({
            type: "message",
            title: "New Message",
            message: `${senderName}: ${messageData.content || messageData.message || "New message"}`,
            fromUser: {
              _id: messageData.senderId,
              name: senderName,
              profile: messageData.senderProfile || senderUser?.profile,
            },
          });
        }
      }
    });

    // Listen for user offline
    socket.on("userDisconnected", (userData: any) => {
      if (userData.userId !== authUser._id) {
        get().addNotification({
          type: "user_offline",
          title: "User Offline",
          message: `${userData.userName || "A friend"} went offline`,
          fromUser: {
            _id: userData.userId,
            name: userData.userName || "User",
          },
        });
      }
    });

    // Listen for friend request events
    socket.on("friendRequestReceived", (requestData: any) => {
      // Handle in friend request store via window reference
      if ((window as any).friendRequestStoreHandlers) {
        (window as any).friendRequestStoreHandlers.handleNewFriendRequest(
          requestData,
        );
      }
    });

    socket.on("friendRequestAccepted", (requestData: any) => {
      // Handle in friend request store via window reference
      if ((window as any).friendRequestStoreHandlers) {
        (window as any).friendRequestStoreHandlers.handleRequestAccepted(
          requestData,
        );
      }
    });

    console.log("Socket connected with notifications enabled");
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket && socket.connected) {
      console.log("Disconnecting socket...");

      // Emit logout event to notify server
      socket.emit("logout");

      // Disconnect the socket
      socket.disconnect();

      // Clear socket reference
      set({ socket: null });

      console.log("Socket disconnected");
    }
  },

  addNotification: (
    notificationData: Omit<Notification, "id" | "timestamp" | "read">,
  ) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    set((state) => ({
      notifications: [notification, ...state.notifications.slice(0, 49)], // Keep max 50 notifications
    }));

    // Show toast notification
    toast(notification.message, {
      icon:
        notification.type === "message"
          ? "MSG"
          : notification.type === "user_online"
            ? "●"
            : "●",
      duration: 4000,
    });
  },

  markNotificationAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },
}));
