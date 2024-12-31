import newman, { NewmanRunFailure } from 'newman';
import { CollectionRunOptions, TestResult, TestFailure } from '../server/types.js';

/**
 * Safely extracts test failure information from a Newman failure object
 */
function extractFailureInfo(failure: NewmanRunFailure): TestFailure | null {
    try {
        if (!failure.error || !failure.source?.request) {
            return null;
        }

        const { error, source } = failure;
        const { request } = source;

        // Ensure we have all required properties
        if (!error.test || !error.message || !request.method || !request.url) {
            return null;
        }

        return {
            name: error.test,
            error: error.message,
            request: {
                method: request.method,
                url: request.url.toString()
            }
        };
    } catch {
        return null;
    }
}

export class NewmanRunner {
    /**
     * Runs a Postman collection using Newman
     * @param options Collection run options
     * @returns Test results
     */
    async runCollection(options: CollectionRunOptions): Promise<TestResult> {
        return new Promise((resolve, reject) => {
            const startTime = new Date().toISOString();
            
            newman.run({
                collection: options.collection,
                environment: options.environment,
                globals: options.globals,
                iterationCount: options.iterationCount,
                reporters: 'cli'
            }, (err, summary) => {
                if (err) {
                    reject(err);
                    return;
                }

                const endTime = new Date().toISOString();
                
                // Format the results
                const result: TestResult = {
                    success: summary.run.failures.length === 0,
                    summary: {
                        total: summary.run.stats.tests.total || 0,
                        failed: summary.run.stats.tests.failed || 0,
                        passed: (summary.run.stats.tests.total || 0) - (summary.run.stats.tests.failed || 0)
                    },
                    failures: (summary.run.failures || [])
                        .map(extractFailureInfo)
                        .filter((failure): failure is TestFailure => failure !== null),
                    timings: {
                        started: startTime,
                        completed: endTime,
                        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
                    }
                };

                resolve(result);
            });
        });
    }
}
