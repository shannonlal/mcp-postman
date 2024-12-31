The following is information on building MCP Server Applications
The following is from the documents from the MCP Site

###

Get Started
Introduction
Get started with the Model Context Protocol (MCP)

MCP is an open protocol that standardizes how applications provide context to LLMs. Think of MCP like a USB-C port for AI applications. Just as USB-C provides a standardized way to connect your devices to various peripherals and accessories, MCP provides a standardized way to connect AI models to different data sources and tools.

​
Why MCP?
MCP helps you build agents and complex workflows on top of LLMs. LLMs frequently need to integrate with data and tools, and MCP provides:

A growing list of pre-built integrations that your LLM can directly plug into
The flexibility to switch between LLM providers and vendors
Best practices for securing your data within your infrastructure
​
General architecture
At its core, MCP follows a client-server architecture where a host application can connect to multiple servers:

Internet

Your Computer

MCP Protocol

MCP Protocol

MCP Protocol

Web APIs

Host with MCP Client
(Claude, IDEs, Tools)

MCP Server A

MCP Server B

MCP Server C

Local
Data Source A

Local
Data Source B

Remote
Service C

MCP Hosts: Programs like Claude Desktop, IDEs, or AI tools that want to access data through MCP
MCP Clients: Protocol clients that maintain 1:1 connections with servers
MCP Servers: Lightweight programs that each expose specific capabilities through the standardized Model Context Protocol
Local Data Sources: Your computer’s files, databases, and services that MCP servers can securely access
Remote Services: External systems available over the internet (e.g., through APIs) that MCP servers can connect to
​

###

Here is information on MCP Core Architecture

###

Core architecture
Understand how MCP connects clients, servers, and LLMs

The Model Context Protocol (MCP) is built on a flexible, extensible architecture that enables seamless communication between LLM applications and integrations. This document covers the core architectural components and concepts.

​
Overview
MCP follows a client-server architecture where:

Hosts are LLM applications (like Claude Desktop or IDEs) that initiate connections
Clients maintain 1:1 connections with servers, inside the host application
Servers provide context, tools, and prompts to clients
Server Process

Server Process

Host (e.g., Claude Desktop)

Transport Layer

Transport Layer

MCP Client

MCP Client

MCP Server

MCP Server

​
Core components
​
Protocol layer
The protocol layer handles message framing, request/response linking, and high-level communication patterns.

TypeScript
Python

class Protocol<Request, Notification, Result> {
// Handle incoming requests
setRequestHandler<T>(schema: T, handler: (request: T, extra: RequestHandlerExtra) => Promise<Result>): void

    // Handle incoming notifications
    setNotificationHandler<T>(schema: T, handler: (notification: T) => Promise<void>): void

    // Send requests and await responses
    request<T>(request: Request, schema: T, options?: RequestOptions): Promise<T>

    // Send one-way notifications
    notification(notification: Notification): Promise<void>

}
Key classes include:

Protocol
Client
Server
​
Transport layer
The transport layer handles the actual communication between clients and servers. MCP supports multiple transport mechanisms:

Stdio transport

Uses standard input/output for communication
Ideal for local processes
HTTP with SSE transport

Uses Server-Sent Events for server-to-client messages
HTTP POST for client-to-server messages
All transports use JSON-RPC 2.0 to exchange messages. See the specification for detailed information about the Model Context Protocol message format.

​
Message types
MCP has these main types of messages:

Requests expect a response from the other side:

interface Request {
method: string;
params?: { ... };
}
Results are successful responses to requests:

interface Result {
[key: string]: unknown;
}
Errors indicate that a request failed:

interface Error {
code: number;
message: string;
data?: unknown;
}
Notifications are one-way messages that don’t expect a response:

interface Notification {
method: string;
params?: { ... };
}
​
Connection lifecycle
​

1. Initialization
   Server
   Client
   Server
   Client
   Connection ready for use
   initialize request
   initialize response
   initialized notification
   Client sends initialize request with protocol version and capabilities
   Server responds with its protocol version and capabilities
   Client sends initialized notification as acknowledgment
   Normal message exchange begins
   ​
2. Message exchange
   After initialization, the following patterns are supported:

Request-Response: Client or server sends requests, the other responds
Notifications: Either party sends one-way messages
​ 3. Termination
Either party can terminate the connection:

Clean shutdown via close()
Transport disconnection
Error conditions
​
Error handling
MCP defines these standard error codes:

enum ErrorCode {
// Standard JSON-RPC error codes
ParseError = -32700,
InvalidRequest = -32600,
MethodNotFound = -32601,
InvalidParams = -32602,
InternalError = -32603
}
SDKs and applications can define their own error codes above -32000.

Errors are propagated through:

Error responses to requests
Error events on transports
Protocol-level error handlers
​
Implementation example
Here’s a basic example of implementing an MCP server:

TypeScript
Python

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
name: "example-server",
version: "1.0.0"
}, {
capabilities: {
resources: {}
}
});

// Handle requests
server.setRequestHandler(ListResourcesRequestSchema, async () => {
return {
resources: [
{
uri: "example://resource",
name: "Example Resource"
}
]
};
});

