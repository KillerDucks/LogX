const net = require('net');
const util = require('util')

/**
 *
 *
 * @class Remote
 */
class Remote {

    constructor(_Type = "Server", _IP = "127.0.0.1", _Port = 9012, _ID_Gen = this.GenerateUID, _Checksum = false)
    {
        // Must be an easier way than this
        this._Type = _Type;
        this._Port = _Port;
        this._IP = _IP;
        this._ID_Gen = _ID_Gen;
        this._Checksum = _Checksum;

        // Trial Code
        this._Message_Stack = [];
        this._Connected_Clients = [];

        this.RemoteInit();
    }

    RemoteInit()
    {
        if(this._Type == "Server")
        {
            // Server Code init
            this.RemoteServer = net.createServer();
            this.RemoteServer.on('connection', this.HandleServerConnection.bind(this));
            this.RemoteServer.on('error', this.HandleServerError.bind(this));
            this.RemoteServer.on('close', this.HandleServerClose.bind(this));
            this.RemoteServer.listen(this._Port, this.RemoteServerListen.bind(this));
        }
        else
        {
            // Client Code init
            this.RemoteClient = net.createConnection({port: this._Port, host: this._IP}, this.RemoteServerListen.bind(this));
            this.RemoteClient.setEncoding("utf-8");
            this.RemoteClient.on('data', this.HandleDataIn.bind(this))
            this.RemoteClient.on('error', this.HandleError.bind(this));
        }
    }

    InternalWriter(msg)
    {
        if(this._Message_Stack.length == 50)
        {
            this._Message_Stack = [];
            console.log(`Message Stack Reset`);
        }
        // Write to the stack then push to the client (ADDED OBJECT DETECTION)
        this._Message_Stack.push(msg);
        let x = this._Connected_Clients.length;

        // Debug
        // process.stdout.write(`Number Of Connected Clients -> ${x}\n`);

        // Fix this approach later
        if(this._Connected_Clients.length != 0)
        {
            this._Connected_Clients.forEach(client => {  
                if(client.writable)
                {
                    client.write(this._Message_Stack[this._Message_Stack.length - 1]);
                } 
            }); 
        }
    }

    CloseRemote()
    {
        if(this._Type == "Server")
        {
            // Shutdown Server
            if(this.RemoteServer)
            {
                this.RemoteServer.close(this.HandleServerError.bind(this));
            }
        }
        else
        {
            // Close Client
            if(this.RemoteClient)
            {
                this.RemoteClient.end(() => { console.log("Client has closed") });
            }
        }
    }

    // Event Helpers
    RemoteServerListen()
    {
        if(this._Type == "Server")
        {
            console.log(`Server is now waiting on port ${this._Port}`);
        } 
        else
        {
            console.log(`Client is now listening on port ${this._Port}`);
        }
    }

    HandleDataIn(data)
    {
        try
        {
            // console.log(util.inspect(JSON.parse(data), false, null, true) + '\n');
            console.log(`[${JSON.parse(data).AppName}]\t${JSON.parse(data).Info}\n`);
        } catch (err)
        {
            // console.log(data + '\n');
        }
    }

    HandleServerClose()
    {
        console.log("Server is closed");
    }

    HandleServerConnection(connection)
    {
        // console.log(connection)
        console.log("Client Connected");

        // this.InternalWriter("Debugging Client Connected\n");

        // Added the Client connection to the global scope (maybe a bad idea ???)
        this._Connected_Clients.push(connection);

        // console.log(this._Connected_Clients.length);
        // console.log(this._Message_Stack.length);

        // Send all of the stack Queue to the client (if the queue has any messages)
        if(this._Message_Stack.length != 0)
        {
            for (const msg in this._Message_Stack) {
                // Check if the Connection is writable
                // if(connection.writeable)
                // {`
                // process.stdout.write(`Number ${msg}\n`);
                // process.stdout.write(`Stack ${this._Message_Stack.length}\n`);
                connection.write((typeof(this._Message_Stack[msg]) == "object") ?  JSON.stringify(this._Message_Stack[msg]) : this._Message_Stack[msg]);
                // }
            }

            // Send Allow to Terminate Signal
            // connection.write("SOCKTERMOKAY");
            // connection.destroy();
        }

        connection.on('end', () => {
            connection.end();
            console.log("Client Sent FIN");
            // Fix this approach 
            this._Connected_Clients.pop();
        });

        connection.on("destroy", () => {
            console.log("We are hit");
        });

        connection.on('disconnect', () =>{
            console.log("Client Disconnected");
            // Fix this approach 
            this._Connected_Clients.pop();
        })
    }

    HandleError(error)
    {
        console.log("Client Connection Error!");
        console.log(error);
        // throw error;
    }

    HandleServerError(error)
    {
        // throw error;
        console.log("We are hit");
        console.log(error);
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
};

module.exports = Remote;