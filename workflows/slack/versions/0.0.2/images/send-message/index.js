
const Mode = require('./src/mode');

if (!process.env.SLACK_HOOK_URL) {
    console.error('SLACK_HOOK_URL env variable should be present');
    process.exit(1);
}

Mode.send(process.env.MODE);