// Connect transport
const transport = new StdioServerTransport();
await server.connect(transport);
​
Best practices
​
Transport selection
Local communication

Use stdio transport for local processes
Efficient for same-machine communication
Simple process management
Remote communication

Use SSE for scenarios requiring HTTP compatibility
Consider security implications including authentication and authorization
​
Message handling
Request processing

Validate inputs thoroughly
Use type-safe schemas
Handle errors gracefully
Implement timeouts
Progress reporting

Use progress tokens for long operations
Report progress incrementally
Include total progress when known
Error management

Use appropriate error codes
Include helpful error messages
Clean up resources on errors
​
Security considerations
Transport security

Use TLS for remote connections
Validate connection origins
Implement authentication when needed
Message validation

Validate all incoming messages
Sanitize inputs
Check message size limits
Verify JSON-RPC format
Resource protection

Implement access controls
Validate resource paths
Monitor resource usage
Rate limit requests
Error handling

Don’t leak sensitive information
Log security-relevant errors
Implement proper cleanup
Handle DoS scenarios
​
Debugging and monitoring
Logging

Log protocol events
Track message flow
Monitor performance
Record errors
Diagnostics

Implement health checks
Monitor connection state
Track resource usage
Profile performance
Testing

Test different transports
Verify error handling
Check edge cases
Load test servers

###

Here is documentation onf MCP Resources

###

Resources
Expose data and content from your servers to LLMs

Resources are a core primitive in the Model Context Protocol (MCP) that allow servers to expose data and content that can be read by clients and used as context for LLM interactions.

Resources are designed to be application-controlled, meaning that the client application can decide how and when they should be used. Different MCP clients may handle resources differently. For example:

Claude Desktop currently requires users to explicitly select resources before they can be used
Other clients might automatically select resources based on heuristics
Some implementations may even allow the AI model itself to determine which resources to use
Server authors should be prepared to handle any of these interaction patterns when implementing resource support. In order to expose data to models automatically, server authors should use a model-controlled primitive such as Tools.

​
Overview
Resources represent any kind of data that an MCP server wants to make available to clients. This can include:

File contents
Database records
API responses
Live system data
Screenshots and images
Log files
And more
Each resource is identified by a unique URI and can contain either text or binary data.

​
Resource URIs
Resources are identified using URIs that follow this format:

[protocol]://[host]/[path]
For example:

file:///home/user/documents/report.pdf
postgres://database/customers/schema
screen://localhost/display1
The protocol and path structure is defined by the MCP server implementation. Servers can define their own custom URI schemes.

​
Resource types
Resources can contain two types of content:

​
Text resources
Text resources contain UTF-8 encoded text data. These are suitable for:

Source code
Configuration files
Log files
JSON/XML data
Plain text
​
Binary resources
Binary resources contain raw binary data encoded in base64. These are suitable for:

Images
PDFs
Audio files
Video files
Other non-text formats
​
Resource discovery
Clients can discover available resources through two main methods:

​
Direct resources
Servers expose a list of concrete resources via the resources/list endpoint. Each resource includes:

{
uri: string; // Unique identifier for the resource
name: string; // Human-readable name
description?: string; // Optional description
mimeType?: string; // Optional MIME type
}
​
Resource templates
For dynamic resources, servers can expose URI templates that clients can use to construct valid resource URIs:

{
uriTemplate: string; // URI template following RFC 6570
name: string; // Human-readable name for this type
description?: string; // Optional description
mimeType?: string; // Optional MIME type for all matching resources
}
​
Reading resources
To read a resource, clients make a resources/read request with the resource URI.

The server responds with a list of resource contents:

{
contents: [
{
uri: string; // The URI of the resource
mimeType?: string; // Optional MIME type

      // One of:
      text?: string;      // For text resources
      blob?: string;      // For binary resources (base64 encoded)
    }

]
}
Servers may return multiple resources in response to one resources/read request. This could be used, for example, to return a list of files inside a directory when the directory is read.

​
Resource updates
MCP supports real-time updates for resources through two mechanisms:

​
List changes
Servers can notify clients when their list of available resources changes via the notifications/resources/list_changed notification.

​
Content changes
Clients can subscribe to updates for specific resources:

Client sends resources/subscribe with resource URI
Server sends notifications/resources/updated when the resource changes
Client can fetch latest content with resources/read
Client can unsubscribe with resources/unsubscribe
​
Example implementation
Here’s a simple example of implementing resource support in an MCP server:

TypeScript
Python

const server = new Server({
name: "example-server",
version: "1.0.0"
}, {
capabilities: {
resources: {}
}
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
return {
resources: [
{
uri: "file:///logs/app.log",
name: "Application Logs",
mimeType: "text/plain"
}
]
};
});

// Read resource contents
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
const uri = request.params.uri;

if (uri === "file:///logs/app.log") {
const logContents = await readLogFile();
return {
contents: [
{
uri,
mimeType: "text/plain",
text: logContents
}
]
};
}

throw new Error("Resource not found");
});
​
Best practices
When implementing resource support:

