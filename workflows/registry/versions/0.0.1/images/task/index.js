const _ = require('lodash');

let var_1, var_2;

const logic = async () => {
    try {
        console.log('run logic');
    } catch (err) {
        console.log('handle error');
        throw err;
    }
}

const flow = async () => {
    await logic();
}

const main = async () => {
    var_1 = process.env.VAR_1;
    var_2 = process.env.VAR_2;
    try {
        await flow();
    } catch (err) {
        console.error(`Unexpected error: ${err.stack}. \nExiting.`);
        process.exit(1);
    }
}

main();
