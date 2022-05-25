import * as Joi from 'joi'

export const config = {
    github: {
        host: process.env.GITHUB_HOST?.trim() || 'api.github.com',
        token: process.env.GITHUB_TOKEN?.trim(),
        api: process.env.GITHUB_API?.trim() || '',
        pathPrefix: process.env.GITHUB_API_PATH_PREFIX?.trim(),
    },
    bitbucket: {
        host: process.env.BITBUCKET_HOST?.trim() || 'bitbucket.com',
        token: process.env.BITBUCKET_TOKEN?.trim(),
        api: process.env.BITBUCKET_API?.trim(),
        pathPrefix: process.env.BITBUCKET_API_PATH_PREFIX?.trim(),
    },
    gitlab: {
        host: process.env.GILAB_HOST?.trim() || 'gitlab.com',
        token: process.env.GITLAB_TOKEN?.trim(),
        api: process.env.GITLAB_API?.trim(),
        pathPrefix: process.env.GITLAB_API_PATH_PREFIX?.trim(),
    },
    owner: process.env.OWNER?.trim(),
    repo: process.env.REPO?.trim(),
    title: process.env.TITLE,
    head:  process.env.HEAD?.trim(),
    base: process.env.BASE?.trim(),
    prWorkflow: process.env.PR_WORKFLOW,
    outputFilePath: process.env.OUTPUT_FILE_PATH
};

const schema = Joi.object({
    github: Joi.object({
        host: Joi.string(),
        token:  Joi.string(),
        api: Joi.string().allow(''),
        pathPrefix: Joi.string().allow('')
    }),
    gitlab: Joi.object({
        host: Joi.string(),
        token: Joi.string(),
        api: Joi.string().allow(''),
        pathPrefix: Joi.string().allow('')
    }),
    bitbucket: Joi.object({
        host: Joi.string(),
        token: Joi.string(),
        api: Joi.string().allow(''),
        pathPrefix: Joi.string().allow('')
    }),
    owner: Joi.string().required(),
    repo: Joi.string().required(),
    title: Joi.string().required(),
    head: Joi.string().required(),
    base: Joi.string().required(),
    prWorkflow: Joi.string(),
    outputFilePath: Joi.string().allow('')
})
    .oxor('github.token', 'bitbucket.token', 'gitlab.token')
    .or('github.token', 'bitbucket.token', 'gitlab.token')
    .or('github.host', 'bitbucket.host', 'gitlab.host')

export function validateConfig() {
    const res  = schema.validate(config, { abortEarly: false})
    if (res.error) {
        throw new Error(res.error.message)
    }
}