Use clear, descriptive resource names and URIs
Include helpful descriptions to guide LLM understanding
Set appropriate MIME types when known
Implement resource templates for dynamic content
Use subscriptions for frequently changing resources
Handle errors gracefully with clear error messages
Consider pagination for large resource lists
Cache resource contents when appropriate
Validate URIs before processing
Document your custom URI schemes
​
Security considerations
When exposing resources:

Validate all resource URIs
Implement appropriate access controls
Sanitize file paths to prevent directory traversal
Be cautious with binary data handling
Consider rate limiting for resource reads
Audit resource access
Encrypt sensitive data in transit
Validate MIME types
Implement timeouts for long-running reads
Handle resource cleanup appropriately
Was this page helpful?

###

Here is information on MCP Tools

###

Concepts
Tools
Enable LLMs to perform actions through your server

Tools are a powerful primitive in the Model Context Protocol (MCP) that enable servers to expose executable functionality to clients. Through tools, LLMs can interact with external systems, perform computations, and take actions in the real world.

Tools are designed to be model-controlled, meaning that tools are exposed from servers to clients with the intention of the AI model being able to automatically invoke them (with a human in the loop to grant approval).

​
Overview
Tools in MCP allow servers to expose executable functions that can be invoked by clients and used by LLMs to perform actions. Key aspects of tools include:

Discovery: Clients can list available tools through the tools/list endpoint
Invocation: Tools are called using the tools/call endpoint, where servers perform the requested operation and return results
Flexibility: Tools can range from simple calculations to complex API interactions
Like resources, tools are identified by unique names and can include descriptions to guide their usage. However, unlike resources, tools represent dynamic operations that can modify state or interact with external systems.

​
Tool definition structure
Each tool is defined with the following structure:

{
name: string; // Unique identifier for the tool
description?: string; // Human-readable description
inputSchema: { // JSON Schema for the tool's parameters
type: "object",
properties: { ... } // Tool-specific parameters
}
}
​
Implementing tools
Here’s an example of implementing a basic tool in an MCP server:

TypeScript
Python

const server = new Server({
name: "example-server",
version: "1.0.0"
}, {
capabilities: {
tools: {}
}
});

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
return {
tools: [{
name: "calculate_sum",
description: "Add two numbers together",
inputSchema: {
type: "object",
properties: {
a: { type: "number" },
b: { type: "number" }
},
required: ["a", "b"]
}
}]
};
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
if (request.params.name === "calculate_sum") {
const { a, b } = request.params.arguments;
return {
content: [
{
type: "text",
text: String(a + b)
}
]
};
}
throw new Error("Tool not found");
});
​
Example tool patterns
Here are some examples of types of tools that a server could provide:

​
System operations
Tools that interact with the local system:

{
name: "execute_command",
description: "Run a shell command",
inputSchema: {
type: "object",
properties: {
command: { type: "string" },
args: { type: "array", items: { type: "string" } }
}
}
}
​
API integrations
Tools that wrap external APIs:

{
name: "github_create_issue",
description: "Create a GitHub issue",
inputSchema: {
type: "object",
properties: {
title: { type: "string" },
body: { type: "string" },
labels: { type: "array", items: { type: "string" } }
}
}
}
​
Data processing
Tools that transform or analyze data:

{
name: "analyze_csv",
description: "Analyze a CSV file",
inputSchema: {
type: "object",
properties: {
filepath: { type: "string" },
operations: {
type: "array",
items: {
enum: ["sum", "average", "count"]
}
}
}
}
}
​
Best practices
When implementing tools:

Provide clear, descriptive names and descriptions
Use detailed JSON Schema definitions for parameters
Include examples in tool descriptions to demonstrate how the model should use them
Implement proper error handling and validation
Use progress reporting for long operations
Keep tool operations focused and atomic
Document expected return value structures
Implement proper timeouts
Consider rate limiting for resource-intensive operations
Log tool usage for debugging and monitoring
​
Security considerations
When exposing tools:

​
Input validation
Validate all parameters against the schema
Sanitize file paths and system commands
Validate URLs and external identifiers
Check parameter sizes and ranges
Prevent command injection
​
Access control
Implement authentication where needed
Use appropriate authorization checks
Audit tool usage
Rate limit requests
Monitor for abuse
​
Error handling
Don’t expose internal errors to clients
Log security-relevant errors
Handle timeouts appropriately
Clean up resources after errors
Validate return values
​
Tool discovery and updates
MCP supports dynamic tool discovery:

Clients can list available tools at any time
Servers can notify clients when tools change using notifications/tools/list_changed
Tools can be added or removed during runtime
Tool definitions can be updated (though this should be done carefully)
​
Error handling
Tool errors should be reported within the result object, not as MCP protocol-level errors. This allows the LLM to see and potentially handle the error. When a tool encounters an error:

Set isError to true in the result
Include error details in the content array
Here’s an example of proper error handling for tools:

TypeScript
Python

try {
// Tool operation
const result = performOperation();
return {
content: [
{
type: "text",
text: `Operation successful: ${result}`
}
]
};
} catch (error) {
return {
isError: true,
content: [
{
type: "text",
text: `Error: ${error.message}`
}
]
};
}
This approach allows the LLM to see that an error occurred and potentially take corrective action or request human intervention.

​
Testing tools
A comprehensive testing strategy for MCP tools should cover:

