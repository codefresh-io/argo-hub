const { GraphQLClient, gql } = require('graphql-request')
const fs = require('fs')
const _ = require('lodash')


const { registries: { GcrRegistry, EcrRegistry, DockerhubRegistry, StandardRegistry } } = require('nodegistry');

const CF_NOT_EXIST = 'cf-not-exist';

function createRegistryClient() {

    if (process.env.DOCKER_USERNAME && process.env.DOCKER_PASSWORD
        && process.env.DOCKER_USERNAME!==CF_NOT_EXIST && process.env.DOCKER_PASSWORD!==CF_NOT_EXIST) {
        return new DockerhubRegistry({
            username: process.env.DOCKER_USERNAME,
            password: process.env.DOCKER_PASSWORD
        });
    }

    if (process.env.USERNAME && process.env.PASSWORD && process.env.DOMAIN
        && process.env.USERNAME!==CF_NOT_EXIST && process.env.PASSWORD!==CF_NOT_EXIST && process.env.DOMAIN!==CF_NOT_EXIST) {
        return new StandardRegistry({
            request: {
                protocol: process.env.INSECURE === 'true' ? 'http' : 'https',
                host: process.env.DOMAIN
            },
            credentials: {
                username: process.env.USERNAME,
                password: process.env.PASSWORD,
            },
        });
    }

    if (process.env.GCR_KEY_FILE_PATH && process.env.GCR_KEY_FILE_PATH!==CF_NOT_EXIST) {
        return new GcrRegistry({
            keyfile: fs.readFileSync(process.env.GCR_KEY_FILE_PATH),
            request: { host: 'gcr.io' }
        });
    }
    if (process.env.AWS_ACCESS_KEY && process.env.AWS_ACCESS_KEY!==CF_NOT_EXIST
        && process.env.AWS_SECRET_KEY && process.env.AWS_SECRET_KEY!==CF_NOT_EXIST
        && process.env.AWS_REGION && process.env.AWS_REGION!==CF_NOT_EXIST) {
        return new EcrRegistry({
            promise: Promise,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY,
                region: process.env.AWS_REGION,
            },
        })
    }
    throw new Error('Registry credentials is required parameter. Add one from following registry parameters in your workflow to continue:\n - Docker credentials: DOCKER_USERNAME, DOCKER_PASSWORD\n - GCR credentials: GCR_KEY_FILE_PATH\n - AWS registry credentials: AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION\n - Standard registry credentials: USERNAME, PASSWORD, DOMAIN');
}

const init = async () => {

    const client = createRegistryClient();

    const image = process.env.IMAGE_URI;
    const sender = process.env.GIT_SENDER_LOGIN;
    const wf = process.env.WORKFLOW_NAME;

    const registry = client.repoTag(image);

    const manifest = await registry.getManifest();
    const config = await registry.getConfig(manifest);

    const size = manifest.config.size + _.reduce(manifest.layers, (sum, layer) => {
        return sum + layer.size;
    }, 0)

    const graphQLClient = new GraphQLClient(`${process.env.CF_HOST}/2.0/api/graphql`, {
        headers: {
            'Authorization': process.env.CF_API_KEY,
        },
    })

    console.log('REPORT_IMAGE_V2: binaryQuery payload:', {
        id: `${manifest.config.digest}`,
        created: `${config.created}`,
        imageName: `${image}`,
        branch: `${process.env.GIT_BRANCH}`,
        commit: `${process.env.GIT_REVISION}`,
        commitMsg: `${process.env.GIT_COMMIT_MESSAGE}`,
        commitURL: `${process.env.GIT_COMMIT_URL}`,
        size: `${size}`,
        os: `${config.os}`,
        architecture: `${config.architecture}`,
        sender,
        wf
    })

    const binaryQuery = gql`mutation {
        createImageBinary(imageBinary: {
            id: "${manifest.config.digest}",
            created: "${config.created}",
            imageName: "${image}",
            branch: "${process.env.GIT_BRANCH}",
            commit: "${process.env.GIT_REVISION}",
            commitMsg: "${process.env.GIT_COMMIT_MESSAGE}",
            commitURL: "${process.env.GIT_COMMIT_URL}",
            size: ${size},
            os: "${config.os}",
            architecture: "${config.architecture}",
        }) {
            id,
            imageName,
            branch,
            commit,
            commitMsg,
            commitURL,
        }
    }`
    const binaryResult = await graphQLClient.request(binaryQuery)
    console.log('REPORT_IMAGE_V2: binaryQuery response:', JSON.stringify(binaryResult, null, 2))

    const query = gql`mutation {
        createImageRegistry(imageRegistry: {
            binaryId: "${binaryResult.createImageBinary.id}",
            imageName: "${image}",
            repoDigest: "${manifest.config.repoDigest}",
            created: "${config.created}",
        }) {
            binaryId
            imageName
            repoDigest
        }
    }`

    const data = await graphQLClient.request(query)
    console.log(JSON.stringify(data, null, 2))
}

const validateRequiredEnvs = () => {
    if (_.isEmpty(process.env.IMAGE_URI)) {
        throw new Error('IMAGE_URI is required parameter. Add this parameter in your workflow to continue.');
    }
    if (_.isEmpty(process.env.CF_API_KEY)) {
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
