const Joi = require('joi')
const _ = require('lodash')

const providers = {
    GITHUB: 'github',
    BITBUCKET: 'bitbucket',
    BITBUCKET_SERVER: 'bitbucket-server',
    GITLAB: 'gitlab'
}

const inputs = {
    provider: process.env.GIT_PROVIDER?.trim(),
    cfHost: process.env.CF_HOST_URL?.trim() || 'https://g.codefresh.io',
    cfApiKey: process.env.CF_API_KEY?.trim(),
    imageName: process.env.IMAGE_NAME?.trim(),
    imageDigest: process.env.IMAGE_SHA?.trim(),
    repo: process.env.REPO?.trim(),
    branch: process.env.BRANCH?.trim(),

    // github
    githubApiHost: process.env.GITHUB_API_HOST_URL?.trim() || 'https://api.github.com',
    githubToken: process.env.GITHUB_TOKEN?.trim(),
    githubApiPathPrefix: process.env.GITHUB_API_PATH_PREFIX?.trim() || '/',
    githubContextName: process.env.GITHUB_CONTEXT?.trim(),

    // gitlab
    gitlabHost: process.env.GITLAB_HOST_URL?.trim() || 'https://gitlab.com',
    gitlabToken: process.env.GITLAB_TOKEN?.trim(),

    // bitbucket
    bitbucketHost: process.env.BITBUCKET_HOST_URL?.trim() || 'https://api.bitbucket.org/2.0',
    bitbucketUsername: process.env.BITBUCKET_USERNAME?.trim(),
    bitbucketPassword: process.env.BITBUCKET_PASSWORD?.trim(),

    commitsByUserLimit: Number(process.env.CF_COMMITS_BY_USER_LIMIT?.trim()) || 5,
};

const schema = Joi.object({
    GIT_PROVIDER: Joi.string().valid(...Object.values(providers)).required(),
    CF_HOST_URL: Joi.string().uri().empty(''),
    CF_API_KEY: Joi.string().required(),
    IMAGE_NAME: Joi.string().required(),
    IMAGE_SHA: Joi.string().required(),
    REPO: Joi.string().required(),
    BRANCH: Joi.string().required(),

    // others
    CF_COMMITS_BY_USER_LIMIT: Joi.number(),
})
.when(Joi.object({ GIT_PROVIDER: Joi.valid(providers.GITHUB) }).unknown(), {
    then: Joi.object({
        GITHUB_API_HOST_URL: Joi.string().uri().empty(''),
        GITHUB_TOKEN: Joi.string().empty(''),
        GITHUB_API_PATH_PREFIX: Joi.string().uri({ relativeOnly: true }).empty(''),
        GITHUB_CONTEXT: Joi.string().empty(''),
    }).xor('GITHUB_CONTEXT', 'GITHUB_TOKEN')
})
.when(Joi.object({ GIT_PROVIDER: Joi.valid(providers.GITLAB) }).unknown(), {
    then: Joi.object({
        GITLAB_HOST_URL: Joi.string().uri().empty(''),
        GITLAB_TOKEN: Joi.string().required()
    })
})
.when(Joi.object({ GIT_PROVIDER: Joi.valid(providers.BITBUCKET_SERVER) }).unknown(), {
    then: Joi.object({
        BITBUCKET_HOST_URL: Joi.string().uri().empty(''),
        BITBUCKET_USERNAME: Joi.string().required(),
        BITBUCKET_PASSWORD: Joi.string().required()
    })
})
.when(Joi.object({ GIT_PROVIDER: Joi.valid(providers.BITBUCKET) }).unknown(), {
    then: Joi.object({
        BITBUCKET_HOST_URL: Joi.string().uri().empty(''),
        BITBUCKET_USERNAME: Joi.string().required(),
        BITBUCKET_PASSWORD: Joi.string().required()
    })
});

module.exports = {
    inputs,

    providers,

    validateInputs() {
        const { error } = schema.validate(process.env, { allowUnknown: true });
        return [ error, this.inputs ];
    }
}