Functional testing: Verify tools execute correctly with valid inputs and handle invalid inputs appropriately
Integration testing: Test tool interaction with external systems using both real and mocked dependencies
Security testing: Validate authentication, authorization, input sanitization, and rate limiting
Performance testing: Check behavior under load, timeout handling, and resource cleanup
Error handling: Ensure tools properly report errors through the MCP protocol and clean up resources

###

Here is information on MCP Prompts

###

Concepts
Prompts
Create reusable prompt templates and workflows

Prompts enable servers to define reusable prompt templates and workflows that clients can easily surface to users and LLMs. They provide a powerful way to standardize and share common LLM interactions.

Prompts are designed to be user-controlled, meaning they are exposed from servers to clients with the intention of the user being able to explicitly select them for use.

​
Overview
Prompts in MCP are predefined templates that can:

Accept dynamic arguments
Include context from resources
Chain multiple interactions
Guide specific workflows
Surface as UI elements (like slash commands)
​
Prompt structure
Each prompt is defined with:

{
name: string; // Unique identifier for the prompt
description?: string; // Human-readable description
arguments?: [ // Optional list of arguments
{
name: string; // Argument identifier
description?: string; // Argument description
required?: boolean; // Whether argument is required
}
]
}
​
Discovering prompts
Clients can discover available prompts through the prompts/list endpoint:

// Request
{
method: "prompts/list"
}

// Response
{
prompts: [
{
name: "analyze-code",
description: "Analyze code for potential improvements",
arguments: [
{
name: "language",
description: "Programming language",
required: true
}
]
}
]
}
​
Using prompts
To use a prompt, clients make a prompts/get request:

// Request
{
method: "prompts/get",
params: {
name: "analyze-code",
arguments: {
language: "python"
}
}
}

// Response
{
description: "Analyze Python code for potential improvements",
messages: [
{
role: "user",
content: {
type: "text",
text: "Please analyze the following Python code for potential improvements:\n\n`python\ndef calculate_sum(numbers):\n    total = 0\n    for num in numbers:\n        total = total + num\n    return total\n\nresult = calculate_sum([1, 2, 3, 4, 5])\nprint(result)\n`"
}
}
]
}
​
Dynamic prompts
Prompts can be dynamic and include:

​
Embedded resource context

{
"name": "analyze-project",
"description": "Analyze project logs and code",
"arguments": [
{
"name": "timeframe",
"description": "Time period to analyze logs",
"required": true
},
{
"name": "fileUri",
"description": "URI of code file to review",
"required": true
}
]
}
When handling the prompts/get request:

{
"messages": [
{
"role": "user",
"content": {
"type": "text",
"text": "Analyze these system logs and the code file for any issues:"
}
},
{
"role": "user",
"content": {
"type": "resource",
"resource": {
"uri": "logs://recent?timeframe=1h",
"text": "[2024-03-14 15:32:11] ERROR: Connection timeout in network.py:127\n[2024-03-14 15:32:15] WARN: Retrying connection (attempt 2/3)\n[2024-03-14 15:32:20] ERROR: Max retries exceeded",
"mimeType": "text/plain"
}
}
},
{
"role": "user",
"content": {
"type": "resource",
"resource": {
"uri": "file:///path/to/code.py",
"text": "def connect_to_service(timeout=30):\n retries = 3\n for attempt in range(retries):\n try:\n return establish_connection(timeout)\n except TimeoutError:\n if attempt == retries - 1:\n raise\n time.sleep(5)\n\ndef establish_connection(timeout):\n # Connection implementation\n pass",
"mimeType": "text/x-python"
}
}
}
]
}
​
Multi-step workflows

const debugWorkflow = {
name: "debug-error",
async getMessages(error: string) {
return [
{
role: "user",
content: {
type: "text",
text: `Here's an error I'm seeing: ${error}`
}
},
{
role: "assistant",
content: {
type: "text",
text: "I'll help analyze this error. What have you tried so far?"
}
},
{
role: "user",
content: {
type: "text",
text: "I've tried restarting the service, but the error persists."
}
}
];
}
};
​
Example implementation
Here’s a complete example of implementing prompts in an MCP server:

TypeScript
Python

import { Server } from "@modelcontextprotocol/sdk/server";
import {
ListPromptsRequestSchema,
GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types";

const PROMPTS = {
"git-commit": {
name: "git-commit",
description: "Generate a Git commit message",
arguments: [
{
name: "changes",
description: "Git diff or description of changes",
required: true
}
]
},
"explain-code": {
name: "explain-code",
description: "Explain how code works",
arguments: [
{
name: "code",
description: "Code to explain",
required: true
},
{
name: "language",
description: "Programming language",
required: false
}
]
}
};

const server = new Server({
name: "example-prompts-server",
version: "1.0.0"
}, {
capabilities: {
prompts: {}
}
});

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
return {
prompts: Object.values(PROMPTS)
};
});

// Get specific prompt
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
const prompt = PROMPTS[request.params.name];
if (!prompt) {
throw new Error(`Prompt not found: ${request.params.name}`);
}

if (request.params.name === "git-commit") {
return {
messages: [
{
role: "user",
content: {
type: "text",
text: `Generate a concise but descriptive commit message for these changes:\n\n${request.params.arguments?.changes}`
}
}
]
};
}

