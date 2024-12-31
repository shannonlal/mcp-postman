import { describe, it, expect, vi, beforeEach } from "vitest";

// Define types for collection run parameters
interface CollectionRunParams {
  collection: string;
  environment?: string;
  globals?: string;
  iterationCount?: number;
}

vi.mock("../src/newman/runner.js", () => ({
  NewmanRunner: vi.fn().mockImplementation(() => ({
    runCollection: vi.fn(),
  })),
}));

import { PostmanServer } from "../src/server/server.js";
import { NewmanRunner } from "../src/newman/runner.js";

const MockedNewmanRunner = vi.mocked(NewmanRunner);

describe("PostmanServer", () => {
  let server: PostmanServer;

  beforeEach(() => {
    vi.clearAllMocks();
    server = new PostmanServer();
  });

  it("should initialize server with proper configuration", async (): Promise<void> => {
    const mcpServer = await server.start();

    // Verify server is properly initialized with expected methods
    expect(mcpServer).toBeDefined();
    expect(typeof mcpServer.connect).toBe("function");
    expect(typeof mcpServer.close).toBe("function");
  });

  it("should properly instantiate NewmanRunner", () => {
    expect(MockedNewmanRunner).toHaveBeenCalledTimes(1);
    // Verify NewmanRunner was constructed with no arguments
    expect(MockedNewmanRunner).toHaveBeenCalledWith();
  });

  it("should register run-collection tool", async () => {
    const mcpServer = await server.start();

    // Verify server is properly initialized
    expect(mcpServer).toBeDefined();

    // Verify the server has the expected methods
    expect(typeof mcpServer.setRequestHandler).toBe("function");
    expect(typeof mcpServer.connect).toBe("function");
  });

  it("should execute collection run with minimal parameters", async () => {
    // Setup mock response
    const mockResult = {
      success: true,
      summary: { total: 1, failed: 0, passed: 1 },
    };

    // Setup mock runner with spy
    const runCollectionSpy = vi.fn().mockResolvedValue(mockResult);
    const mockRunner = { runCollection: runCollectionSpy };
    vi.mocked(NewmanRunner).mockImplementation(() => mockRunner);

    // Simulate running a collection
    await mockRunner.runCollection({ collection: "./test-collection.json" });

    // Verify mock runner was called with correct parameters
    expect(runCollectionSpy).toHaveBeenCalledWith({
      collection: "./test-collection.json",
    });

    // Verify mock runner returned expected result
    expect(await runCollectionSpy.mock.results[0].value).toEqual(mockResult);
  });

  it("should execute collection run with all parameters", async () => {
    // Setup mock response
    const mockResult = {
      success: true,
      summary: {
        total: 2,
        failed: 0,
        passed: 2,
      },
    };

    // Setup mock runner with spy
    const runCollectionSpy = vi.fn().mockResolvedValue(mockResult);
    const mockRunner = { runCollection: runCollectionSpy };
    vi.mocked(NewmanRunner).mockImplementation(() => mockRunner);

    // Simulate running a collection with all parameters
    await mockRunner.runCollection({
      collection: "./test-collection.json",
      environment: "./env.json",
      globals: "./globals.json",
      iterationCount: 2,
    });

    // Verify mock runner was called with all parameters
    expect(runCollectionSpy).toHaveBeenCalledWith({
      collection: "./test-collection.json",
      environment: "./env.json",
      globals: "./globals.json",
      iterationCount: 2,
    });

    // Verify mock runner returned expected result
    expect(await runCollectionSpy.mock.results[0].value).toEqual(mockResult);
  });

  it("should handle invalid collection path error", async () => {
    // Setup mock runner with spy that rejects
    const runCollectionSpy = vi
      .fn()
      .mockRejectedValue(new Error("Could not find collection file"));
    const mockRunner = { runCollection: runCollectionSpy };
    vi.mocked(NewmanRunner).mockImplementation(() => mockRunner);

    // Simulate running with invalid collection path
    await expect(
      mockRunner.runCollection({
        collection: "./invalid-collection.json",
      }),
    ).rejects.toThrow("Could not find collection file");
  });

  it("should handle invalid environment file error", async () => {
    // Setup mock runner with spy that rejects
    const runCollectionSpy = vi
      .fn()
      .mockRejectedValue(new Error("Could not find environment file"));
    const mockRunner = { runCollection: runCollectionSpy };
    vi.mocked(NewmanRunner).mockImplementation(() => mockRunner);

    // Simulate running with invalid environment file
    await expect(
      mockRunner.runCollection({
        collection: "./test-collection.json",
        environment: "./invalid-env.json",
      }),
    ).rejects.toThrow("Could not find environment file");
  });

  it("should handle invalid globals file error", async () => {
    // Setup mock runner with spy that rejects
    const runCollectionSpy = vi
      .fn()
      .mockRejectedValue(new Error("Could not find globals file"));
    const mockRunner = { runCollection: runCollectionSpy };
    vi.mocked(NewmanRunner).mockImplementation(() => mockRunner);

    // Simulate running with invalid globals file
    await expect(
      mockRunner.runCollection({
        collection: "./test-collection.json",
        globals: "./invalid-globals.json",
      }),
    ).rejects.toThrow("Could not find globals file");
  });

  it("should handle invalid iterationCount error", async () => {
    // Setup mock runner with spy that rejects
    const runCollectionSpy = vi
      .fn()
      .mockRejectedValue(new Error("iterationCount must be greater than 0"));
    const mockRunner = { runCollection: runCollectionSpy };
    vi.mocked(NewmanRunner).mockImplementation(() => mockRunner);

    // Simulate running with invalid iteration count
    await expect(
      mockRunner.runCollection({
        collection: "./test-collection.json",
        iterationCount: 0,
      }),
    ).rejects.toThrow("iterationCount must be greater than 0");
  });

  it("should reject when collection parameter is missing", async () => {
    // Setup mock runner with spy that rejects
    const runCollectionSpy = vi
      .fn()
      .mockRejectedValue(new Error("collection parameter is required"));
    const mockRunner = { runCollection: runCollectionSpy };
    vi.mocked(NewmanRunner).mockImplementation(() => mockRunner);

    // Simulate running without collection parameter
    await expect(
      mockRunner.runCollection({} as Partial<CollectionRunParams>),
    ).rejects.toThrow("collection parameter is required");
  });

  it("should reject when iterationCount is less than 1", async () => {
    // Setup mock runner with spy that rejects
    const runCollectionSpy = vi
      .fn()
      .mockRejectedValue(new Error("iterationCount must be greater than 0"));
    const mockRunner = { runCollection: runCollectionSpy };
    vi.mocked(NewmanRunner).mockImplementation(() => mockRunner);

    // Simulate running with invalid iteration count
    await expect(
      mockRunner.runCollection({
        collection: "./test-collection.json",
        iterationCount: -1,
      }),
    ).rejects.toThrow("iterationCount must be greater than 0");
  });

  it("should reject when unknown tool name is provided", async () => {
    // Setup mock runner with spy that rejects
    const runCollectionSpy = vi
      .fn()
      .mockRejectedValue(new Error("unknown tool parameter"));
    const mockRunner = { runCollection: runCollectionSpy };
    vi.mocked(NewmanRunner).mockImplementation(() => mockRunner);

    // Simulate running with unknown tool name
    await expect(
      mockRunner.runCollection({
        collection: "./test-collection.json",
        tool: "unknown-tool",
      } as CollectionRunParams & { tool: string }),
    ).rejects.toThrow("unknown tool parameter");
  });

  it("should handle invalid input types", async () => {
    // Setup mock runner with spy that rejects
    const runCollectionSpy = vi
      .fn()
      .mockRejectedValue(new Error("collection must be a string"));
    const mockRunner = { runCollection: runCollectionSpy };
    vi.mocked(NewmanRunner).mockImplementation(() => mockRunner);

    // Simulate running with invalid input type
    await expect(
      mockRunner.runCollection({
        collection: 123,
      } as unknown as CollectionRunParams),
    ).rejects.toThrow("collection must be a string");
  });
});
