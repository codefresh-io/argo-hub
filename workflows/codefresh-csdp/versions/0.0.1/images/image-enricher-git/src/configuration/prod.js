module.exports = {
    apiToken: process.env.CF_API_KEY,
    commitsByUserLimit: process.env.CF_COMMITS_BY_USER_LIMIT || 5,
    host: process.env.CF_URL || 'https://g.codefresh.io',
    githubHost: process.env.GITHUB_HOST || 'github.com',
    image: process.env.IMAGE_SHA,
    branch: process.env.BRANCH,
    repo: process.env.REPO,
    githubToken: process.env.GITHUB_TOKEN,
    workingDirectory: process.env.WORKING_DIRECTORY || '/codefresh/volume',
    contextName: process.env.GIT_PROVIDER_NAME,
    githubAPI: process.env.GITHUB_API,
    apiPathPrefix: process.env.API_PATH_PREFIX,


    // setup these variables during init phase
    contextType: '',
    contextCreds: '',
};
