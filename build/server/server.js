import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { NewmanRunner } from "../newman/runner.js";
// Input validation schema
const RunCollectionSchema = z.object({
    collection: z.string(),
    environment: z.string().optional(),
    globals: z.string().optional(),
    iterationCount: z.number().min(1).optional()
});
export class PostmanServer {
    server;
    runner;
    constructor() {
        this.server = new Server({
            name: "postman-runner",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.runner = new NewmanRunner();
        this.setupTools();
    }
    setupTools() {
        // Register available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "run-collection",
                    description: "Run a Postman Collection using Newman",
                    inputSchema: {
                        type: "object",
                        properties: {
                            collection: {
                                type: "string",
                                description: "Path or URL to the Postman collection"
                            },
                            environment: {
                                type: "string",
                                description: "Optional path or URL to environment file"
                            },
                            globals: {
                                type: "string",
                                description: "Optional path or URL to globals file"
                            },
                            iterationCount: {
                                type: "number",
                                description: "Optional number of iterations to run"
                            }
                        },
                        required: ["collection"]
                    }
                }
            ]
        }));
        // Handle tool execution
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            if (request.params.name !== "run-collection") {
                throw new Error(`Unknown tool: ${request.params.name}`);
            }
            // Validate input
            const args = RunCollectionSchema.parse(request.params.arguments);
            try {
                // Run the collection
                const result = await this.runner.runCollection(args);
                // Format the response
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }]
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: errorMessage,
                                success: false
                            }, null, 2)
                        }],
                    isError: true
                };
            }
        });
    }
    async start() {
        // This will be connected in index.ts
        return Promise.resolve(this.server);
    }
}
//# sourceMappingURL=server.js.map