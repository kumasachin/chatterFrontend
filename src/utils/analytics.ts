// Analytics Service for Frontend
// Comprehensive tracking of user interactions, performance metrics, and system health
// This service helps us understand how users interact with Chatter and optimize accordingly
/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

import React from "react";

import { axiosInstance } from "../lib/axios";

import { enhancedPerf } from "./enhancedPerformance";

// Type definitions for better code clarity and maintainability
interface UserActivity {
  action: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

interface PerformanceMetric {
  timing: any;
  category: string;
  name: string;
  duration: number;
}

interface SystemHealth {
  status: string;
  timestamp: string;
  services: Record<string, string>;
  performance: Record<string, string>;
}

interface ApplicationMetrics {
  users: {
    total: number;
    active: number;
    new: number;
    retentionRate: number;
  };
  messages: {
    total: number;
    recent: number;
    averagePerUser: number;
  };
  engagement: {
    dailyActiveUsers: number;
    messageGrowth: number;
    platformHealth: string;
  };
}

/**
 * Analytics Service - The brain behind Chatter's data insights
 *
 * This service carefully tracks user behavior while respecting privacy.
 * It helps us understand what works well and what needs improvement.
 */
class AnalyticsService {
  private isEnabled: boolean;
  private sessionStartTime: number;
  private activityQueue: UserActivity[] = [];
  private performanceQueue: PerformanceMetric[] = [];

  // Configuration constants - easy to adjust as needed
  private readonly BATCH_UPLOAD_INTERVAL = 30000; // 30 seconds feels right
  private readonly MAX_QUEUE_SIZE = 50; // Prevent memory issues

  constructor() {
    // Only enable analytics in production or when explicitly requested
    // This ensures we don't pollute development with unnecessary data
    this.isEnabled =
      import.meta.env.PROD ||
      import.meta.env.VITE_ENABLE_ANALYTICS === "true" ||
      import.meta.env?.VITE_TEST_ANALYTICS === "true";

    this.sessionStartTime = Date.now();

    if (this.isEnabled) {
      this.initializeBatchUpload();
      this.trackPageLoad();
      this.trackSessionStart();
    }
  }

