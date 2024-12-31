#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { PostmanServer } from "./server/server.js";

async function main(): Promise<void> {
    try {
        const postmanServer = new PostmanServer();
        const server = await postmanServer.start();
        
        const transport = new StdioServerTransport();
        await server.connect(transport);
        
        console.error("Postman MCP Server running on stdio");
        
        // Handle cleanup on exit
        process.on('SIGINT', async () => {
            await server.close();
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            await server.close();
            process.exit(0);
        });
    } catch (error) {
        console.error("Fatal error in main():", error);
        process.exit(1);
    }
}

void main();
