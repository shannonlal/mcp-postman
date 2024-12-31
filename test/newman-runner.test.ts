import { describe, it, expect, vi } from 'vitest';
import { NewmanRunner } from '../src/newman/runner.js';
import newman from 'newman';

// Mock newman module
vi.mock('newman', () => ({
    default: {
        run: vi.fn()
    }
}));

describe('NewmanRunner', () => {
    const runner = new NewmanRunner();

    it('should successfully run a collection', async () => {
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

        (newman.run as any).mockImplementation((options: any, callback: any) => {
            callback(null, mockSummary);
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

    it('should handle newman run errors', async () => {
        // Mock newman error
        (newman.run as any).mockImplementation((options: any, callback: any) => {
            callback(new Error('Failed to load collection'));
        });

        await expect(runner.runCollection({
            collection: './invalid-collection.json'
        })).rejects.toThrow('Failed to load collection');
    });

    it('should handle invalid failure objects', async () => {
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

        (newman.run as any).mockImplementation((options: any, callback: any) => {
            callback(null, mockSummary);
        });

        const result = await runner.runCollection({
            collection: './test-collection.json'
        });

        expect(result.success).toBe(false);
        expect(result.failures).toHaveLength(0); // Invalid failure should be filtered out
    });
});
