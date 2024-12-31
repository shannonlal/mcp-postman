export interface CollectionRunOptions {
    collection: string;
    environment?: string;
    globals?: string;
    iterationCount?: number;
}
export interface TestSummary {
    total: number;
    failed: number;
    passed: number;
}
export interface TestFailure {
    name: string;
    error: string;
    request: {
        method: string;
        url: string;
    };
}
export interface TestTimings {
    started: string;
    completed: string;
    duration: number;
}
export interface TestResult {
    success: boolean;
    summary: TestSummary;
    failures: TestFailure[];
    timings: TestTimings;
}
export interface McpToolResponse {
    content: [
        {
            type: "text";
            text: string;
        }
    ];
}
