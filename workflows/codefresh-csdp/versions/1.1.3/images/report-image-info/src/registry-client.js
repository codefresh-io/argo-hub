const fs = require('fs')
const _ = require('lodash')
const AWS = require('aws-sdk');
const { parseQualifiedNameOptimized, parseFamiliarName } = require('@codefresh-io/docker-reference')
const { registries: { GcrRegistry, EcrRegistry, DockerhubRegistry, StandardRegistry } } = require('nodegistry');

const { inputs } = require('./configuration');

const CF_NOT_EXIST = 'cf-not-exist';

function checkNotEmpty(testVar) {
    return (testVar && testVar!==CF_NOT_EXIST);
}

function parseImageName(imageName) {
    return parseFamiliarName(imageName, parseQualifiedNameOptimized)
}

const _decodeBase64 = (str) => Buffer.from(str, 'base64').toString();

function getCredentialsFromDockerConfig(image) {
    const dockerConfig = JSON.parse(fs.readFileSync(inputs.dockerConfigPath));
    const imageData = parseImageName(image);
    const auths = _.get(dockerConfig, 'auths', {});
    const domainKey = _.findKey(auths, (auth, domain) => {
        if (domain.includes(imageData.domain)) {
            return true
        }
    });
    const authInfo = auths[domainKey];
    const auth = _decodeBase64(authInfo.auth);
    const [ username, password ] = auth.split(':');
    if (domainKey.includes('docker.io')) {
        return new DockerhubRegistry({
            username,
            password,
        });
    } else if (domainKey.includes('azurecr.io')) {
        throw new Error('Azure Container Registry using docker config json is not supported.')
    } else if (domainKey.includes('gcr.io')) {
        throw new Error('Google container registry using docker config json is not supported.')
    }
    return new StandardRegistry({
        request: {
            host: domainKey
        },
        credentials: {
            username,
            password,
        },
        ignoreRedirects: true
    });
}

async function createECRUsingSTS(role, region) {
    console.log(`Retrieving credentials for ECR ${region} using STS token`);
    const sts = new AWS.STS();
    const timestamp = (new Date()).getTime();
    const params = {
        RoleArn: role,
        RoleSessionName: `be-descriptibe-here-${timestamp}`
    }
    const data = await sts.assumeRole(params).promise();
    return new EcrRegistry({
        promise: Promise,
        credentials: {
            accessKeyId: data.Credentials.AccessKeyId,
            secretAccessKey: data.Credentials.SecretAccessKey,
            sessionToken: data.Credentials.SessionToken,
            region: region,
        },
    })
}

async function createRegistryClientByImage(image) {
    const imageData = parseImageName(image);
    if (imageData.domain.includes('docker.io')) {
        if (checkNotEmpty(inputs.dockerhub.username)
            && checkNotEmpty(inputs.dockerhub.password)) {

            return new DockerhubRegistry(inputs.dockerhub);
        }
        throw new Error('Registry credentials for DOCKER not set. Add following registry parameters in your workflow to continue:\n - DOCKERHUB_USERNAME\n - DOCKERHUB_PASSWORD\n');
    } else if (imageData.domain.includes('gcr.io')) {
        if (inputs.gcr.keyFilePath) {
            return new GcrRegistry({
                keyfile: fs.readFileSync(inputs.gcr.keyFilePath),
                request: { host: 'gcr.io' }
            });
        }
        throw new Error('Registry credentials for GCR not set. Add following registry parameters in your workflow to continue:\n - GCR_KEY_FILE_PATH\n');
    } else if (imageData.domain.includes('azurecr.io')) {
        throw new Error('Azure Container Registry using docker config json is not supported.')
    } else if (imageData.domain.includes('ecr')) {
        if (checkNotEmpty(inputs.aws.role)
            && checkNotEmpty(inputs.aws.credentials.region)) {
            return createECRUsingSTS(inputs.aws.role, inputs.aws.credentials.region);
        } else if (checkNotEmpty(inputs.aws.credentials.accessKeyId)
            && checkNotEmpty(inputs.aws.credentials.secretAccessKey)
            && checkNotEmpty(inputs.aws.credentials.region)) {
            return new EcrRegistry({
                promise: Promise,
                credentials: inputs.aws.credentials,
            })
        }
        throw new Error('Registry credentials for ECR not set. Add following registry parameters in your workflow to continue:\n - AWS_ACCESS_KEY\n - AWS_SECRET_KEY\n - AWS_REGION\n');
    }
    if (checkNotEmpty(inputs.generic.credentials.username)
        && checkNotEmpty(inputs.generic.credentials.password)
        && checkNotEmpty(inputs.generic.request.host)) {

        inputs.generic.ignoreRedirects = true;
        return new StandardRegistry(inputs.generic);
    }
    if (inputs.dockerConfigPath) {
        return getCredentialsFromDockerConfig(image);
    }
    throw new Error('Registry credentials is required parameter. Add one from following registry parameters in your workflow to continue:\n - Docker credentials: DOCKERHUB_USERNAME, DOCKERHUB_PASSWORD\n - GCR credentials: GCR_KEY_FILE_PATH\n - AWS registry credentials: AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION\n - Standard registry credentials: REGISTRY_USERNAME, REGISTRY_PASSWORD, REGISTRY_DOMAIN\n')
}

async function createRegistryClient(image) {
    if (inputs.dockerConfigPath) {
        return getCredentialsFromDockerConfig(image)
    }

    // Clean this up when have time
    if (checkNotEmpty(inputs.dockerhub.username)
        && checkNotEmpty(inputs.dockerhub.password)) {

        return new DockerhubRegistry(inputs.dockerhub);
    }

    if (checkNotEmpty(inputs.generic.credentials.username)
        && checkNotEmpty(inputs.generic.credentials.password)
        && checkNotEmpty(inputs.generic.request.host)) {

        inputs.generic.ignoreRedirects = true;
        return new StandardRegistry(inputs.generic);
    }

    if (checkNotEmpty(inputs.aws.role)
        && checkNotEmpty(inputs.aws.credentials.region)) {
        return createECRUsingSTS(inputs.aws.role, inputs.aws.credentials.region);
    }

    if (inputs.gcr.keyFilePath) {
        return new GcrRegistry({
            keyfile: fs.readFileSync(inputs.gcr.keyFilePath),
            request: { host: 'gcr.io' }
        });
    }
    if (checkNotEmpty(inputs.aws.credentials.accessKeyId)
        && checkNotEmpty(inputs.aws.credentials.secretAccessKey)
        && checkNotEmpty(inputs.aws.credentials.region)) {
        return new EcrRegistry({
            promise: Promise,
            credentials: inputs.aws.credentials,
        })
    }
    throw new Error('Registry credentials is required parameter. Add one from following registry parameters in your workflow to continue:\n - Docker credentials: DOCKERHUB_USERNAME, DOCKERHUB_PASSWORD\n - GCR credentials: GCR_KEY_FILE_PATH\n - AWS registry credentials: AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION\n - Standard registry credentials: REGISTRY_USERNAME, REGISTRY_PASSWORD, REGISTRY_DOMAIN');
}

async function getRegistryClient(image) {
    if (inputs.retrieveCredentialsByDomain) {
        return createRegistryClientByImage(image);
    }
    return createRegistryClient(image);
}
module.exports = {
    parseImageName,
    getRegistryClient
}


