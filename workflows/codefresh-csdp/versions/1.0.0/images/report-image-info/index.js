const { GraphQLClient, gql } = require('graphql-request')
const fs = require('fs')
const _ = require('lodash')
const AWS = require('aws-sdk');
const { parseQualifiedNameOptimized, parseFamiliarName } = require('@codefresh-io/docker-reference')

const { registries: { GcrRegistry, EcrRegistry, DockerhubRegistry, StandardRegistry } } = require('nodegistry');

const configuration = require('./configuration');
const inputs = configuration.inputs

const CF_NOT_EXIST = 'cf-not-exist';

function checkNotEmpty(testVar) {
    return (testVar && testVar!==CF_NOT_EXIST);
}

function _parseImageName(imageName) {
    return parseFamiliarName(imageName, parseQualifiedNameOptimized)
}

const _decodeBase64 = (str) => Buffer.from(str, 'base64').toString();

function getCredentialsFromDockerConfig(image) {
    const dockerConfig = JSON.parse(fs.readFileSync(inputs.dockerConfigPath));
    const imageData = _parseImageName(image);
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
    const imageData = _parseImageName(image);
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

const init = async () => {
    const [ validationError ] = configuration.validateInputs()

    if (validationError) {
        console.error(validationError.message);
        process.exit(1);
    }


    const image = inputs.imageName;
    const client = await getRegistryClient(image);

    const workflowName = inputs.workflow.name;
    const workflowUrl = inputs.workflow.workflowUrl;
    const logsUrl = inputs.workflow.logsUrl;

    const registry = client.repoTag(image);

    const manifest = await registry.getManifest();
    const config = await registry.getConfig(manifest);

    // store in FS to use as an output param later (in argo workflow)
    storeOutputParams({
        imageName: image,
        imageDigest: manifest.config.digest
    });

    const size = manifest.config.size + _.reduce(manifest.layers, (sum, layer) => {
        return sum + layer.size;
    }, 0);

    const graphQLClient = new GraphQLClient(`${inputs.codefresh.host}/2.0/api/graphql`, {
        headers: {
            'Authorization': inputs.codefresh.apiKey,
        },
    });

    const imageBinaryVars = {
        imageBinary: {
            id: manifest.config.digest,
            created: config.created,
            imageName: image,
            size: size,
            os: config.os,
            architecture: config.architecture,
            workflowName: workflowName,
            workflowUrl,
            logsUrl,
        }
    };

    console.log('REPORT_IMAGE_V2: binaryMutation payload:', imageBinaryVars.imageBinary);
    
    const binaryMutation = gql`mutation($imageBinary: ImageBinaryInput!){
        createImageBinary(imageBinary: $imageBinary) {
            id,
            imageName,
            workflowName
        }
    }`;
    const binaryResult = await graphQLClient.request(binaryMutation, imageBinaryVars);

    console.log('REPORT_IMAGE_V2: binaryMutation response:', JSON.stringify(binaryResult, null, 2));

    const imageRegistry = {
        binaryId: binaryResult.createImageBinary.id,
        imageName: image,
        repoDigest: manifest.config.repoDigest,
        created: config.created
    };

    const registryMutation = gql`mutation($imageRegistry: ImageRegistryInput!) {
        createImageRegistry(imageRegistry: $imageRegistry) {
            binaryId
            repoDigest
        }
    }`;

    const registryResult = await graphQLClient.request(registryMutation, { imageRegistry });
    console.log(JSON.stringify(registryResult, null, 2));
}

const storeOutputParams = ({ imageName, imageDigest }) => {
    const OUTPUT_DIR = '/tmp';

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR);
    }
    fs.writeFileSync(`${OUTPUT_DIR}/reported_image_name`, imageName);
    fs.writeFileSync(`${OUTPUT_DIR}/reported_image_sha`, imageDigest);
}

const main = async () => {
    try {
        await init();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

main();
