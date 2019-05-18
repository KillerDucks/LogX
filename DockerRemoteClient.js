// This file is for a container instance of LogXYZ Remote Client.
// This will be setup in a way that the Remote IP will be either 
// localhost (127.0.0.1) or if not undefined a process.env variable
// the name of the ENV you need to configure is called
// LOGXYZ_SERVER_IP you can set this when you run the
// Docker container.

// Load the Module
const Logger = require("./index");

// Setup LogXYZ
const LoggerX = new Logger({_Type: Logger.StorageType().Remote_Client, _Connection: (process.env.LOGXYZ_SERVER_IP == undefined) ? null : process.env.LOGXYZ_SERVER_IP}, {
    _ID_Gen: null,
    _appName: null,
    _log_Folder: null,
    _timeFormat: null,
    _EXP_Options: {
        Colour: "Yellow",
        ColourEnable: true
    }
});