if (request.params.name === "explain-code") {
const language = request.params.arguments?.language || "Unknown";
return {
messages: [
{
role: "user",
content: {
type: "text",
text: `Explain how this ${language} code works:\n\n${request.params.arguments?.code}`
}
}
]
};
}

throw new Error("Prompt implementation not found");
});
​
Best practices
When implementing prompts:

Use clear, descriptive prompt names
Provide detailed descriptions for prompts and arguments
Validate all required arguments
Handle missing arguments gracefully
Consider versioning for prompt templates
Cache dynamic content when appropriate
Implement error handling
Document expected argument formats
Consider prompt composability
Test prompts with various inputs
​
UI integration
Prompts can be surfaced in client UIs as:

Slash commands
Quick actions
Context menu items
Command palette entries
Guided workflows
Interactive forms
​
Updates and changes
Servers can notify clients about prompt changes:

Server capability: prompts.listChanged
Notification: notifications/prompts/list_changed
Client re-fetches prompt list
​
Security considerations
When implementing prompts:

Validate all arguments
Sanitize user input
Consider rate limiting
Implement access controls
Audit prompt usage
Handle sensitive data appropriately
Validate generated content
Implement timeouts
Consider prompt injection risks
Document security requirements

###

Here is information for MCP Transport

###

Transports
Learn about MCP’s communication mechanisms

Transports in the Model Context Protocol (MCP) provide the foundation for communication between clients and servers. A transport handles the underlying mechanics of how messages are sent and received.

​
Message Format
MCP uses JSON-RPC 2.0 as its wire format. The transport layer is responsible for converting MCP protocol messages into JSON-RPC format for transmission and converting received JSON-RPC messages back into MCP protocol messages.

There are three types of JSON-RPC messages used:

​
Requests

{
jsonrpc: "2.0",
id: number | string,
method: string,
params?: object
}
​
Responses

{
jsonrpc: "2.0",
id: number | string,
result?: object,
error?: {
code: number,
message: string,
data?: unknown
}
}
​
Notifications

{
jsonrpc: "2.0",
method: string,
params?: object
}
​
Built-in Transport Types
MCP includes two standard transport implementations:

​
Standard Input/Output (stdio)
The stdio transport enables communication through standard input and output streams. This is particularly useful for local integrations and command-line tools.

Use stdio when:

Building command-line tools
Implementing local integrations
Needing simple process communication
Working with shell scripts
TypeScript (Server)
TypeScript (Client)
Python (Server)
Python (Client)

const server = new Server({
name: "example-server",
version: "1.0.0"
}, {
capabilities: {}
});

const transport = new StdioServerTransport();
await server.connect(transport);
​
Server-Sent Events (SSE)
SSE transport enables server-to-client streaming with HTTP POST requests for client-to-server communication.

Use SSE when:

Only server-to-client streaming is needed
Working with restricted networks
Implementing simple updates
TypeScript (Server)
TypeScript (Client)
Python (Server)
Python (Client)

const server = new Server({
name: "example-server",
version: "1.0.0"
}, {
capabilities: {}
});

const transport = new SSEServerTransport("/message", response);
await server.connect(transport);
​
Custom Transports
MCP makes it easy to implement custom transports for specific needs. Any transport implementation just needs to conform to the Transport interface:

You can implement custom transports for:

Custom network protocols
Specialized communication channels
Integration with existing systems
Performance optimization
TypeScript
Python

interface Transport {
// Start processing messages
start(): Promise<void>;

// Send a JSON-RPC message
send(message: JSONRPCMessage): Promise<void>;

// Close the connection
close(): Promise<void>;

// Callbacks
onclose?: () => void;
onerror?: (error: Error) => void;
onmessage?: (message: JSONRPCMessage) => void;
}
​
Error Handling
Transport implementations should handle various error scenarios:

Connection errors
Message parsing errors
Protocol errors
Network timeouts
Resource cleanup
Example error handling:

TypeScript
Python

class ExampleTransport implements Transport {
async start() {
try {
// Connection logic
} catch (error) {
this.onerror?.(new Error(`Failed to connect: ${error}`));
throw error;
}
}

async send(message: JSONRPCMessage) {
try {
// Sending logic
} catch (error) {
this.onerror?.(new Error(`Failed to send message: ${error}`));
throw error;
}
}
}
​
Best Practices
When implementing or using MCP transport:

Handle connection lifecycle properly
Implement proper error handling
Clean up resources on connection close
Use appropriate timeouts
Validate messages before sending
Log transport events for debugging
Implement reconnection logic when appropriate
Handle backpressure in message queues
Monitor connection health
Implement proper security measures
​
Security Considerations
When implementing transport:

​
Authentication and Authorization
Implement proper authentication mechanisms
Validate client credentials
Use secure token handling
Implement authorization checks
​
Data Security
Use TLS for network transport
Encrypt sensitive data
Validate message integrity
Implement message size limits
Sanitize input data
​
Network Security
Implement rate limiting
Use appropriate timeouts
Handle denial of service scenarios
Monitor for unusual patterns
Implement proper firewall rules
​
Debugging Transport
Tips for debugging transport issues:

