/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  enhancedPerf,
  timeAsync,
  timeSync,
  PerformanceOptimizer,
} from "../src/utils/enhancedPerformance";

// Mock window.performance
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024, // 100MB
    jsHeapSizeLimit: 2 * 1024 * 1024 * 1024, // 2GB
  },
  getEntries: vi.fn(() => []),
  mark: vi.fn(),
  measure: vi.fn(),
};

// Mock PerformanceObserver
global.PerformanceObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
})) as any;

Object.defineProperty(global.PerformanceObserver, "supportedEntryTypes", {
  value: ["navigation", "resource", "measure", "mark"],
  writable: false,
});

Object.defineProperty(global, "performance", {
  value: mockPerformance,
  writable: true,
});

describe("Enhanced Performance Monitor", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Create a new enabled instance for each test
    const TestPerformanceMonitor = enhancedPerf.constructor as any;
    const testInstance = new TestPerformanceMonitor(true);

    // Replace the global instance methods
    Object.setPrototypeOf(enhancedPerf, testInstance);
    enhancedPerf.clear();

    mockPerformance.now.mockReturnValue(1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic Performance Tracking", () => {
    it("should start and end performance markers correctly", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      enhancedPerf.start("test-operation", "general");

      // Simulate time passage
      mockPerformance.now.mockReturnValue(1100);
      const duration = enhancedPerf.end("test-operation");

      expect(duration).toBe(100);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Started: test-operation"),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("test-operation: 100.00ms"),
      );

      consoleSpy.mockRestore();
    });

    it("should handle missing markers gracefully", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const duration = enhancedPerf.end("non-existent-marker");

      expect(duration).toBe(null);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("No marker found for: non-existent-marker"),
      );

      consoleWarnSpy.mockRestore();
    });

    it("should categorize operations with appropriate emojis", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      enhancedPerf.start("auth-login", "auth");
      enhancedPerf.start("api-call", "api");
      enhancedPerf.start("ui-render", "ui");

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("🔐"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("🌐"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("🎨"));

      consoleSpy.mockRestore();
    });
  });

  describe("Memory Monitoring", () => {
    it("should get current memory usage", () => {
      const memoryUsage = enhancedPerf.getMemoryUsage();

      expect(memoryUsage).toEqual({
        usedJSHeapSize: 50 * 1024 * 1024,
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 2 * 1024 * 1024 * 1024,
        timestamp: expect.any(Number),
      });
    });

    it("should detect potential memory leaks", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      // Simulate memory growth over time
      enhancedPerf["memorySnapshots"] = [
        {
          usedJSHeapSize: 50 * 1024 * 1024,
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 2 * 1024 * 1024 * 1024,
          timestamp: 1000,
        },
        {
          usedJSHeapSize: 55 * 1024 * 1024,
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 2 * 1024 * 1024 * 1024,
          timestamp: 2000,
        },
        {
          usedJSHeapSize: 60 * 1024 * 1024,
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 2 * 1024 * 1024 * 1024,
          timestamp: 3000,
        },
        {
          usedJSHeapSize: 65 * 1024 * 1024,
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 2 * 1024 * 1024 * 1024,
          timestamp: 4000,
        },
        {
          usedJSHeapSize: 70 * 1024 * 1024,
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 2 * 1024 * 1024 * 1024,
          timestamp: 5000,
        },
      ];

      const hasMemoryLeak = enhancedPerf.detectMemoryLeaks();

      expect(hasMemoryLeak).toBe(true);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Potential memory leak detected!"),
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("Performance Optimization Suggestions", () => {
    it("should provide optimization suggestions for slow operations", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const consoleGroupSpy = vi
        .spyOn(console, "group")
        .mockImplementation(() => {});
      const consoleGroupEndSpy = vi
        .spyOn(console, "groupEnd")
        .mockImplementation(() => {});

      enhancedPerf.start("slow-auth", "auth");
      mockPerformance.now.mockReturnValue(2500); // 1.5 seconds later
      enhancedPerf.end("slow-auth");

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining("Optimization Suggestions"),
      );

      consoleSpy.mockRestore();
      consoleGroupSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });

    it("should color-code performance results based on duration", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      // Test excellent performance (<100ms)
      enhancedPerf.start("fast-op", "general");
      mockPerformance.now.mockReturnValue(1050);
      enhancedPerf.end("fast-op");

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("💚"));

      // Test poor performance (>1000ms)
      enhancedPerf.start("slow-op", "general");
      mockPerformance.now.mockReturnValue(3000);
      enhancedPerf.end("slow-op");

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("🟠"));

      consoleSpy.mockRestore();
    });
  });

  describe("Report Generation", () => {
    it("should generate comprehensive performance reports", () => {
      enhancedPerf.start("test-op", "auth");
      mockPerformance.now.mockReturnValue(1200);
      enhancedPerf.end("test-op");

      const report = enhancedPerf.generateReport();

      expect(report).toHaveProperty("markers");
      expect(report).toHaveProperty("memoryUsage");
      expect(report).toHaveProperty("recommendations");
      expect(report.markers).toHaveLength(1);
      expect(report.markers[0]).toHaveProperty("name", "test-op");
      expect(report.markers[0]).toHaveProperty("category", "auth");
      expect(report.markers[0]).toHaveProperty("duration", 200);
    });

    it("should provide meaningful recommendations based on performance data", () => {
      // Add a slow operation
      enhancedPerf.start("slow-operation", "api");
      mockPerformance.now.mockReturnValue(2500);
      enhancedPerf.end("slow-operation");

      const report = enhancedPerf.generateReport();

      expect(report.recommendations).toContain(
        "Found 1 operations taking >1s. Consider optimization.",
      );
    });
  });

  describe("Async Time Tracking", () => {
    it("should track async operations correctly", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const asyncOperation = async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            mockPerformance.now.mockReturnValue(1300);
            resolve("result");
          }, 100);
        });
      };

      const result = await timeAsync("async-test", asyncOperation, "api");

      expect(result).toBe("result");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Started: async-test"),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Sync Time Tracking", () => {
    it("should track synchronous operations correctly", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const syncOperation = () => {
        mockPerformance.now.mockReturnValue(1150);
        return "sync-result";
      };

      const result = timeSync("sync-test", syncOperation, "ui");

      expect(result).toBe("sync-result");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Started: sync-test"),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Performance Optimizer Utilities", () => {
    it("should debounce function calls correctly", () => {
      vi.useFakeTimers();

      const mockFn = vi.fn();
      const debouncedFn = PerformanceOptimizer.debounce(mockFn, 100);

      debouncedFn("arg1");
      debouncedFn("arg2");
      debouncedFn("arg3");

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg3");

      vi.useRealTimers();
    });

    it("should throttle function calls correctly", () => {
      vi.useFakeTimers();

      const mockFn = vi.fn();
      const throttledFn = PerformanceOptimizer.throttle(mockFn, 100);

      throttledFn("arg1");
      throttledFn("arg2");
      throttledFn("arg3");

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg1");

      vi.advanceTimersByTime(100);

      throttledFn("arg4");

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith("arg4");

      vi.useRealTimers();
    });

    it("should memoize function results correctly", () => {
      const expensiveFunction = vi.fn((x: number, y: number) => x + y);
      const memoizedFn = PerformanceOptimizer.memoize(expensiveFunction);

      const result1 = memoizedFn(1, 2);
      const result2 = memoizedFn(1, 2);
      const result3 = memoizedFn(2, 3);

      expect(result1).toBe(3);
      expect(result2).toBe(3);
      expect(result3).toBe(5);

      expect(expensiveFunction).toHaveBeenCalledTimes(2);
    });

    it("should preload images correctly", async () => {
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: "",
      };

      vi.stubGlobal(
        "Image",
        vi.fn(() => mockImage),
      );

      const preloadPromise =
        PerformanceOptimizer.preloadImage("test-image.jpg");

      // Simulate successful image load
      mockImage.src = "test-image.jpg";
      mockImage.onload();

      await expect(preloadPromise).resolves.toBeUndefined();
    });
  });

  describe("Cleanup and Resource Management", () => {
    it("should clean up resources properly", () => {
      const disconnectSpy = vi.fn();
      enhancedPerf["resourceObserver"] = { disconnect: disconnectSpy } as any;
      enhancedPerf["navigationObserver"] = { disconnect: disconnectSpy } as any;

      enhancedPerf.start("test-marker");

      enhancedPerf.destroy();

      expect(disconnectSpy).toHaveBeenCalledTimes(2);

      const report = enhancedPerf.generateReport();
      expect(report.markers).toHaveLength(0);
    });

    it("should limit memory snapshots to prevent memory leaks", () => {
      // Simulate many memory snapshots
      for (let i = 0; i < 25; i++) {
        enhancedPerf["takeMemorySnapshot"]();
      }

      expect(enhancedPerf["memorySnapshots"].length).toBeLessThanOrEqual(20);
    });
  });

  describe("Error Handling", () => {
    it("should handle disabled performance monitoring gracefully", () => {
      const disabledPerf = new (enhancedPerf.constructor as any)(false);

      disabledPerf.start("test-op");
      const duration = disabledPerf.end("test-op");

      expect(duration).toBe(null);
    });

    it("should handle missing performance API gracefully", () => {
      const originalPerformance = global.performance;
      // @ts-expect-error - Testing missing performance API
      delete global.performance;

      const memoryUsage = enhancedPerf.getMemoryUsage();
      expect(memoryUsage).toBe(null);

      global.performance = originalPerformance;
    });
  });
});
