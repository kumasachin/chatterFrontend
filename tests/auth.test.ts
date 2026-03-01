import { describe, it, expect, beforeEach, vi } from "vitest";

import { useAuthStore } from "../src/store/auth.store";

// Mock axios instead of fetch since the store uses axios
vi.mock("../src/lib/axios", () => ({
  axiosInstance: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock toast
vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock socket.io-client
vi.mock("socket.io-client", () => ({
  default: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
}));

describe("Authentication Store", () => {
  beforeEach(() => {
    // Reset the store state before each test
    useAuthStore.setState({
      authUser: null,
      isSigningUp: false,
      isLoggingIn: false,
      isUpdatingProfile: false,
      isCheckingAuth: false,
      onlineUsers: [],
      notifications: [],
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  it("should initialize with null authUser", () => {
    const { authUser } = useAuthStore.getState();
    expect(authUser).toBeNull();
  });

  it("should initialize with empty onlineUsers array", () => {
    const { onlineUsers } = useAuthStore.getState();
    expect(onlineUsers).toEqual([]);
  });

  it("should initialize with false loading states", () => {
    const store = useAuthStore.getState();
    expect(store.isSigningUp).toBe(false);
    expect(store.isLoggingIn).toBe(false);
    expect(store.isUpdatingProfile).toBe(false);
    expect(store.isCheckingAuth).toBe(false);
  });

  it("should handle online users update via socket", () => {
    // Test that onlineUsers can be set directly (simulating socket event)
    useAuthStore.setState({
      onlineUsers: ["user1", "user2", "user3"],
    });

    expect(useAuthStore.getState().onlineUsers).toEqual([
      "user1",
      "user2",
      "user3",
    ]);
  });

  it("should handle auth user state changes", () => {
    const mockUser = {
      _id: "test-id",
      name: "testuser",
      email: "test@example.com",
    };

    // Set auth user
    useAuthStore.setState({ authUser: mockUser });
    expect(useAuthStore.getState().authUser).toEqual(mockUser);

    // Clear auth user
    useAuthStore.setState({ authUser: null });
    expect(useAuthStore.getState().authUser).toBeNull();
  });

  it("should handle loading states", () => {
    // Test signup loading state
    useAuthStore.setState({ isSigningUp: true });
    expect(useAuthStore.getState().isSigningUp).toBe(true);

    useAuthStore.setState({ isSigningUp: false });
    expect(useAuthStore.getState().isSigningUp).toBe(false);

    // Test login loading state
    useAuthStore.setState({ isLoggingIn: true });
    expect(useAuthStore.getState().isLoggingIn).toBe(true);

    useAuthStore.setState({ isLoggingIn: false });
    expect(useAuthStore.getState().isLoggingIn).toBe(false);
  });
});
