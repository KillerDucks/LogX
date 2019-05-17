// Load the Module
const Logger = require("../index");

// console.log("Loading...");
// // console.log(Array(100).keys());
// async function x()
// {
//     for(const i of Array(100).keys())
//     {
//         // time.sleep(0.1)
//         await sleep(20)
//         let width = (i + 1) / 4
//         let bar = "[" + "#" * width + " " * (25 - width) + "]"
//         // process.stdout.write("\u001b[1000D" + String(i + 1) + "%")
//         process.stdout.write("\u001b[1000D" +  bar);
//         // process.stdout.flush();
//         // console.log(bar)
//     }
//     process.stdout.write("\n");
// }

async function O()
{
    for(const i of Array(100).keys())
    {
        await sleep(20)
        let width = (i + 1) / 4
        let hashDupe = '';
        let spaceDupe = "";
        for(let x = 0; x < width; x++)
        {
            hashDupe += "#"
        }
        for(let x = 0; x < Math.round(24 - width); x++)
        {
            spaceDupe += " "
        }
        let bar = "[" + hashDupe + spaceDupe + "]"
        // console.log(bar);
        process.stdout.write("\u001b[1000D" +  bar);
    }
    process.stdout.write("\n");
}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

// const doSomething = async () => {
//     await sleep(2000)
//     console.log("Test")
//     await sleep(2000)
//     console.log("Okay")
// }

// doSomething()
// x()
O();