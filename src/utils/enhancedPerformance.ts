// Enhanced Performance Monitoring and Optimization System
// This is our performance detective - it watches everything and helps us make Chatter faster
// Built with love for smooth user experiences ⚡
/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

import React from "react";

// Type definitions to keep our performance data organized
interface PerformanceMarker {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  category?: string;
  metadata?: Record<string, any>;
}

interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

interface NetworkTiming {
  dns: number;
  tcp: number;
  ssl: number;
  ttfb: number; // Time to First Byte - crucial for user experience
  download: number;
  total: number;
}

interface ResourceTiming {
  name: string;
  type: string;
  size: number;
  duration: number;
  cacheStatus: "hit" | "miss" | "unknown";
}

interface PerformanceReport {
  markers: PerformanceMarker[];
  memoryUsage: MemoryUsage[];
  networkTimings: NetworkTiming[];
  resourceTimings: ResourceTiming[];
  vitals: {
    fcp?: number; // First Contentful Paint - when users see something meaningful
    lcp?: number; // Largest Contentful Paint - when the main content loads
    fid?: number; // First Input Delay - how responsive we are
    cls?: number; // Cumulative Layout Shift - stability matters
  };
  recommendations: string[];
}

/**
 * Enhanced Performance Monitor - Our performance guardian angel
 *
 * This class helps us understand how well Chatter performs in the real world.
 * It's like having a performance expert constantly watching and giving advice.
 */
class EnhancedPerformanceMonitor {
  private markers: Map<string, PerformanceMarker> = new Map();
  private memorySnapshots: MemoryUsage[] = [];
  private resourceObserver?: PerformanceObserver;
  private navigationObserver?: PerformanceObserver;
  private isEnabled: boolean;
  private reportingInterval?: NodeJS.Timeout;

  // Performance thresholds - these help us categorize performance
  private readonly PERFORMANCE_THRESHOLDS = {
    EXCELLENT: 100, // Under 100ms - users don't notice
    GOOD: 500, // Under 500ms - feels snappy
    FAIR: 1000, // Under 1s - acceptable
    POOR: 2000, // Over 1s - users start to notice
    CRITICAL: 2000, // Over 2s - definitely needs attention
  };

  constructor(enabled = true) {
    this.isEnabled =
      enabled &&
      typeof window !== "undefined" &&
      typeof performance !== "undefined";
    if (this.isEnabled) {
      this.initializeObservers();
      this.startMemoryTracking();
    }
  }

