// Structs
const Structs = require("./Structures");

// Remote Mini-Module
const Remote = require("./Remote");

/**
 *
 * 
 * @version 1.1.0
 * @class Logger
 */
class Logger { 
    /**
     *Creates an instance of Logger.
     * @param {Object} _storage
     * @param {Number} _timeFormat
     * @memberof Logger
     */
    constructor(_storage = new Structs.StorageClass(3), _ID_Gen = this.GenerateUID, _timeFormat = 0, _appName = "LogX", _log_Folder = "LogX"){
        this._storage = _storage;
        this._timeFormat = _timeFormat;
        this._appName = _appName;
        this._ID_Gen = _ID_Gen;
        this._log_Folder = _log_Folder;
        this.LoggerInit();       
    }

    LoggerInit(){
        // Handles directory setup plus stream handling (for JSON)
        if(this._storage._Type == 1 || this._storage._Type == 2)
        {
            // Check if the folder exists
            let z = require('fs').readdirSync(`./`).some((folder) => {
                if(folder == this._log_Folder) 
                {
                    return true;
                }
            });
            // If the specified folder is not found output to the root dir
            if(!z){
                this._log_Folder = '';
            }
            // Set File name for this session
            this._log_Filename = `${this._appName}-${this._ID_Gen}`;
            // If JSON storage type is set create a writable stream
            if(this._storage._Type == 1){
                this._json_file_writer = require('fs').createWriteStream(`./${this._log_Folder}/${this._log_Filename}.json`, {encoding: 'utf8', flags: 'a', autoClose: true});
                if(this.CheckFileStream())
                {
                    this._json_file_writer.on('close', this.HandleStreamClose.bind(this));
                    this._json_file_writer.on('error', this.HandleStreamClose.bind(this));

                    this._json_file_writer.write("[\n\t", (error) => {
                        if(error) throw new Error(`[FATAL ERROR] ${data.TimeStamp} [LoggerX_JSON_File_Writer]\t Unable to Write Log into File: ${this._log_Filename}!!\n\t\t\t[FATAL ERROR] [LoggerX] => [Internal System] Module Panic\nQuitting...`);
                    });
                }
            }

            // Sets the first line flag for a JSON storage option
            this._isFirstLine = true;
        }

        // Handles the initial setup of Remote storage types
        if(this._storage._Type == 4 || this._storage._Type == 5){
            // Initial Setup of a Remote Client setup
            if(this._storage._Type == 4)
            {
                this.Log({Namespace: "LogXYZ_Info", Info: "This feature is currently under development and is classed as Experimental, please use with caution"});
                this.RemoteClient = new Remote("Client");
            }

//  Possible to use `else` here might refactor later on

            // Initial Setup of a Remote Server setup
            if(this._storage._Type == 5)
            {
                this.Log({Namespace: "LogXYZ_Info", Info: "This feature is currently under development and is classed as Experimental, please use with caution"});
                this.RemoteServer = new Remote("Server");
            }
        }

        // Starts the Console.log() redirect
        this.InterceptConsole();

        // Print out the set configuration 
        this.Log({Namespace: "LoggerX_Init", Info: `LoggerX has been setup to use ${this.StorageType[this._storage._Type]} with a Timestamp format of ${this.TimeFormats[this._timeFormat]}${(this._storage._Type == 1 || this._storage._Type == 2) ? `, log files are stored in ${this._log_Folder}` : ``}`});
    }

    Log(data){
        // Format + Add Metadata
        data.TimeUnix = Date.now();
        data.TimeStamp = this.TimeNow();
        data._ID = this._ID_Gen;
        data.AppName = this._appName;

        let currentLog = `${data.TimeStamp} [${this._appName}] => [${data.Namespace}]\t ${data.Info}`;

        switch (this._storage._Type) {
            case 0:       
                // MongoDB
                this._storage._Connection.InsertRow(data, (status) => {
                    if(!status) throw new Error(`[FATAL ERROR] ${data.TimeStamp} [LoggerX_DB]\t Unable to Insert Log into Database!!\n\t\t\t[FATAL ERROR] [LoggerX] => [Internal System] Module Panic\nQuitting...`);
                }, "LoggerX");                
                break;

            case 1:
                // JSON File.
                // Check for JSON file writer
                if(!this.CheckFileStream())
                { 
                    break;
                }
                if(this._isFirstLine)
                {
                    this._json_file_writer.write('\n' + JSON.stringify(data), (error) => {
                        if(error) throw new Error(`[FATAL ERROR] ${data.TimeStamp} [LoggerX_JSON_File_Writer]\t Unable to Write Log into File: ${this._log_Filename}!!\n\t\t\t[FATAL ERROR] [LoggerX] => [Internal System] Module Panic\nQuitting...`);
                    });
                } 
                else 
                {
                    this._json_file_writer.write(',\n' + JSON.stringify(data), (error) => {
                        if(error) throw new Error(`[FATAL ERROR] ${data.TimeStamp} [LoggerX_JSON_File_Writer]\t Unable to Write Log into File: ${this._log_Filename}!!\n\t\t\t[FATAL ERROR] [LoggerX] => [Internal System] Module Panic\nQuitting...`);
                    });
                }

                
                this._isFirstLine = false;
                break;

            case 2:
                // Text File
                require('fs').writeFile(`./${this._log_Folder}/${this._log_Filename}.txt` , currentLog + `\n`, {encoding: 'utf8', flag: 'a'}, (err) => {
                    if(err) throw new Error(`[FATAL ERROR] ${data.TimeStamp} [LoggerX_FileWriter]\t Unable to Write Log into File: ${this._log_Filename}!!\n\t\t\t[FATAL ERROR] [LoggerX] => [Internal System] Module Panic\nQuitting...`);
                });
                break;

            case 4:
                // Remote Link [Client]
                // No code is needed here 
                break;

            case 5:
                // Remote Link [Server]
                this.RemoteServer.InternalWriter(JSON.stringify(data) + "\n");
                break;
        
            default:
                // We should never hit the default statement
                break;
        }
        // Log to the Console (Also Counts as option 3 [ConsoleOnly])
        process.stdout.write(currentLog + "\n");
    }



