const Joi = require('joi')
const _ = require('lodash')

const inputs = {
    cfRuntime: process.env.CF_RUNTIME,
    codefresh: {
        host: process.env.CF_HOST_URL?.trim() || 'https://g.codefresh.io',
        apiKey: process.env.CF_API_KEY?.trim(),
    },
    image: {
        uri: process.env.IMAGE_URI?.trim(),
    },
    workflow: {
        name: process.env.WORKFLOW_NAME?.trim(),
        workflowUrl: process.env.WORKFLOW_URL?.trim(),
        logsUrl: process.env.LOGS_URL?.trim(),
    },
    generic: {
        request: {
            protocol: process.env.INSECURE?.trim() === 'true' ? 'http' : 'https',
            host: process.env.DOMAIN?.trim(),
        },
        credentials: {
            username: process.env.USERNAME?.trim(),
            password: process.env.PASSWORD?.trim(),
        }
    },
    docker: {
        username: process.env.DOCKER_USERNAME?.trim(),
        password: process.env.DOCKER_PASSWORD?.trim(),
    },
    dockerConfigPath: process.env.DOCKER_CONFIG_FILE_PATH?.trim(),
    aws: {
        role: process.env.AWS_ROLE?.trim(),
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY?.trim(),
            secretAccessKey: process.env.AWS_SECRET_KEY?.trim(),
            region: process.env.AWS_REGION?.trim(),
        }
    },
    gcr: {
        keyFilePath: process.env.GCR_KEY_FILE_PATH?.trim(),
    },
    retrieveCredentialsByDomain: process.env.RETRIEVE_CREDENTIALS_BY_DOMAIN?.trim() === 'true'
};

const schema = Joi.object({
    // required if API key subject is not argo-runtime
    CF_RUNTIME: Joi.string(),

    CF_HOST_URL: Joi.string().uri(),
    CF_API_KEY: Joi.string().required(),
    IMAGE_URI: Joi.string().required(),
    WORKFLOW_NAME: Joi.string(),
    WORKFLOW_URL: Joi.string().uri(),
    LOGS_URL: Joi.string().uri(),
    RETRIEVE_CREDENTIALS_BY_DOMAIN: Joi.boolean(),

    /** the registry specific vars validated during "createRegistryClient" */
})

module.exports = {
    inputs,

    validateInputs() {
        const { error } = schema.validate(process.env, { allowUnknown: true });
        return [ error, this.inputs ];
    }
}