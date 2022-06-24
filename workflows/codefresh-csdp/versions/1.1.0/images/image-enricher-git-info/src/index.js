const _ = require('lodash');
const chalk = require('chalk');
const configuration = require('./configuration');
const codefreshApi = require('./codefresh.api');
const providers = require('./providers');
const { OUTPUTS, storeOutputParam, ensureOutputFilesExists } = require('./outputs');

async function run() {
    const [ validationError, inputs ] = configuration.validateInputs()

    if (validationError) {
        throw validationError
    }

    const provider = await providers.get(inputs.provider);

    // maybe we should use SHA:
    // * works even when branch was deleted
    // * more consistent because branch is reference that can be updated
    const branch = await provider.getBranch(inputs.repo, inputs.branch);
    if (branch) {
        await codefreshApi.patchImageWithGitBranchData(inputs.imageDigest, branch)
    } else {
        console.warn(`branch "${inputs.branch}" not found, it could be deleted, continue execution`)
    }

    const pullRequests = await provider.getPullRequestsWithCommits(inputs.repo, inputs.branch);
    if (!_.isEmpty(pullRequests)) {
        console.log(chalk.green(`retrieve prs ${JSON.stringify(pullRequests)}`));
    } else {
        console.warn(`not PRs have been found`);
        return
    }

    for (const pr of pullRequests) {
        try {
            console.log(`creating argo platform annotation for image ${inputs.imageName}`);
            await codefreshApi.createPullRequestAnnotation(inputs.imageName, pr);
            console.log(`annotation created`);
        } catch (e) {
            throw new Error(`failed to assign pull request ${pr.number} to your image ${inputs.imageName}, reason: ${e.message}`);
        }
    }
}

const main = async () => {
    try {
        ensureOutputFilesExists()

        console.log('starting program')
        await run();
    } catch (err) {
        const outputErrMessage = `${err.name}: ${err.message}`
        storeOutputParam(OUTPUTS.EXIT_ERROR, outputErrMessage)

        console.error(err);
        process.exit(1);
    }
};

main();
