const Remote = require("./Remote");

// Remote Server
// const RS = new Remote("Server");

// Remote Client
const RC = new Remote("Client");

RC.RemoteClient.on('data', (data) => {
    if(typeof(data) != "object")
    {
        if(data == "SOCKTERMOKAY")
        {
            console.log("Terminating")
            RC.RemoteClient.end();
        }
    }
    console.log((typeof(data) == "object") ? JSON.stringify(data, null, 4) : data);
});

RC.RemoteClient.on('connect', () => {
    console.log("[Sandbox] Connected");
})

// RS.InternalWriter("Test\n");

// RC.CloseRemote();
// while(!RC.RemoteClient)
// {
//     RS.CloseRemote();
//     break;
// }