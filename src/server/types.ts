// Types for Newman runner input
export interface CollectionRunOptions {
    collection: string;      // Path or URL to Postman collection
    environment?: string;    // Optional path or URL to environment file
    globals?: string;        // Optional path or URL to globals file
    iterationCount?: number; // Optional number of iterations to run
}

// Types for test results
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

// MCP Tool response type
export interface McpToolResponse {
    content: [{
        type: "text";
        text: string;
    }];
}