Enable debug logging
Monitor message flow
Check connection states
Validate message formats
Test error scenarios
Use network analysis tools
Implement health checks
Monitor resource usage
Test edge cases
Use proper error tracking

###

Here is information on MCP Sampling

###

Sampling
Let your servers request completions from LLMs

Sampling is a powerful MCP feature that allows servers to request LLM completions through the client, enabling sophisticated agentic behaviors while maintaining security and privacy.

This feature of MCP is not yet supported in the Claude Desktop client.

​
How sampling works
The sampling flow follows these steps:

Server sends a sampling/createMessage request to the client
Client reviews the request and can modify it
Client samples from an LLM
Client reviews the completion
Client returns the result to the server
This human-in-the-loop design ensures users maintain control over what the LLM sees and generates.

​
Message format
Sampling requests use a standardized message format:

{
messages: [
{
role: "user" | "assistant",
content: {
type: "text" | "image",

        // For text:
        text?: string,

        // For images:
        data?: string,             // base64 encoded
        mimeType?: string
      }
    }

],
modelPreferences?: {
hints?: [{
name?: string // Suggested model name/family
}],
costPriority?: number, // 0-1, importance of minimizing cost
speedPriority?: number, // 0-1, importance of low latency
intelligencePriority?: number // 0-1, importance of capabilities
},
systemPrompt?: string,
includeContext?: "none" | "thisServer" | "allServers",
temperature?: number,
maxTokens: number,
stopSequences?: string[],
metadata?: Record<string, unknown>
}
​
Request parameters
​
Messages
The messages array contains the conversation history to send to the LLM. Each message has:

role: Either “user” or “assistant”
content: The message content, which can be:
Text content with a text field
Image content with data (base64) and mimeType fields
​
Model preferences
The modelPreferences object allows servers to specify their model selection preferences:

hints: Array of model name suggestions that clients can use to select an appropriate model:

name: String that can match full or partial model names (e.g. “claude-3”, “sonnet”)
Clients may map hints to equivalent models from different providers
Multiple hints are evaluated in preference order
Priority values (0-1 normalized):

costPriority: Importance of minimizing costs
speedPriority: Importance of low latency response
intelligencePriority: Importance of advanced model capabilities
Clients make the final model selection based on these preferences and their available models.

​
System prompt
An optional systemPrompt field allows servers to request a specific system prompt. The client may modify or ignore this.

​
Context inclusion
The includeContext parameter specifies what MCP context to include:

"none": No additional context
"thisServer": Include context from the requesting server
"allServers": Include context from all connected MCP servers
The client controls what context is actually included.

​
Sampling parameters
Fine-tune the LLM sampling with:

temperature: Controls randomness (0.0 to 1.0)
maxTokens: Maximum tokens to generate
stopSequences: Array of sequences that stop generation
metadata: Additional provider-specific parameters
​
Response format
The client returns a completion result:

{
model: string, // Name of the model used
stopReason?: "endTurn" | "stopSequence" | "maxTokens" | string,
role: "user" | "assistant",
content: {
type: "text" | "image",
text?: string,
data?: string,
mimeType?: string
}
}
​
Example request
Here’s an example of requesting sampling from a client:

{
"method": "sampling/createMessage",
"params": {
"messages": [
{
"role": "user",
"content": {
"type": "text",
"text": "What files are in the current directory?"
}
}
],
"systemPrompt": "You are a helpful file system assistant.",
"includeContext": "thisServer",
"maxTokens": 100
}
}
​
Best practices
When implementing sampling:

Always provide clear, well-structured prompts
Handle both text and image content appropriately
Set reasonable token limits
Include relevant context through includeContext
Validate responses before using them
Handle errors gracefully
Consider rate limiting sampling requests
Document expected sampling behavior
Test with various model parameters
Monitor sampling costs
​
Human in the loop controls
Sampling is designed with human oversight in mind:

​
For prompts
Clients should show users the proposed prompt
Users should be able to modify or reject prompts
System prompts can be filtered or modified
Context inclusion is controlled by the client
​
For completions
Clients should show users the completion
Users should be able to modify or reject completions
Clients can filter or modify completions
Users control which model is used
​
Security considerations
When implementing sampling:

Validate all message content
Sanitize sensitive information
Implement appropriate rate limits
Monitor sampling usage
Encrypt data in transit
Handle user data privacy
Audit sampling requests
Control cost exposure
Implement timeouts
Handle model errors gracefully
​
Common patterns
​
Agentic workflows
Sampling enables agentic patterns like:

Reading and analyzing resources
Making decisions based on context
Generating structured data
Handling multi-step tasks
Providing interactive assistance
​
Context management
Best practices for context:

Request minimal necessary context
Structure context clearly
Handle context size limits
Update context as needed
Clean up stale context
​
Error handling
Robust error handling should:

Catch sampling failures
Handle timeout errors
Manage rate limits
Validate responses
Provide fallback behaviors
Log errors appropriately
​
Limitations
Be aware of these limitations:

Sampling depends on client capabilities
Users control sampling behavior
Context size has limits
Rate limits may apply
Costs should be considered
Model availability varies
Response times vary
Not all content types supported

