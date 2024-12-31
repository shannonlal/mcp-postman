import { describe, it, expect, vi } from 'vitest';
import { NewmanRunner } from '../src/newman/runner.js';
import newman, { NewmanRunSummary } from 'newman';
import { EventEmitter } from 'events';

// Mock newman module
vi.mock('newman', () => ({
    default: {
        run: vi.fn()
    }
}));

describe('NewmanRunner', () => {
    const runner = new NewmanRunner();

    it('should successfully run a collection', async (): Promise<void> => {
        // Mock successful newman run
        const mockSummary = {
            run: {
                stats: {
                    tests: {
                        total: 5,
                        failed: 1,
                    }
                },
                failures: [{
                    error: {
                        test: 'Test case 1',
                        message: 'Expected 200 but got 404'
                    },
                    source: {
                        request: {
                            method: 'GET',
                            url: {
                                toString: () => 'https://api.example.com/test'
                            }
                        }
                    }
                }]
            }
        };

        vi.mocked(newman.run).mockImplementation(function(callback: (err: Error | null, summary: NewmanRunSummary) => void) {
            callback(null, mockSummary as unknown as NewmanRunSummary);
            return new EventEmitter();
        });

        const result = await runner.runCollection({
            collection: './test-collection.json'
        });

        expect(result.success).toBe(false);
        expect(result.summary.total).toBe(5);
        expect(result.summary.failed).toBe(1);
        expect(result.summary.passed).toBe(4);
        expect(result.failures).toHaveLength(1);
        expect(result.failures[0]).toEqual({
            name: 'Test case 1',
            error: 'Expected 200 but got 404',
            request: {
                method: 'GET',
                url: 'https://api.example.com/test'
            }
        });
    });

    it('should handle newman run errors', async (): Promise<void> => {
        // Mock newman error
        vi.mocked(newman.run).mockImplementation(function(callback: (err: Error | null, summary: NewmanRunSummary) => void) {
            callback(new Error('Failed to load collection'), {} as NewmanRunSummary);
            return new EventEmitter();
        });

        await expect(runner.runCollection({
            collection: './invalid-collection.json'
        })).rejects.toThrow('Failed to load collection');
    });

    it('should handle invalid failure objects', async (): Promise<void> => {
        // Mock newman run with invalid failure object
        const mockSummary = {
            run: {
                stats: {
                    tests: {
                        total: 1,
                        failed: 1,
                    }
                },
                failures: [{
                    // Missing required properties
                    error: {},
                    source: {}
                }]
            }
        };

        vi.mocked(newman.run).mockImplementation(function(callback: (err: Error | null, summary: NewmanRunSummary) => void) {
            callback(null, mockSummary as unknown as NewmanRunSummary);
            return new EventEmitter();
        });

        const result = await runner.runCollection({
            collection: './test-collection.json'
        });

        expect(result.success).toBe(false);
        expect(result.failures).toHaveLength(0); // Invalid failure should be filtered out
    });
});
