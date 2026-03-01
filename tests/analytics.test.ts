import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { analytics, useAnalytics } from "../src/utils/analytics";

// Mock axios
vi.mock("../src/lib/axios", () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock enhanced performance
vi.mock("../src/utils/enhancedPerformance", () => ({
  enhancedPerf: {
    getMemoryUsage: vi.fn(() => ({
      usedJSHeapSize: 50 * 1024 * 1024,
      totalJSHeapSize: 100 * 1024 * 1024,
      jsHeapSizeLimit: 2 * 1024 * 1024 * 1024,
      timestamp: Date.now(),
    })),
  },
}));

// Mock window and performance objects
const mockWindow = {
  location: { href: "http://localhost:3000/test" },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  innerWidth: 1920,
  innerHeight: 1080,
};

const mockDocument = {
  referrer: "http://localhost:3000/",
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  visibilityState: "visible",
};

const mockNavigator = {
  userAgent: "Mozilla/5.0 (test)",
  language: "en-US",
  platform: "MacIntel",
  cookieEnabled: true,
};

const mockScreen = {
  width: 2560,
  height: 1600,
};

const mockPerformance = {
  now: vi.fn(() => Date.now()),
  getEntriesByType: vi.fn(() => []),
};

// Set up global mocks
Object.defineProperty(global, "window", { value: mockWindow, writable: true });
Object.defineProperty(global, "document", {
  value: mockDocument,
  writable: true,
});
Object.defineProperty(global, "navigator", {
  value: mockNavigator,
  writable: true,
});
Object.defineProperty(global, "screen", { value: mockScreen, writable: true });
Object.defineProperty(global, "performance", {
  value: mockPerformance,
  writable: true,
});

describe("Analytics Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Enable analytics for testing by mocking environment
    vi.stubEnv("NODE_ENV", "test");
    Object.defineProperty(process, "env", {
      value: { ...process.env, VITE_ENABLE_ANALYTICS: "true" },
      writable: true,
    });

    // Reset analytics state
    analytics.setEnabled(true);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with correct default settings", () => {
      expect(analytics.isAnalyticsEnabled()).toBe(true);
    });

    it("should track session start on initialization", () => {
      const sessionAnalytics = analytics.getSessionAnalytics();

      expect(sessionAnalytics).toHaveProperty("sessionDuration");
      expect(sessionAnalytics).toHaveProperty("sessionStart");
      expect(sessionAnalytics).toHaveProperty(
        "currentUrl",
        "http://localhost:3000/test",
      );
      expect(sessionAnalytics).toHaveProperty(
        "userAgent",
        "Mozilla/5.0 (test)",
      );
      expect(sessionAnalytics).toHaveProperty("language", "en-US");
      expect(sessionAnalytics).toHaveProperty("platform", "MacIntel");
    });
  });

  describe("Activity Tracking", () => {
    it("should track user activities correctly", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      analytics.trackActivity("test-action", { key: "value" });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Activity: test-action"),
        expect.objectContaining({ key: "value" }),
      );

      consoleSpy.mockRestore();
    });

    it("should track authentication events", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      analytics.trackAuth("login", { userId: "123" });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Activity: auth-login"),
        expect.objectContaining({ userId: "123" }),
      );

      consoleSpy.mockRestore();
    });

    it("should track feature usage", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      analytics.trackFeatureUsage("chat-interface", { chatId: "abc123" });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Activity: feature-usage"),
        expect.objectContaining({
          feature: "chat-interface",
          chatId: "abc123",
        }),
      );

      consoleSpy.mockRestore();
    });

    it("should track messaging events", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      analytics.trackMessage("send", {
        messageId: "msg123",
        receiverId: "user456",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Activity: message-send"),
        expect.objectContaining({
          messageId: "msg123",
          receiverId: "user456",
        }),
      );

      consoleSpy.mockRestore();
    });

    it("should track AI interactions", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      analytics.trackAIInteraction("query", {
        query: "What is Chatter?",
        botId: "chatterbot",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Activity: ai-query"),
        expect.objectContaining({
          query: "What is Chatter?",
          botId: "chatterbot",
        }),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Performance Tracking", () => {
    it("should track performance metrics", () => {
      analytics.trackPerformance("api-call", 150, "api");

      const sessionAnalytics = analytics.getSessionAnalytics();
      expect(sessionAnalytics.queuedPerformanceMetrics).toBe(1);
    });

    it("should warn about slow operations", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      analytics.trackPerformance("slow-operation", 2500, "database");

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Slow operation detected: slow-operation (2500ms)",
        ),
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("Error Tracking", () => {
    it("should track errors with context", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const testError = new Error("Test error message");

      analytics.trackError(testError, "test-context");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Activity: error"),
        expect.objectContaining({
          message: "Test error message",
          context: "test-context",
        }),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Session Analytics", () => {
    it("should provide comprehensive session information", () => {
      const sessionAnalytics = analytics.getSessionAnalytics();

      expect(sessionAnalytics).toEqual({
        sessionDuration: expect.any(Number),
        sessionStart: expect.any(String),
        currentUrl: "http://localhost:3000/test",
        referrer: "http://localhost:3000/",
        userAgent: "Mozilla/5.0 (test)",
        language: "en-US",
        platform: "MacIntel",
        screenResolution: "2560x1600",
        viewportSize: "1920x1080",
        memoryUsage: {
          used: "50.00MB",
          total: "100.00MB",
          limit: "2048.00MB",
        },
        queuedActivities: expect.any(Number),
        queuedPerformanceMetrics: expect.any(Number),
      });
    });

    it("should track session duration correctly", () => {
      const initialAnalytics = analytics.getSessionAnalytics();

      // Advance time by 30 seconds
      vi.advanceTimersByTime(30000);

      const laterAnalytics = analytics.getSessionAnalytics();

      expect(laterAnalytics.sessionDuration).toBeGreaterThanOrEqual(
        initialAnalytics.sessionDuration + 30000,
      );
    });
  });

  describe("useAnalytics Hook", () => {
    it("should provide all analytics methods", () => {
      const hook = useAnalytics();

      expect(hook).toHaveProperty("trackActivity");
      expect(hook).toHaveProperty("trackPerformance");
      expect(hook).toHaveProperty("trackInteraction");
      expect(hook).toHaveProperty("trackError");
      expect(hook).toHaveProperty("trackFeatureUsage");
      expect(hook).toHaveProperty("trackAuth");
      expect(hook).toHaveProperty("trackMessage");
      expect(hook).toHaveProperty("trackAIInteraction");
      expect(hook).toHaveProperty("getSystemHealth");
      expect(hook).toHaveProperty("getApplicationMetrics");
      expect(hook).toHaveProperty("getSessionAnalytics");
      expect(hook).toHaveProperty("flush");
      expect(hook).toHaveProperty("isEnabled");
    });

    it("should return current enabled state", () => {
      const hook = useAnalytics();
      expect(hook.isEnabled).toBe(true);

      analytics.setEnabled(false);
      const disabledHook = useAnalytics();
      expect(disabledHook.isEnabled).toBe(false);
    });
  });

  describe("Configuration and Control", () => {
    it("should allow enabling and disabling analytics", () => {
      expect(analytics.isAnalyticsEnabled()).toBe(true);

      analytics.setEnabled(false);
      expect(analytics.isAnalyticsEnabled()).toBe(false);

      analytics.setEnabled(true);
      expect(analytics.isAnalyticsEnabled()).toBe(true);
    });

    it("should clear queues when disabled", () => {
      analytics.trackActivity("test-before-disable");
      analytics.trackPerformance("test-perf", 100);

      let sessionAnalytics = analytics.getSessionAnalytics();
      expect(sessionAnalytics.queuedActivities).toBeGreaterThan(0);
      expect(sessionAnalytics.queuedPerformanceMetrics).toBeGreaterThan(0);

      analytics.setEnabled(false);

      sessionAnalytics = analytics.getSessionAnalytics();
      expect(sessionAnalytics.queuedActivities).toBe(0);
      expect(sessionAnalytics.queuedPerformanceMetrics).toBe(0);
    });
  });

  describe("Data Quality and Privacy", () => {
    it("should include proper metadata in tracked activities", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      analytics.trackActivity("user-interaction", { button: "submit" });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          button: "submit",
          url: "http://localhost:3000/test",
          userAgent: "Mozilla/5.0 (test)",
          timestamp: expect.any(String),
          sessionDuration: expect.any(Number),
        }),
      );

      consoleSpy.mockRestore();
    });

    it("should generate valid timestamps", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      analytics.trackActivity("timestamp-test");

      const lastCall = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      const metadata = lastCall[1];

      expect(metadata.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Real-world Usage Patterns", () => {
    it("should handle rapid successive events", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      // Simulate rapid user interactions
      for (let i = 0; i < 10; i++) {
        analytics.trackActivity(`click-${i}`, { timestamp: i });
      }

      expect(consoleSpy).toHaveBeenCalledTimes(10);

      const sessionAnalytics = analytics.getSessionAnalytics();
      expect(sessionAnalytics.queuedActivities).toBe(10);

      consoleSpy.mockRestore();
    });

    it("should provide meaningful interaction tracking", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      analytics.trackInteraction("send-message-button", "click", {
        chatId: "chat123",
        messageLength: 45,
        hasAttachments: false,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Activity: interaction-click"),
        expect.objectContaining({
          element: "send-message-button",
          chatId: "chat123",
          messageLength: 45,
          hasAttachments: false,
        }),
      );

      consoleSpy.mockRestore();
    });
  });
});
