const Promise = require('bluebird');
const _ = require('lodash');
const chalk = require('chalk');
const configuration = require('./configuration');
const codefreshApi = require('./codefresh.api');
const providers = require('./providers');

async function execute() {
    try {
        const inputs = configuration.validateInputs();

        const provider = await providers.get(inputs.provider);

        // maybe we should use SHA:
        // * works even when after branch was deleted
        // * more consistent because branch is reference that can be updated
        const branch = await provider.getBranch(inputs.repo, inputs.branch);
        if (branch) {
            // await codefreshApi.patchImageWithGitBranchData(inputs.imageName, inputs.imageDigest, branch)
            // await codefreshApi.createRevisionAnnotation(inputs.imageDigest, branch);   
        }

        const pullRequests = await provider.getPullRequestsWithCommits(inputs.repo, inputs.branch);
        if (!_.isEmpty(pullRequests)) {
            console.log(chalk.green(`Retrieve prs ${JSON.stringify(pullRequests)}`));

            await Promise.all(pullRequests.map(async pr => {
                try {
                    console.log(`Creating argo platform annotation for ${inputs.imageName}`);
                    const result = await codefreshApi.createPullRequestAnnotation(inputs.imageName, pr);
                    if (result) {
                        console.log(JSON.stringify(result));
                    }
                } catch (e) {
                    console.log(`Failed to assign pull request ${pr.number} to your image ${inputs.imageDigest}, reason ${chalk.red(e.message)}`);
                }
            }));
        }

    } catch (e) {
        console.error(e.stack);
        process.exit(1);
    }
}

execute()
