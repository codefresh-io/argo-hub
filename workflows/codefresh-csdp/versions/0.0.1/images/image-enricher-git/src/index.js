const Promise = require('bluebird');
const chalk = require('chalk');
const { image, v2 } = require('./configuration');
const codefreshApi = require('./codefresh.api');
const pullRequest = require('./pull-request');
const initializer = require('./initializer');

async function execute() {

    // init data from context and put it as config
    await initializer.init();

    const pullRequests = await pullRequest.get();

    console.log(chalk.green(`Retrieve prs ${JSON.stringify(pullRequests)}`));

    let isFailed = false;

    await Promise.all(pullRequests.map(async pr => {
        try {
            console.log(`Creating argo platform annotation for ${image}`);
            await codefreshApi.createPullRequestV2(pr);
        } catch (e) {
            console.log(`Failed to assign pull request ${pr.number} to your image ${image}, reason ${chalk.red(e.message)}`);
        }
    }));

    if(isFailed) {
        process.exit(1);
    }
}
execute()
    .catch(e => {
        console.log(chalk.red(e.message));
        process.exit(0);
    });
