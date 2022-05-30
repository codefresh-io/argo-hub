const inputs = require('../configuration').inputs;
const providers = require('../configuration').providers;
const GithubService = require('./github');
const BitbucketService = require('./bitbucket');
const GitlabService = require('./gitlab');

class GitProviders {

    async get() {
        switch (inputs.provider) {
            case providers.GITHUB:
                return GithubService;
            case providers.BITBUCKET:
                return BitbucketService;
            case providers.GITLAB:
                return GitlabService;
            default:
                throw new Error(`Provider ${inputs.provider} is not supported`)
        }
    }
}
module.exports = new GitProviders();
