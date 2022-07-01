const { Octokit } = require("@octokit/rest");

let octokit, owner, repo, revision, targetURL, description, context, state;

const setGitStatus = async () => {
    try {
        await octokit.repos
            .createCommitStatus({
                owner: owner,
                repo: repo,
                sha: revision,
                state,
                target_url: targetURL,
                description,
                context,
            });
    } catch (err) {
        throw new Error(`Failed to report status to github with error: ${JSON.stringify(err ? err.message : '')} for repo: ${repo} revision: ${revision}`);
    }
}

const flow = async () => {
    await setGitStatus();
}

const main = async () => {
    octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    owner = process.env.CF_REPO_OWNER;
    repo = process.env.CF_REPO_NAME;
    revision = process.env.CF_REVISION;
    targetURL = `${process.env.CF_BUILD_BASE_URL || 'https://g.codefresh.io/build/'}${process.env.CF_BUILD_ID}`;
    description = process.env.DESCRIPTION;
    context = process.env.CONTEXT;
    state = process.env.STATE;

    try {
        await flow();
    } catch (err) {
        console.error(`Unexpected error: ${err.stack}. \nExiting.`);
        process.exit(1);
    }
}

main();