  private initializeObservers(): void {
    if (!("PerformanceObserver" in window)) return;

    // Resource timing observer
    try {
      this.resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === "resource") {
            this.trackResourceTiming(entry as PerformanceResourceTiming);
          }
        });
      });
      this.resourceObserver.observe({ entryTypes: ["resource"] });
    } catch (error) {
      console.warn("ResourceObserver not supported:", error);
    }

    // Navigation timing observer
    try {
      this.navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === "navigation") {
            this.trackNavigationTiming(entry as PerformanceNavigationTiming);
          }
        });
      });
      this.navigationObserver.observe({ entryTypes: ["navigation"] });
    } catch (error) {
      console.warn("NavigationObserver not supported:", error);
    }
  }

  private startMemoryTracking(): void {
    // Take memory snapshot every 30 seconds
    this.reportingInterval = setInterval(() => {
      this.takeMemorySnapshot();
    }, 30000);

    // Take initial snapshot
    this.takeMemorySnapshot();
  }

  private takeMemorySnapshot(): void {
    if (!("memory" in performance)) return;

    const memory = (performance as any).memory;
    this.memorySnapshots.push({
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      timestamp: Date.now(),
    });

    // Keep only last 20 snapshots to prevent memory leak
    if (this.memorySnapshots.length > 20) {
      this.memorySnapshots = this.memorySnapshots.slice(-20);
    }
  }

  private trackResourceTiming(entry: PerformanceResourceTiming): void {
    const size = entry.transferSize || entry.encodedBodySize || 0;

    // Log slow resources (>1s)
    if (entry.duration > 1000) {
      console.warn(
        `🐌 Slow resource: ${entry.name} (${entry.duration.toFixed(2)}ms)`,
      );
    }

    // Log large resources (>1MB)
    if (size > 1024 * 1024) {
      console.warn(
        `📦 Large resource: ${entry.name} (${(size / 1024 / 1024).toFixed(2)}MB)`,
      );
    }
  }

  private trackNavigationTiming(entry: PerformanceNavigationTiming): void {
    const networkTiming: NetworkTiming = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl:
        entry.secureConnectionStart > 0
          ? entry.connectEnd - entry.secureConnectionStart
          : 0,
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart,
      total: entry.loadEventEnd - entry.fetchStart,
    };

    console.group("🌐 Navigation Timing");
    console.log(`DNS: ${networkTiming.dns.toFixed(2)}ms`);
    console.log(`TCP: ${networkTiming.tcp.toFixed(2)}ms`);
    console.log(`SSL: ${networkTiming.ssl.toFixed(2)}ms`);
    console.log(`TTFB: ${networkTiming.ttfb.toFixed(2)}ms`);
    console.log(`Download: ${networkTiming.download.toFixed(2)}ms`);
    console.log(`Total: ${networkTiming.total.toFixed(2)}ms`);
    console.groupEnd();
  }

  // Remove unused method
  static lazyLoad(callback: () => void, delay = 100): void {
    setTimeout(callback, delay);
  }
  start(
    name: string,
    category = "general",
    metadata?: Record<string, any>,
  ): void {
    if (!this.isEnabled) return;

    this.markers.set(name, {
      name,
      category,
      metadata,
      startTime: performance.now(),
    });

    const emoji = this.getCategoryEmoji(category);
    console.log(
      `${emoji} [Performance] Started: ${name}${category !== "general" ? ` (${category})` : ""}`,
    );
  }

  // Enhanced end method with automatic optimization suggestions
  end(name: string): number | null {
    if (!this.isEnabled) return null;

    const marker = this.markers.get(name);
    if (!marker) {
      console.warn(`⚠️ [Performance] No marker found for: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - marker.startTime;

    marker.endTime = endTime;
    marker.duration = duration;

    const color = this.getDurationColor(duration);
    const emoji = this.getCategoryEmoji(marker.category || "general");
    console.log(
      `${color} [Performance] ${emoji} ${name}: ${duration.toFixed(2)}ms`,
    );

    // Provide optimization suggestions
    this.suggestOptimizations(marker);

    return duration;
  }

  // Get a human-friendly color code based on performance
  private getDurationColor(duration: number): string {
    if (duration > this.PERFORMANCE_THRESHOLDS.CRITICAL) return "🔴"; // Critical - needs immediate attention
    if (duration > this.PERFORMANCE_THRESHOLDS.POOR) return "🟠"; // Poor - should be optimized
    if (duration > this.PERFORMANCE_THRESHOLDS.FAIR) return "🟡"; // Fair - could be better
    if (duration > this.PERFORMANCE_THRESHOLDS.EXCELLENT) return "🟢"; // Good - acceptable performance
    return "💚"; // Excellent - users will love this
  }

  private getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      auth: "🔐",
      api: "🌐",
      socket: "⚡",
      ui: "🎨",
      database: "💾",
      file: "📁",
      image: "🖼️",
      cache: "💰",
      general: "⏱️",
    };
    return emojis[category] || "⏱️";
  }

  private suggestOptimizations(marker: PerformanceMarker): void {
    const duration = marker.duration!;
    const category = marker.category || "general";

    if (duration > 1000) {
      const suggestions: Record<string, string[]> = {
        auth: [
          "Consider implementing authentication caching",
          "Optimize JWT token validation",
          "Use connection pooling for database queries",
        ],
        api: [
          "Implement API response caching",
          "Optimize database queries with indexes",
          "Consider API pagination for large datasets",
        ],
        socket: [
          "Optimize socket event handlers",
          "Implement connection pooling",
          "Consider message batching for high-frequency updates",
        ],
        ui: [
          "Implement React.memo for expensive components",
          "Use virtualization for large lists",
          "Optimize re-renders with useCallback/useMemo",
        ],
        file: [
          "Implement file compression",
          "Use progressive image loading",
          "Consider CDN for static assets",
        ],
      };

      const categorySuggestions = suggestions[category];
      if (categorySuggestions) {
        console.group(`💡 Optimization Suggestions for ${marker.name}`);
        categorySuggestions.forEach((suggestion) =>
          console.log(`• ${suggestion}`),
        );
        console.groupEnd();
      }
    }
  }

  // Memory monitoring methods
  getMemoryUsage(): MemoryUsage | null {
    if (!("memory" in performance)) return null;

    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      timestamp: Date.now(),
    };
  }

  detectMemoryLeaks(): boolean {
    if (this.memorySnapshots.length < 5) return false;

    const recent = this.memorySnapshots.slice(-5);
    const growth =
      recent[recent.length - 1].usedJSHeapSize - recent[0].usedJSHeapSize;
    const threshold = 10 * 1024 * 1024; // 10MB growth in recent snapshots

    if (growth > threshold) {
      console.warn("🚨 Potential memory leak detected!", {
        growth: `${(growth / 1024 / 1024).toFixed(2)}MB`,
        current: `${(recent[recent.length - 1].usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      });
      return true;
    }

    return false;
  }

  // Web Vitals tracking
  trackWebVitals(): void {
    if (!this.isEnabled) return;

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcp = entries[entries.length - 1];
      console.log(`🎨 First Contentful Paint: ${fcp.startTime.toFixed(2)}ms`);
    });
    fcpObserver.observe({ entryTypes: ["paint"] });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcp = entries[entries.length - 1];
      console.log(`🖼️ Largest Contentful Paint: ${lcp.startTime.toFixed(2)}ms`);
    });
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.log(
          `⚡ First Input Delay: ${entry.processingStart - entry.startTime}ms`,
        );
      });
    });
    fidObserver.observe({ entryTypes: ["first-input"] });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsScore = 0;
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });
      if (clsScore > 0) {
        console.log(`📐 Cumulative Layout Shift: ${clsScore.toFixed(4)}`);
      }
    });
    clsObserver.observe({ entryTypes: ["layout-shift"] });
  }

  // Enhanced reporting
  generateReport(): PerformanceReport {
    const markers = Array.from(this.markers.values()).filter(
      (m) => m.duration !== undefined,
    );
    const memoryUsage = [...this.memorySnapshots];

    // Generate recommendations based on performance data
    const recommendations: string[] = [];

    // Check for slow operations
    const slowMarkers = markers.filter((m) => m.duration! > 1000);
    if (slowMarkers.length > 0) {
      recommendations.push(
        `Found ${slowMarkers.length} operations taking >1s. Consider optimization.`,
      );
    }

    // Check memory usage
    const currentMemory = this.getMemoryUsage();
    if (currentMemory && currentMemory.usedJSHeapSize > 50 * 1024 * 1024) {
      recommendations.push(
        "High memory usage detected. Consider memory optimization.",
      );
    }

    // Check for memory leaks
    if (this.detectMemoryLeaks()) {
      recommendations.push(
        "Potential memory leak detected. Review component cleanup.",
      );
    }

    return {
      markers,
      memoryUsage,
      networkTimings: [], // Would be populated by navigation observer
      resourceTimings: [], // Would be populated by resource observer
      vitals: {}, // Would be populated by web vitals tracking
      recommendations,
    };
  }

  // Enhanced logging with categories
  logReport(): void {
    if (!this.isEnabled) return;

    const report = this.generateReport();
    if (report.markers.length === 0) return;

    console.group("📊 Enhanced Performance Report");

    // Group by category
    const categorized = report.markers.reduce(
      (acc, marker) => {
        const category = marker.category || "general";
        if (!acc[category]) acc[category] = [];
        acc[category].push(marker);
        return acc;
      },
      {} as Record<string, PerformanceMarker[]>,
    );

    Object.entries(categorized).forEach(([category, markers]) => {
      console.group(
        `${this.getCategoryEmoji(category)} ${category.toUpperCase()}`,
      );
      markers
        .sort((a, b) => (b.duration || 0) - (a.duration || 0))
        .forEach((marker) => {
          const color = this.getDurationColor(marker.duration || 0);
          console.log(
            `${color} ${marker.name}: ${marker.duration?.toFixed(2)}ms`,
          );
        });
      console.groupEnd();
    });

    // Memory report
    const currentMemory = this.getMemoryUsage();
    if (currentMemory) {
      console.group("💾 Memory Usage");
      console.log(
        `Used: ${(currentMemory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      );
      console.log(
        `Total: ${(currentMemory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      );
      console.log(
        `Limit: ${(currentMemory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
      );
      console.groupEnd();
    }

    // Recommendations
    if (report.recommendations.length > 0) {
      console.group("💡 Performance Recommendations");
      report.recommendations.forEach((rec) => console.log(`• ${rec}`));
      console.groupEnd();
    }

    console.groupEnd();
  }

  // Cleanup method
  destroy(): void {
    if (this.resourceObserver) {
      this.resourceObserver.disconnect();
    }
    if (this.navigationObserver) {
      this.navigationObserver.disconnect();
    }
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
    }
    this.markers.clear();
    this.memorySnapshots.length = 0;
  }

  // Existing methods for backward compatibility
  measure(name: string, fn: () => Promise<any>): Promise<any> {
    if (!this.isEnabled) return fn();

    this.start(name);
    return fn().finally(() => {
      this.end(name);
    });
  }

  clear(): void {
    this.markers.clear();
    this.memorySnapshots.length = 0;
  }
}

// Create enhanced global instance
export const enhancedPerf = new EnhancedPerformanceMonitor(
  process.env.NODE_ENV === "development",
);

// Initialize web vitals tracking
if (typeof window !== "undefined") {
  enhancedPerf.trackWebVitals();
}

// Helper functions with categories
export const timeAsync = async <T>(
  name: string,
  fn: () => Promise<T>,
  category = "general",
): Promise<T> => {
  enhancedPerf.start(name, category);
  try {
    return await fn();
  } finally {
    enhancedPerf.end(name);
  }
};

export const timeSync = <T>(
  name: string,
  fn: () => T,
  category = "general",
): T => {
  enhancedPerf.start(name, category);
  try {
    return fn();
  } finally {
    enhancedPerf.end(name);
  }
};

// Backward compatibility exports
export const perf = enhancedPerf;

// Performance optimization utilities
export class PerformanceOptimizer {
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number,
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  static memoize<T extends (...args: any[]) => any>(func: T): T {
    const cache = new Map();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  static async preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }

  static async preloadImages(sources: string[]): Promise<void> {
    await Promise.all(sources.map((src) => this.preloadImage(src)));
  }

  static lazyLoad(callback: () => void, delay = 100): void {
    setTimeout(callback, delay);
  }

  static measureRenderTime(
    componentName: string,
  ): (WrappedComponent: React.ComponentType<any>) => React.ComponentType<any> {
    return (WrappedComponent) => {
      return (props) => {
        React.useEffect(() => {
          enhancedPerf.start(`render-${componentName}`, "ui");
          return () => {
            enhancedPerf.end(`render-${componentName}`);
          };
        });

        return React.createElement(WrappedComponent, props);
      };
    };
  }
}

export default enhancedPerf;
