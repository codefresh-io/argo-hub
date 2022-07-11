const { GraphQLClient, gql, ClientError } = require('graphql-request')
const _ = require('lodash')

const { OUTPUTS, storeOutputParam, ensureOutputFilesExists } = require('./outputs')
const createRegistryClient = require('./registry-client')
const configuration = require('./configuration');

const run = async () => {
    const [ validationError, inputs ] = configuration.validateInputs()

    if (validationError) {
        throw validationError
    }

    const image = inputs.imageName;
    const client = await createRegistryClient(image);

    const workflowName = inputs.workflow.name;
    const workflowUrl = inputs.workflow.workflowUrl;
    const logsUrl = inputs.workflow.logsUrl;

    const registry = client.repoTag(image);

    const manifest = await registry.getManifest();
    const config = await registry.getConfig(manifest);

    // store in FS to use as an output param later (in argo workflow)
    storeOutputParam(OUTPUTS.IMAGE_NAME, image)
    storeOutputParam(OUTPUTS.IMAGE_SHA, manifest.config.digest)

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

    console.log('binaryMutation payload:', imageBinaryVars.imageBinary);
    
    const binaryMutation = gql`mutation($imageBinary: ImageBinaryInput!){
        createImageBinary(imageBinary: $imageBinary) {
            id,
            imageName,
            workflowName
        }
    }`;
    const binaryResult = await graphQLClient.request(binaryMutation, imageBinaryVars)
        .catch(_handleQlError('failed to create image binary'));

    console.log(JSON.stringify(binaryResult, null, 2));

    const imageRegistryVars = {
        imageRegistry: {
            binaryId: binaryResult.createImageBinary.id,
            imageName: image,
            repoDigest: manifest.config.repoDigest,
            created: config.created
        }
    };

    console.log('registryMutation payload:', imageRegistryVars.imageRegistry);

    const registryMutation = gql`mutation($imageRegistry: ImageRegistryInput!) {
        createImageRegistry(imageRegistry: $imageRegistry) {
            binaryId
            imageName
            repoDigest
        }
    }`;

    const registryResult = await graphQLClient.request(registryMutation, imageRegistryVars)
        .catch(_handleQlError('failed to create image registry'));

    console.log(JSON.stringify(registryResult, null, 2));

    console.log('image reported successfully');
}

const _handleQlError = (prefix) => (e) => {
    let formattedMessage
    if (e instanceof ClientError) {
        if (e.response.status !== 200) {
            formattedMessage = e.response.error
        } else {
            const qlErrorMessage = _.get(e, 'response.errors.0.message')
            if (qlErrorMessage) {
                formattedMessage = qlErrorMessage
            }
        }
    }
    throw new Error(prefix
        ? `${prefix} (${formattedMessage || e.message})`
        : formattedMessage || e.message);
}

const main = async () => {
    try {
        ensureOutputFilesExists()

        console.log('starting image reporter')
        await run();
    } catch (err) {
        const outputErrMessage = `${err.name}: ${err.message}`
        storeOutputParam(OUTPUTS.EXIT_ERROR, outputErrMessage)

        console.error(err);
        process.exit(1);
    }
};

main();
