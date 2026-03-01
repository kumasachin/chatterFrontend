// Performance monitoring utility for debugging slow login
/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

interface PerformanceMarker {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private markers: Map<string, PerformanceMarker> = new Map();
  private isEnabled: boolean;

  constructor(enabled = true) {
    this.isEnabled = enabled && typeof window !== "undefined";
  }

  start(name: string): void {
    if (!this.isEnabled) return;

    this.markers.set(name, {
      name,
      startTime: performance.now(),
    });
    console.log(`🚀 [Performance] Started: ${name}`);
  }

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

    const color = duration > 1000 ? "🔴" : duration > 500 ? "🟡" : "🟢";
    console.log(`${color} [Performance] ${name}: ${duration.toFixed(2)}ms`);

    return duration;
  }

  measure(name: string, fn: () => Promise<any>): Promise<any> {
    if (!this.isEnabled) return fn();

    this.start(name);
    return fn().finally(() => {
      this.end(name);
    });
  }

  getReport(): PerformanceMarker[] {
    return Array.from(this.markers.values()).filter(
      (m) => m.duration !== undefined,
    );
  }

  clear(): void {
    this.markers.clear();
  }

  logReport(): void {
    if (!this.isEnabled) return;

    const report = this.getReport();
    if (report.length === 0) return;

    console.group("📊 Performance Report");
    report
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .forEach((marker) => {
        const color =
          (marker.duration || 0) > 1000
            ? "🔴"
            : (marker.duration || 0) > 500
              ? "🟡"
              : "🟢";
        console.log(
          `${color} ${marker.name}: ${marker.duration?.toFixed(2)}ms`,
        );
      });
    console.groupEnd();
  }
}

// Create global instance
export const perf = new PerformanceMonitor(
  process.env.NODE_ENV === "development",
);

// Helper function for timing async operations
export const timeAsync = async <T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> => {
  return perf.measure(name, fn);
};

// Helper function for timing sync operations
export const timeSync = <T>(name: string, fn: () => T): T => {
  perf.start(name);
  try {
    return fn();
  } finally {
    perf.end(name);
  }
};
