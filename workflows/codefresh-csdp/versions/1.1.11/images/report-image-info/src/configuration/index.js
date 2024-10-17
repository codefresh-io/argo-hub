const Joi = require('joi')

const inputs = {
    codefresh: {
        host: process.env.CF_HOST_URL?.trim() || 'https://g.codefresh.io',
        apiKey: process.env.CF_API_KEY?.trim(),
    },
    imageName: process.env.IMAGE_NAME?.trim(),
    dockerfileContent: process.env.DOCKERFILE_CONTENT?.trim(),
    dockerfilePath: process.env.DOCKERFILE_PATH?.trim(),
    workflow: {
        name: process.env.WORKFLOW_NAME?.trim() || process.env.WORKFLOW_URL?.trim(),
        workflowUrl: process.env.WORKFLOW_URL?.trim(),
        logsUrl: process.env.LOGS_URL?.trim(),
    },
    generic: {
        request: {
            protocol: process.env.REGISTRY_INSECURE?.trim() === 'true' ? 'http' : 'https',
            host: process.env.REGISTRY_DOMAIN?.trim(),
        },
        credentials: {
            username: process.env.REGISTRY_USERNAME?.trim(),
            password: process.env.REGISTRY_PASSWORD?.trim(),
        }
    },
    dockerhub: {
        username: process.env.DOCKERHUB_USERNAME?.trim(),
        password: process.env.DOCKERHUB_PASSWORD?.trim(),
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
        host: process.env.GOOGLE_REGISTRY_HOST?.trim(),
        json: process.env.GOOGLE_JSON_KEY?.trim(),
        keyFilePath: process.env.GCR_KEY_FILE_PATH?.trim(),
    },
    retrieveCredentialsByDomain: process.env.RETRIEVE_CREDENTIALS_BY_DOMAIN?.trim() === 'true'
};

const schema = Joi.object({
    CF_HOST_URL: Joi.string().uri().empty(''),
    CF_API_KEY: Joi.string().required(),
    IMAGE_NAME: Joi.string().required(),
    DOCKERFILE_CONTENT: Joi.string().empty(''),
    DOCKERFILE_PATH: Joi.string().empty(''),
    WORKFLOW_NAME: Joi.string().empty(''),
    WORKFLOW_URL: Joi.string().uri().empty(''),
    LOGS_URL: Joi.string().uri().empty(''),
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