###

Here is information on building an MCP Server with Node

###

Quickstart
For Server Developers
Get started building your own server to use in Claude for Desktop and other clients.

In this tutorial, we’ll build a simple MCP weather server and connect it to a host, Claude for Desktop. We’ll start with a basic setup, and then progress to more complex use cases.

​
What we’ll be building
Many LLMs (including Claude) do not currently have the ability to fetch the forecast and severe weather alerts. Let’s use MCP to solve that!

We’ll build a server that exposes two tools: get-alerts and get-forecast. Then we’ll connect the server to an MCP host (in this case, Claude for Desktop):

Servers can connect to any client. We’ve chosen Claude for Desktop here for simplicity, but we also have guides on building your own client as well as a list of other clients here.

Why Claude for Desktop and not Claude.ai?

​
Core MCP Concepts
MCP servers can provide three main types of capabilities:

Resources: File-like data that can be read by clients (like API responses or file contents)
Tools: Functions that can be called by the LLM (with user approval)
Prompts: Pre-written templates that help users accomplish specific tasks
This tutorial will primarily focus on tools.

Python
Node
Let’s get started with building our weather server! You can find the complete code for what we’ll be building here.

Prerequisite knowledge
This quickstart assumes you have familiarity with:

TypeScript
LLMs like Claude
System requirements
For TypeScript, make sure you have the latest version of Node installed.

Set up your environment
First, let’s install Node.js and npm if you haven’t already. You can download them from nodejs.org. Verify your Node.js installation:

node --version
npm --version
For this tutorial, you’ll need Node.js version 16 or higher.

Now, let’s create and set up our project:

MacOS/Linux

Windows

# Create a new directory for our project

mkdir weather
cd weather

# Initialize a new npm project

npm init -y

# Install dependencies

npm install @modelcontextprotocol/sdk zod
npm install -D @types/node typescript

# Create our files

mkdir src
touch src/index.ts
Update your package.json to add type: “module” and a build script:

package.json

{
"type": "module",
"bin": {
"weather": "./build/index.js"
},
"scripts": {
"build": "tsc && node -e \"require('fs').chmodSync('build/index.js', '755')\"",
},
"files": [
"build"
],
}
Create a tsconfig.json in the root of your project:

tsconfig.json

{
"compilerOptions": {
"target": "ES2022",
"module": "Node16",
"moduleResolution": "Node16",
"outDir": "./build",
"rootDir": "./src",
"strict": true,
"esModuleInterop": true,
"skipLibCheck": true,
"forceConsistentCasingInFileNames": true
},
"include": ["src/**/*"],
"exclude": ["node_modules"]
}
Now let’s dive into building your server.

Building your server
Importing packages
Add these to the top of your src/index.ts:

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
CallToolRequestSchema,
ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
Setting up the instance
Then initialize the NWS API base URL, validation schemas, and server instance:

const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

// Define Zod schemas for validation
const AlertsArgumentsSchema = z.object({
state: z.string().length(2),
});

const ForecastArgumentsSchema = z.object({
latitude: z.number().min(-90).max(90),
longitude: z.number().min(-180).max(180),
});

// Create server instance
const server = new Server(
{
name: "weather",
version: "1.0.0",
},
{
capabilities: {
tools: {},
},
}
);
Implementing tool listing
We need to tell clients what tools are available. This server.setRequestHandler call will register this list for us:

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
return {
tools: [
{
name: "get-alerts",
description: "Get weather alerts for a state",
inputSchema: {
type: "object",
properties: {
state: {
type: "string",
description: "Two-letter state code (e.g. CA, NY)",
},
},
required: ["state"],
},
},
{
name: "get-forecast",
description: "Get weather forecast for a location",
inputSchema: {
type: "object",
properties: {
latitude: {
type: "number",
description: "Latitude of the location",
},
longitude: {
type: "number",
description: "Longitude of the location",
},
},
required: ["latitude", "longitude"],
},
},
],
};
});
This defines our two tools: get-alerts and get-forecast.

Helper functions
Next, let’s add our helper functions for querying and formatting the data from the National Weather Service API:

// Helper function for making NWS API requests
async function makeNWSRequest<T>(url: string): Promise<T | null> {
const headers = {
"User-Agent": USER_AGENT,
Accept: "application/geo+json",
};

try {
const response = await fetch(url, { headers });
if (!response.ok) {
throw new Error(`HTTP error! status: ${response.status}`);
}
return (await response.json()) as T;
} catch (error) {
console.error("Error making NWS request:", error);
return null;
}
}

interface AlertFeature {
properties: {
event?: string;
areaDesc?: string;
severity?: string;
status?: string;
headline?: string;
};
}

// Format alert data
function formatAlert(feature: AlertFeature): string {
const props = feature.properties;
return [
`Event: ${props.event || "Unknown"}`,
`Area: ${props.areaDesc || "Unknown"}`,
`Severity: ${props.severity || "Unknown"}`,
`Status: ${props.status || "Unknown"}`,
`Headline: ${props.headline || "No headline"}`,
"---",
].join("\n");
}

interface ForecastPeriod {
name?: string;
temperature?: number;
temperatureUnit?: string;
windSpeed?: string;
windDirection?: string;
shortForecast?: string;
}

