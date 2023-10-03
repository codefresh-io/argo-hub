// registering error handler
require('./outputs');

const _ = require('lodash');
const chalk = require('chalk');

const configuration = require('./configuration');
const codefreshApi = require('./codefresh.api');
const providers = require('./providers');

async function main() {
    console.log('starting git enricher')

    const [ validationError, inputs ] = configuration.validateInputs()
    if (validationError) {
        throw validationError
    }

    const provider = await providers.get(inputs.provider);

    const pullRequests = await provider.getPullRequestsWithCommits(inputs.repo, inputs.branch);
    if (_.isEmpty(pullRequests)) {
        console.warn(`no PRs have been found, looking for the branch data`);

        const branch = await provider.getBranch(inputs.repo, inputs.branch);
        if (branch) {
            // branch exists without PR, try to take git data from branch
            await codefreshApi.patchImageWithGitBranchData(inputs.imageName, branch)
            console.log(`image patched`);
        } else {
            console.warn(`branch "${inputs.branch}" not found, ensure that it is not deleted`)
        }
    } else {
        console.log(chalk.green(`retrieved prs ${JSON.stringify(pullRequests)}`));

        // PR exists, taking git data from PR commits
        const lastCommit = getTheMostRecentCommit(pullRequests)
        await codefreshApi.patchImageWithGitBranchData(inputs.imageName, {
            name: inputs.branch,
            commit: lastCommit.sha,
            commitMsg: lastCommit.message,
            commitURL: lastCommit.url,
            committerUsername: lastCommit.userName
        })
        console.log(`image patched`);

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
}

function getTheMostRecentCommit(prs) {
    const prsSortedByDateAsc = prs.sort((pr1, pr2) => {
        return new Date(pr1.prDate).getTime() - new Date(pr2.prDate).getTime()
    })
    const recentPR = _.last(prsSortedByDateAsc)

    const prCommitsSortedByDateAsc = recentPR.commits.sort((c1, c2) => {
        return new Date(c1.commitDate).getTime() - new Date(c2.commitDate).getTime()
    })
    return _.last(prCommitsSortedByDateAsc)
}


main();
