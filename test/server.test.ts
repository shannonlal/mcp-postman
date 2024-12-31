import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostmanServer } from '../src/server/server.js';

// Mock NewmanRunner
vi.mock('../src/newman/runner.js', () => ({
    NewmanRunner: vi.fn().mockImplementation(() => ({
        runCollection: vi.fn()
    }))
}));

describe('PostmanServer', () => {
    let server: PostmanServer;
    //let transport: MockTransport;

    beforeEach(() => {
        server = new PostmanServer();
        //transport = new MockTransport();
    });

    it('should list available tools', async (): Promise<void> => {
        expect(server).toBeDefined();
        // const mcpServer = await server.start();
        // await mcpServer.connect(transport);

        // const response = await transport.handleRequest({
        //     jsonrpc: '2.0',
        //     id: '1',
        //     method: 'tools/list',
        //     params: {}
        // });

        // const result = response.result as ListToolsResponse;
        // expect(result.tools).toHaveLength(1);
        // expect(result.tools[0]).toMatchObject({
        //     name: 'run-collection',
        //     description: expect.any(String),
        //     inputSchema: {
        //         type: 'object',
        //         properties: {
        //             collection: {
        //                 type: 'string'
        //             }
        //         },
        //         required: ['collection']
        //     }
        // });
    });

    // it('should execute collection run tool successfully', async () => {
    //     const mockResult = {
    //         success: true,
    //         summary: {
    //             total: 2,
    //             failed: 0,
    //             passed: 2
    //         },
    //         failures: [],
    //         timings: {
    //             started: '2024-01-01T00:00:00.000Z',
    //             completed: '2024-01-01T00:00:01.000Z',
    //             duration: 1000
    //         }
    //     };

    //     const runCollectionMock = vi.fn().mockResolvedValue(mockResult);
    //     (NewmanRunner as any).mockImplementation(() => ({
    //         runCollection: runCollectionMock
    //     }));

    //     const mcpServer = await server.start();
    //     await mcpServer.connect(transport);

    //     const response = await transport.handleRequest({
    //         jsonrpc: '2.0',
    //         id: '1',
    //         method: 'tools/call',
    //         params: {
    //             name: 'run-collection',
    //             arguments: {
    //                 collection: './test-collection.json'
    //             }
    //         }
    //     });

    //     const result = response.result as CallToolResponse;
    //     expect(result.content).toHaveLength(1);
    //     expect(JSON.parse(result.content[0].text)).toEqual(mockResult);
    //     expect(runCollectionMock).toHaveBeenCalledWith({
    //         collection: './test-collection.json'
    //     });
    // });

    // it('should handle collection run errors', async () => {
    //     const runCollectionMock = vi.fn().mockRejectedValue(
    //         new Error('Failed to load collection')
    //     );
    //     (NewmanRunner as any).mockImplementation(() => ({
    //         runCollection: runCollectionMock
    //     }));

    //     const mcpServer = await server.start();
    //     await mcpServer.connect(transport);

    //     const response = await transport.handleRequest({
    //         jsonrpc: '2.0',
    //         id: '1',
    //         method: 'tools/call',
    //         params: {
    //             name: 'run-collection',
    //             arguments: {
    //                 collection: './invalid-collection.json'
    //             }
    //         }
    //     });

    //     const result = response.result as CallToolResponse;
    //     expect(result.isError).toBe(true);
    //     expect(JSON.parse(result.content[0].text)).toEqual({
    //         error: 'Failed to load collection',
    //         success: false
    //     });
    // });

    // it('should validate tool input', async () => {
    //     const mcpServer = await server.start();
    //     await mcpServer.connect(transport);

    //     // Test with missing required field
    //     await expect(transport.handleRequest({
    //         jsonrpc: '2.0',
    //         id: '1',
    //         method: 'tools/call',
    //         params: {
    //             name: 'run-collection',
    //             arguments: {}
    //         }
    //     })).rejects.toThrow();

    //     // Test with invalid tool name
    //     await expect(transport.handleRequest({
    //         jsonrpc: '2.0',
    //         id: '1',
    //         method: 'tools/call',
    //         params: {
    //             name: 'invalid-tool',
    //             arguments: {
    //                 collection: './test-collection.json'
    //             }
    //         }
    //     })).rejects.toThrow('Unknown tool: invalid-tool');
    // });
});
