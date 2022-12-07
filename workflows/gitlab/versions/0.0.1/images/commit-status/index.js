const { Gitlab } = require('@gitbeaker/node');

const main = async () => {

    const owner = process.env.CF_REPO_OWNER;
    const repo = process.env.CF_REPO_NAME;
    const revision = process.env.CF_REVISION;
    const targetURL = process.env.CF_BUILD_BASE_URL;
    const description = process.env.DESCRIPTION;
    const state = process.env.STATE;
    const context = process.env.CONTEXT;
    const pipeline_id = process.env.PIPELINE_ID;
    try {
        const host = process.env.GITLAB_HOST || 'gitlab.com';
        const api = new Gitlab({
            host: `https://${host}`,
            token: process.env.GITLAB_TOKEN,
        });
        const result = await api.Commits.editStatus(`${owner}/${repo}`, revision, { context, state, target_url: targetURL, description, pipeline_id });
        console.log(JSON.stringify(result));

    } catch (err) {
        console.error(`Unexpected error: ${err.stack}. \nExiting.`);
        process.exit(1);
    }
}

main();
