import type { PerformanceMetrics } from "../types/chat";

function createMetrics(): PerformanceMetrics {
    const now = performance.now();
    return {
        startTime: now,
        loadStartTime: now,
        evalCount: 0,
        evalDuration: 0
    };
}

function getLoadDuration(metrics: PerformanceMetrics): number {
    return performance.now() - metrics.loadStartTime;
}

function getTotalDuration(metrics: PerformanceMetrics): number {
    return performance.now() - metrics.startTime;
}

function addEvaluation(metrics: PerformanceMetrics, duration: number): void {
    metrics.evalCount++;
    metrics.evalDuration += duration;
}

export { createMetrics, getLoadDuration, getTotalDuration, addEvaluation };