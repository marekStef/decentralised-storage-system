// const helloWorld = (accessTokensToProfiles, configuration, clientCustomData) => {
//     setTimeout(() => {
//         return {
//             message: 'this is object from view',
//             helloMessage: getResponseMessage(),
//             accessTokensToProfiles,
//             configuration,
//             clientCustomData
//         }
//     }, 10000);
// }

// async function main(args) {
//     console.log("Arguments received:", args);
//     // console.log(global.args);
//     // return JSON.stringify(global);
//     const response = await global.fetch.apply(undefined, ['https://dummy.restapiexample.com/api/v1/employees', "{}"]);
//     return JSON.stringify(response);
//     // helloWorld(...args)
//     //     .then(() => {
//     //         return args.length; // Just an example return value
//     //     })
//     //     .catch(() => {

//     //     })
// }
// // "global.args" will be set from the Node.js script
// // return global.args;
// main(global.args).then(result => {
//     // Ensure you have a mechanism to handle the resolved value of main in your ivm setup.
//     return 3;
// });

const { getResponseMessage } = require('./second');

const helloWorld = async (accessTokensToProfiles, configuration, clientCustomData) => {
    return new Promise((res, rej) => {
        fetch('https://dummy.restapiexample.com/api/v1/employees')
            .then(response => {
                setTimeout(() => {
                    res({
                        message: 'this is object from view',
                        helloMessage: getResponseMessage(),
                        accessTokensToProfiles,
                        configuration,
                        clientCustomData,
                        status: response.status
                    });
                }, 1000);
            })
            .catch(err => {
                res({
                    message: 'could not load fake json data from net'
                })
            })
    })
}

module.exports = helloWorld;