    /**
     *
     * @description Redirects all `console.log()` outputs to internal Logger `Logger.Log()`
     * @memberof Logger
     */
    InterceptConsole()
    {
        console.log = function(a){
            this.Log({Namespace: "Console_Redirect", Info: (typeof(a) == "object") ? '\n\t\t\t\t\t\tJSON Object Output\n' + JSON.stringify(a, null, 4) : a})
        }.bind(this);
    }

    /**
     *
     * @description A function to gracefully close the JSON File Writer
     * @memberof Logger
     */
    LogX_Close()
    {
        if(this.CheckFileStream())
        {
            this._json_file_writer.write('\n]');
            this._json_file_writer.end();
        }
    }

    HandleStreamClose()
    {
        // Display message to the console
        this._storage._Type = 3;
        this.Log({Namespace: "Internal", Info: "The JSON File Streamer has now closed"});
        this.Log({Namespace: "Internal", Info: "Quitting LogX..."});
    }

    // Helpers

    GenerateUID()
    {
        let result, i, j;
        result = '';
        for(j=0; j<32; j++) {
            if( j == 8 || j == 12 || j == 16 || j == 20) 
            result = result;
            i = Math.floor(Math.random()*16).toString(16).toUpperCase();
            result = result + i;
        }
        return result;
    }
    
    /**
     *
      *@description Allows for easier debugging messages of internal code
     * @param {string} msg
     * @param {number} [level=1]
     * @memberof Logger
     */
    LogD(msg, level = 1)
    {
        switch (level) {
            case 0:
                process.stdout.write((typeof(a) == "object") ? '\n\t\t\t\t\t\tJSON Object Output\n' + JSON.stringify(msg, null, 4) + '\n' : `\x1b[36m${this.TimeNow()} [${this._appName}] => [Debug !Level 0!] ${msg}\x1b[0m\n`);
                break;
        
            default:
                this.Log({Namespace: 'Debug', Info: msg});
                break;
        }
    }

    /**
     *
     *
     * @returns A Boolean on the state of the writable stream
     * @memberof Logger
     */
    CheckFileStream()
    {
        if(this._storage._Type == 1)
        {
            if(!this._json_file_writer)
            {
                this._storage._Type = 3;
                this.Log({Namespace: "JSON_File_Writer", Info: "There is no File Stream Context!"})
                this.Log({Namespace: "JSON_File_Writer", Info: "Falling Back to ConsoleOnly"})
                return false;
            }
            if(!this._json_file_writer.writable){
                this._storage._Type = 3;
                this.Log({Namespace: "JSON_File_Writer", Info: `Unable to Write Log into File: ${this._log_Filename}`})
                this.Log({Namespace: "JSON_File_Writer", Info: "Falling Back to ConsoleOnly"})
                return false;
            }
        } 
        else 
        {
            return false;
        }

        return true;
    }

    /**
     *
     *
     * @returns A Timestamp in the predefined formats
     * @memberof Logger
     */
    TimeNow(){
        if(this._timeFormat != 0) { return Date.now(); };
        return `[${new Date().toLocaleString()}]`;
    }

    /**
     *
     *
     * @static
     * @returns {Number} Integer Value of Storage Type
     * @memberof Logger
     */
    static StorageType(){
        return Object.freeze({"MongoDB": 0, "Json_File": 1, "Text_File": 2, "ConsoleOnly": 3, "Remote_Client": 4, "Remote_Server": 5});
    }

    static TimeFormats(){
        return Object.freeze({"Vanilla": 0, "Unix": 1});
    }

    get StorageType(){
        return Object.freeze({0: "MongoDB", 1: "Json_File", 2: "Text_File", 3: "ConsoleOnly", 4: "Remote_Client", 5: "Remote_Server"});
    }

    get TimeFormats(){
        return Object.freeze({0: "Vanilla", 1: "Unix"});
    } 
};

module.exports = Logger;