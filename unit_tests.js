// Load the Module
const Logger = require("./index");

// Setup LogXYZ
const LoggerX = new Logger({_Type: Logger.StorageType().Remote_Server, _Connection: null});

Write2Console(`[LogXYZ Unit Tests] => Test [0]: Passed\n`);

// Test 0
// Loading Logger

// Test 1
// Console.Log Redirection

// Test 2
// Saving Logs [Txt]

// Test 3
// Saving Logs [JSON]

// Test 4
// Remote Redirection [Server]

// Test 4
// Remote Redirection [Client]

// Helpers
function Write2Console(m)
{
    process.stdout.write(m);
}