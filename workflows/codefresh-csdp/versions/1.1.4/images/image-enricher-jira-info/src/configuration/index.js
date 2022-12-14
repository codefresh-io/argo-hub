const Joi = require('joi')
const _ = require('lodash')

const inputs = {
    cfHost: process.env.CF_HOST_URL?.trim() || 'https://g.codefresh.io',
    cfApiKey: process.env.CF_API_KEY?.trim(),
    imageName: process.env.IMAGE_NAME?.trim(),
    projectName: process.env.JIRA_PROJECT_PREFIX?.trim(),
    message: process.env.JIRA_MESSAGE?.trim(),
    jira: {
        host: process.env.JIRA_HOST_URL?.trim(),
        newErrorHandling: true,
        authentication: {
            // if true or undefined
            ...(process.env.JIRA_USE_BASIC_AUTH !== 'false' && {
                basic: {
                    email: process.env.JIRA_EMAIL?.trim(),
                    apiToken: process.env.JIRA_API_TOKEN?.trim(),
                }
            }),
            ...(process.env.JIRA_USE_BASIC_AUTH === 'false' && {
                personalAccessToken: process.env.JIRA_API_TOKEN?.trim()
            }),
        },
        context: process.env.JIRA_CONTEXT?.trim(),
    },
    failOnNotFound: process.env.FAIL_ON_NOT_FOUND?.trim()
};

const schema = Joi.object({
    CF_HOST_URL: Joi.string().uri().empty(''),
    CF_API_KEY: Joi.string().required(),
    IMAGE_NAME: Joi.string().required(),
    FAIL_ON_NOT_FOUND: Joi.boolean(),

    JIRA_CONTEXT: Joi.string().empty(''),
    JIRA_EMAIL: Joi.string()
        .empty('')
        .when('JIRA_USE_BASIC_AUTH', {is: true, then: Joi.required()}),
    JIRA_USE_BASIC_AUTH: Joi.boolean()/*.empty(undefined)*/,
    JIRA_API_TOKEN: Joi.string().empty(''),
    JIRA_HOST_URL: Joi.string().uri().empty(''),
    JIRA_MESSAGE: Joi.string().required(),
    JIRA_PROJECT_PREFIX: Joi.string().required(),
})
.xor('JIRA_CONTEXT', 'JIRA_API_TOKEN')
.with('JIRA_API_TOKEN', ['JIRA_HOST_URL'])

module.exports = {
    inputs,

    validateInputs() {
        const { error } = schema.validate(process.env, { allowUnknown: true });
        return [ error, this.inputs ];
    }
}