  // Set up automatic data uploading to keep memory usage reasonable
  private initializeBatchUpload(): void {
    setInterval(() => {
      this.flushQueues();
    }, this.BATCH_UPLOAD_INTERVAL);

    // Flush on page unload
    window.addEventListener("beforeunload", () => {
      this.flushQueues(true);
    });

    // Flush on page visibility change (when user switches tabs)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.flushQueues();
      }
    });
  }

  // Track user activity
  trackActivity(action: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const activity: UserActivity = {
      action,
      metadata: {
        ...metadata,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionDuration: Date.now() - this.sessionStartTime,
      },
      timestamp: new Date(),
    };

    this.activityQueue.push(activity);

    // Log for development
    if (import.meta.env.DEV) {
      console.log(`📊 Activity: ${action}`, metadata);
    }

    // Don't let the queue grow too large - flush if needed
    if (this.activityQueue.length >= this.MAX_QUEUE_SIZE) {
      this.flushQueues();
    }
  }

  // Track performance metrics
  trackPerformance(
    name: string,
    duration: number,
    category: string = "general",
  ): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      timing: {
        name,
        duration,
        category,
        timestamp: Date.now(),
        url: window.location.href,
      },
      category,
      name,
      duration,
    };

    this.performanceQueue.push(metric);

    // Log slow operations
    if (duration > 1000) {
      console.warn(`🐌 Slow operation detected: ${name} (${duration}ms)`);
    }

    // Keep performance data manageable
    if (this.performanceQueue.length >= this.MAX_QUEUE_SIZE) {
      this.flushQueues();
    }
  }

  // Track page load performance
  private trackPageLoad(): void {
    window.addEventListener("load", () => {
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        this.trackPerformance(
          "page-load",
          navigation.loadEventEnd - navigation.fetchStart,
          "navigation",
        );
        this.trackPerformance(
          "dom-content-loaded",
          navigation.domContentLoadedEventEnd - navigation.fetchStart,
          "navigation",
        );
        this.trackPerformance(
          "first-paint",
          navigation.loadEventEnd - navigation.fetchStart,
          "navigation",
        );
      }
    });
  }

  // Track session start
  private trackSessionStart(): void {
    this.trackActivity("session-start", {
      referrer: document.referrer,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    });
  }

  // Track user interactions
  trackInteraction(
    element: string,
    action: string,
    metadata?: Record<string, any>,
  ): void {
    this.trackActivity(`interaction-${action}`, {
      element,
      ...metadata,
    });
  }

  // Track errors
  trackError(error: Error, context?: string): void {
    this.trackActivity("error", {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href,
    });
  }

  // Track feature usage
  trackFeatureUsage(feature: string, metadata?: Record<string, any>): void {
    this.trackActivity("feature-usage", {
      feature,
      ...metadata,
    });
  }

  // Track authentication events
  trackAuth(
    event: "login" | "logout" | "signup" | "guest-login",
    metadata?: Record<string, any>,
  ): void {
    this.trackActivity(`auth-${event}`, metadata);
  }

  // Track messaging events
  trackMessage(
    event: "send" | "receive" | "read",
    metadata?: Record<string, any>,
  ): void {
    this.trackActivity(`message-${event}`, metadata);
  }

  // Track AI interactions
  trackAIInteraction(
    event: "query" | "response" | "error",
    metadata?: Record<string, any>,
  ): void {
    this.trackActivity(`ai-${event}`, metadata);
  }

  // Get system health
  async getSystemHealth(): Promise<SystemHealth | null> {
    try {
      const response = await axiosInstance.get("/api/analytics/health");
      return (response.data as any).data;
    } catch (error) {
      console.error("Failed to fetch system health:", error);
      return null;
    }
  }

  // Get application metrics (admin only)
  async getApplicationMetrics(): Promise<ApplicationMetrics | null> {
    try {
      const response = await axiosInstance.get("/api/analytics/metrics");
      return (response.data as any).data;
    } catch (error) {
      console.error("Failed to fetch application metrics:", error);
      return null;
    }
  }

  // Flush queued data to server
  private async flushQueues(isBeforeUnload: boolean = false): Promise<void> {
    if (this.activityQueue.length === 0 && this.performanceQueue.length === 0) {
      return;
    }

    const activities = [...this.activityQueue];
    const performances = [...this.performanceQueue];

    this.activityQueue = [];
    this.performanceQueue = [];

    try {
      // Send activity data
      if (activities.length > 0) {
        await Promise.all(
          activities.map((activity) =>
            axiosInstance
              .post("/api/analytics/activity", activity)
              .catch((err) => {
                console.error("Failed to send activity data:", err);
              }),
          ),
        );
      }

      // Send performance data
      if (performances.length > 0) {
        await Promise.all(
          performances.map((metric) =>
            axiosInstance
              .post("/api/analytics/performance", metric)
              .catch((err) => {
                console.error("Failed to send performance data:", err);
              }),
          ),
        );
      }

      if (import.meta.env.DEV) {
        console.log(
          `📊 Flushed ${activities.length} activities and ${performances.length} performance metrics`,
        );
      }
    } catch (error) {
      console.error("Failed to flush analytics data:", error);

      // Only re-queue data if we have space and it's not a page unload situation
      if (!isBeforeUnload && this.activityQueue.length < this.MAX_QUEUE_SIZE) {
        this.activityQueue.unshift(
          ...activities.slice(
            0,
            this.MAX_QUEUE_SIZE - this.activityQueue.length,
          ),
        );
        this.performanceQueue.unshift(
          ...performances.slice(
            0,
            this.MAX_QUEUE_SIZE - this.performanceQueue.length,
          ),
        );
      }
    }
  }

  // Manual flush for critical events
  flush(): Promise<void> {
    return this.flushQueues();
  }

  // Get session analytics
  getSessionAnalytics(): Record<string, any> {
    const sessionDuration = Date.now() - this.sessionStartTime;
    const memoryUsage = enhancedPerf.getMemoryUsage();

    return {
      sessionDuration,
      sessionStart: new Date(this.sessionStartTime).toISOString(),
      currentUrl: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      memoryUsage: memoryUsage
        ? {
            used: `${(memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            total: `${(memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            limit: `${(memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
          }
        : null,
      queuedActivities: this.activityQueue.length,
      queuedPerformanceMetrics: this.performanceQueue.length,
    };
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;

    if (!enabled) {
      this.activityQueue = [];
      this.performanceQueue = [];
    }
  }

  // Check if analytics is enabled
  isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }
}

// Create global analytics instance
export const analytics = new AnalyticsService();

// React hook for analytics
export const useAnalytics = () => {
  return {
    trackActivity: analytics.trackActivity.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackInteraction: analytics.trackInteraction.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackAuth: analytics.trackAuth.bind(analytics),
    trackMessage: analytics.trackMessage.bind(analytics),
    trackAIInteraction: analytics.trackAIInteraction.bind(analytics),
    getSystemHealth: analytics.getSystemHealth.bind(analytics),
    getApplicationMetrics: analytics.getApplicationMetrics.bind(analytics),
    getSessionAnalytics: analytics.getSessionAnalytics.bind(analytics),
    flush: analytics.flush.bind(analytics),
    isEnabled: analytics.isAnalyticsEnabled(),
  };
};

// Higher-order component for automatic page tracking
export const withAnalytics = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pageName: string,
) => {
  return (props: P) => {
    React.useEffect(() => {
      analytics.trackActivity("page-view", {
        page: pageName,
        timestamp: new Date().toISOString(),
      });

      // Track page exit
      return () => {
        analytics.trackActivity("page-exit", {
          page: pageName,
          timestamp: new Date().toISOString(),
        });
      };
    }, []);

    return React.createElement(WrappedComponent, props);
  };
};

// Performance tracking decorators
export const trackAsyncPerformance = (
  name: string,
  category: string = "api",
) => {
  return (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - startTime;
        analytics.trackPerformance(name, duration, category);
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        analytics.trackPerformance(`${name}-error`, duration, category);
        analytics.trackError(error as Error, name);
        throw error;
      }
    };

    return descriptor;
  };
};

export default analytics;
