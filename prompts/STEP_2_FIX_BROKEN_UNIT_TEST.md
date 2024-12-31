After analyzing both the server implementation and test file, here are the key test scenarios that should be covered for the PostmanServer class:

Server Initialization Tests:

Server should be properly initialized with correct name and version
NewmanRunner should be instantiated
Tools should be properly registered during setup
Tool Listing Tests:

Should list exactly one tool named "run-collection"
Tool description should be present
Input schema should correctly specify required and optional parameters:
collection (required, string)
environment (optional, string)
globals (optional, string)
iterationCount (optional, number)
Collection Running Tests:

Successful collection run with minimal parameters (just collection path)
Successful collection run with all optional parameters
Error handling for invalid collection path
Error handling for invalid environment file
Error handling for invalid globals file
Error handling for invalid iterationCount (less than 1)

Input Validation Tests:

Should reject when collection parameter is missing
Should reject when iterationCount is less than 1
Should reject when unknown tool name is provided
Should handle invalid input types (e.g., number for collection path)
Response Format Tests:

Successful response should have correct structure with content array
Error response should have isError flag and proper error message
Response should properly stringify Newman runner results
Response should maintain proper JSON-RPC 2.0 format
Looking at the current test file:

Most tests are commented out
The only active test is a basic initialization test
The mock transport setup is commented out, which is needed for proper MCP server testing
The NewmanRunner mock is set up but not fully utilized
The test file needs to be fixed by:

Implementing proper transport mocking
Uncommenting and fixing the existing tests
Adding missing test cases for complete coverage
Ensuring proper error handling tests
Adding validation for all optional parameters
Would you like me to proceed with implementing these test cases?
