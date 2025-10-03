// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): void {
    this.metrics.set(label, performance.now());
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(label);
    if (!startTime) {
      console.warn(`No start time found for label: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(label);
    
    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTiming(label);
    return fn().finally(() => {
      this.endTiming(label);
    });
  }

  measureSync<T>(label: string, fn: () => T): T {
    this.startTiming(label);
    try {
      return fn();
    } finally {
      this.endTiming(label);
    }
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Web Vitals monitoring
export const monitorWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Core Web Vitals
  const vitals = ['CLS', 'FID', 'FCP', 'LCP', 'TTFB'];

  vitals.forEach((metric) => {
    // @ts-ignore
    if ('web-vital' in window) {
      // @ts-ignore
      window.webVitals.getCLS(console.log);
      // @ts-ignore
      window.webVitals.getFID(console.log);
      // @ts-ignore
      window.webVitals.getFCP(console.log);
      // @ts-ignore
      window.webVitals.getLCP(console.log);
      // @ts-ignore
      window.webVitals.getTTFB(console.log);
    }
  });
};

// Memory usage monitoring
export const monitorMemory = () => {
  if (typeof window === 'undefined' || !('memory' in performance)) return;

  const memory = (performance as any).memory;
  return {
    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
  };
};

// Network monitoring
export const monitorNetwork = () => {
  if (typeof window === 'undefined' || !('connection' in navigator)) return null;

  const connection = (navigator as any).connection;
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
};

// Error tracking
export const trackError = (error: Error, context?: string) => {
  console.error('Error tracked:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  });

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Send to Sentry, LogRocket, etc.
  }
};

// Performance decorator
export function measurePerformance(label: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const monitor = PerformanceMonitor.getInstance();
      return monitor.measureAsync(`${label}.${propertyKey}`, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}