interface AlertsResponse {
features: AlertFeature[];
}

interface PointsResponse {
properties: {
forecast?: string;
};
}

interface ForecastResponse {
properties: {
periods: ForecastPeriod[];
};
}
Implementing tool execution
The tool execution handler is responsible for actually executing the logic of each tool. Let’s add it:

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
const { name, arguments: args } = request.params;

try {
if (name === "get-alerts") {
const { state } = AlertsArgumentsSchema.parse(args);
const stateCode = state.toUpperCase();

      const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
      const alertsData = await makeNWSRequest<AlertsResponse>(alertsUrl);

      if (!alertsData) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve alerts data",
            },
          ],
        };
      }

      const features = alertsData.features || [];
      if (features.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No active alerts for ${stateCode}`,
            },
          ],
        };
      }

      const formattedAlerts = features.map(formatAlert).slice(0, 20) // only take the first 20 alerts;
      const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join(
        "\n"
      )}`;

      return {
        content: [
          {
            type: "text",
            text: alertsText,
          },
        ],
      };
    } else if (name === "get-forecast") {
      const { latitude, longitude } = ForecastArgumentsSchema.parse(args);

      // Get grid point data
      const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(
        4
      )},${longitude.toFixed(4)}`;
      const pointsData = await makeNWSRequest<PointsResponse>(pointsUrl);

      if (!pointsData) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}. This location may not be supported by the NWS API (only US locations are supported).`,
            },
          ],
        };
      }

      const forecastUrl = pointsData.properties?.forecast;
      if (!forecastUrl) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to get forecast URL from grid point data",
            },
          ],
        };
      }

      // Get forecast data
      const forecastData = await makeNWSRequest<ForecastResponse>(forecastUrl);
      if (!forecastData) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve forecast data",
            },
          ],
        };
      }

      const periods = forecastData.properties?.periods || [];
      if (periods.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No forecast periods available",
            },
          ],
        };
      }

      // Format forecast periods
      const formattedForecast = periods.map((period: ForecastPeriod) =>
        [
          `${period.name || "Unknown"}:`,
          `Temperature: ${period.temperature || "Unknown"}°${
            period.temperatureUnit || "F"
          }`,
          `Wind: ${period.windSpeed || "Unknown"} ${
            period.windDirection || ""
          }`,
          `${period.shortForecast || "No forecast available"}`,
          "---",
        ].join("\n")
      );

      const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join(
        "\n"
      )}`;

      return {
        content: [
          {
            type: "text",
            text: forecastText,
          },
        ],
      };
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }

} catch (error) {
if (error instanceof z.ZodError) {
throw new Error(
`Invalid arguments: ${error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ")}`
);
}
throw error;
}
});
Running the server
Finally, implement the main function to run the server:

// Start the server
async function main() {
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
console.error("Fatal error in main():", error);
process.exit(1);
});
Make sure to run npm run build to build your server! This is a very important step in getting your server to connect.

Let’s now test your server from an existing MCP host, Claude for Desktop.

Testing your server with Claude for Desktop
Claude for Desktop is not yet available on Linux. Linux users can proceed to the Building a client tutorial to build an MCP client that connects to the server we just built.

First, make sure you have Claude for Desktop installed. You can install the latest version here. If you already have Claude for Desktop, make sure it’s updated to the latest version.

We’ll need to configure Claude for Desktop for whichever MCP servers you want to use. To do this, open your Claude for Desktop App configuration at ~/Library/Application Support/Claude/claude_desktop_config.json in a text editor. Make sure to create the file if it doesn’t exist.

For example, if you have VS Code installed:

MacOS/Linux
Windows

code ~/Library/Application\ Support/Claude/claude_desktop_config.json
You’ll then add your servers in the mcpServers key. The MCP UI elements will only show up in Claude for Desktop if at least one server is properly configured.

In this case, we’ll add our single weather server like so:

MacOS/Linux
Windows

Node

{
"mcpServers": {
"weather": {
"command": "node",
"args": [
"/ABSOLUTE/PATH/TO/PARENT/FOLDER/weather/build/index.js"
]
}
}
}
This tells Claude for Desktop:

There’s an MCP server named “weather”
Launch it by running node /ABSOLUTE/PATH/TO/PARENT/FOLDER/weather/build/index.js
Save the file, and restart Claude for Desktop.

​
Test with commands
Let’s make sure Claude for Desktop is picking up the two tools we’ve exposed in our weather server. You can do this by looking for the hammer icon:

After clicking on the hammer icon, you should see two tools listed:

If your server isn’t being picked up by Claude for Desktop, proceed to the Troubleshooting section for debugging tips.

If the hammer icon has shown up, you can now test your server by running the following commands in Claude for Desktop:

What’s the weather in Sacramento?
What are the active weather alerts in Texas?

Since this is the US National Weather service, the queries will only work for US locations.

​
What’s happening under the hood
When you ask a question:

The client sends your question to Claude
Claude analyzes the available tools and decides which one(s) to use
The client executes the chosen tool(s) through the MCP server
The results are sent back to Claude
Claude formulates a natural language response
The response is displayed to you!

###
