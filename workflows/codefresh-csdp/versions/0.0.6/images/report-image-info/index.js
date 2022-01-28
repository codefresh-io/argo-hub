const { GraphQLClient, gql } = require('graphql-request')
const fs = require('fs')
const _ = require('lodash')
const AWS = require('aws-sdk');

const { registries: { GcrRegistry, EcrRegistry, DockerhubRegistry, StandardRegistry } } = require('nodegistry');

const CF_NOT_EXIST = 'cf-not-exist';

// Trim all input
// Clean this up to use the same variable with a 'registry type'
const inputs = {
    docker: {
        username: process.env.DOCKER_USERNAME?.trim(),
        password: process.env.DOCKER_PASSWORD?.trim(),
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
    git: {
        branch: process.env.GIT_BRANCH?.trim(),
        commit: process.env.GIT_REVISION?.trim(),
        commitMsg: process.env.GIT_COMMIT_MESSAGE?.trim(),
        commitURL: process.env.GIT_COMMIT_URL?.trim(),
        author: process.env.GIT_SENDER_LOGIN?.trim(),
    },
    workflow: {
        name: process.env.WORKFLOW_NAME?.trim(),
    },
    image: {
        uri: process.env.IMAGE_URI?.trim(),
    },
    codefresh: {
        host: process.env.CF_HOST?.trim(),
        apiKey: process.env.CF_API_KEY?.trim(),
    }

};


function checkNotEmpty(testVar) {
    return (testVar && testVar!==CF_NOT_EXIST);
}

async function createRegistryClient() {

    // Clean this up when have time
    if (checkNotEmpty(inputs.docker.username)
        && checkNotEmpty(inputs.docker.password)) {

        return new DockerhubRegistry(inputs.docker);
    }

    if (checkNotEmpty(inputs.generic.credentials.username)
        && checkNotEmpty(inputs.generic.credentials.password)
        && checkNotEmpty(inputs.generic.request.domain)) {

            return new StandardRegistry(inputs.generic);
    }

    if (checkNotEmpty(inputs.aws.role)
        && checkNotEmpty(inputs.aws.credentials.region)) {
        console.log(`Retrieving credentials for ECR ${inputs.aws.region} using STS token`);
        const sts = new AWS.STS();
        const timestamp = (new Date()).getTime();
        const params = {
            RoleArn: inputs.aws.role,
            RoleSessionName: `be-descriptibe-here-${timestamp}`
        }
        const data = await sts.assumeRole(params).promise();
        return new EcrRegistry({
            promise: Promise,
            credentials: {
                accessKeyId: data.Credentials.AccessKeyId,
                secretAccessKey: data.Credentials.SecretAccessKey,
                sessionToken: data.Credentials.SessionToken,
                region: inputs.aws.credentials.region,
            },
        })
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
    throw new Error('Registry credentials is required parameter. Add one from following registry parameters in your workflow to continue:\n - Docker credentials: DOCKER_USERNAME, DOCKER_PASSWORD\n - GCR credentials: GCR_KEY_FILE_PATH\n - AWS registry credentials: AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION\n - Standard registry credentials: USERNAME, PASSWORD, DOMAIN');
}

const init = async () => {

    const client = await createRegistryClient();

    const image = inputs.image.uri;
    const authorUserName = inputs.git.author;
    const workflowName = inputs.workflow.name;

    const registry = client.repoTag(image);

    const manifest = await registry.getManifest();
    const config = await registry.getConfig(manifest);

    const size = manifest.config.size + _.reduce(manifest.layers, (sum, layer) => {
        return sum + layer.size;
    }, 0)

    const graphQLClient = new GraphQLClient(`${inputs.codefresh.host}/2.0/api/graphql`, {
        headers: {
            'Authorization': inputs.codefresh.apiKey,
        },
    })

    const imageBinary = {
        id: manifest.config.digest,
        created: config.created,
        imageName: image,
        branch: inputs.git.branch,
        commit: inputs.git.commit,
        commitMsg: inputs.git.commitMsg,
        commitURL: inputs.git.commitURL,
        size: size,
        os: config.os,
        architecture: config.architecture,
        workflowName: workflowName,
        author: {
            username: authorUserName
        }
    }

    console.log('REPORT_IMAGE_V2: binaryQuery payload:', imageBinary)

    const binaryQuery = gql`mutation($imageBinary: ImageBinaryInput!){
        createImageBinary(imageBinary: $imageBinary) {
            id,
            imageName,
            branch,
            commit,
            commitMsg,
            commitURL,
            workflowName
        }
    }`
    const binaryResult = await graphQLClient.request(binaryQuery, { imageBinary })
    console.log('REPORT_IMAGE_V2: binaryQuery response:', JSON.stringify(binaryResult, null, 2))

    const imageRegistry = {
        binaryId: binaryResult.createImageBinary.id,
        imageName: image,
        repoDigest: manifest.config.repoDigest,
        created: config.created
    }

    const registryQuery = gql`mutation($imageRegistry: ImageRegistryInput!) {
        createImageRegistry(imageRegistry: $imageRegistry) {
            binaryId
            imageName
            repoDigest
        }
    }`

    const registryResult = await graphQLClient.request(registryQuery, { imageRegistry })
    console.log(JSON.stringify(registryResult, null, 2))
}

const validateRequiredEnvs = () => {
    if (_.isEmpty(inputs.image.uri)) {
        throw new Error('IMAGE_URI is required parameter. Add this parameter in your workflow to continue.');
    }
    if (_.isEmpty(inputs.codefresh.apiKey)) {
        throw new Error('CF_API_KEY is required parameter. Add this parameter in your workflow to continue.');
    }
}

const main = async () => {
    try {
        validateRequiredEnvs();
        await init();
    } catch (err) {
        console.error(err.stack);
        process.exit(1);
    }
};

main();
