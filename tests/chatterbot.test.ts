import { describe, it, expect, beforeEach, vi } from "vitest";

import { useAuthStore } from "../src/store/auth.store";

// Mock dependencies
vi.mock("../src/lib/axios", () => ({
  axiosInstance: { post: vi.fn(), get: vi.fn() },
}));
vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("socket.io-client", () => ({
  default: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
}));

describe("ChatterBot Auth Store Flag", () => {
  beforeEach(() => {
    useAuthStore.setState({
      authUser: null,
      isSigningUp: false,
      isLoggingIn: false,
      isUpdatingProfile: false,
      isCheckingAuth: false,
      onlineUsers: [],
      notifications: [],
      shouldOpenChatterBot: false,
    });
    vi.clearAllMocks();
  });

  it("should initialize shouldOpenChatterBot as false", () => {
    expect(useAuthStore.getState().shouldOpenChatterBot).toBe(false);
  });

  it("clearShouldOpenChatterBot should set the flag to false", () => {
    useAuthStore.setState({ shouldOpenChatterBot: true });
    expect(useAuthStore.getState().shouldOpenChatterBot).toBe(true);

    useAuthStore.getState().clearShouldOpenChatterBot();
    expect(useAuthStore.getState().shouldOpenChatterBot).toBe(false);
  });

  it("shouldOpenChatterBot can be set to true via setState", () => {
    useAuthStore.setState({ shouldOpenChatterBot: true });
    expect(useAuthStore.getState().shouldOpenChatterBot).toBe(true);
  });

  it("clearShouldOpenChatterBot is idempotent — calling twice is safe", () => {
    useAuthStore.setState({ shouldOpenChatterBot: true });
    useAuthStore.getState().clearShouldOpenChatterBot();
    useAuthStore.getState().clearShouldOpenChatterBot();
    expect(useAuthStore.getState().shouldOpenChatterBot).toBe(false);
  });
});
