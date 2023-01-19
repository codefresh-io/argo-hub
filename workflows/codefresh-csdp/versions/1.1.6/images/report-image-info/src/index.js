// registering error handler
require('./outputs')
const { GraphQLClient, gql, ClientError } = require('graphql-request')
const _ = require('lodash')
const fs = require('fs').promises

const { OUTPUTS, storeOutputParam } = require('./outputs')
const configuration = require('./configuration');
const { parseImageName, getRegistryClient } = require("./registry-client");

const COMMON_INSTRUCTIONS = {
    run: 'RUN',
    shell: 'SHELL'
};

async function main() {
    console.log('starting image reporter')

    const [ validationError, inputs ] = configuration.validateInputs()

    if (validationError) {
        throw validationError
    }

    const image = inputs.imageName;
    const client = await getRegistryClient(image);

    console.log(`using ${client.constructor.name} client`)

    const workflowName = inputs.workflow.name;
    const workflowUrl = inputs.workflow.workflowUrl;
    const logsUrl = inputs.workflow.logsUrl;

    const registry = client.repoTag(image);

    const manifest = await registry.getManifest();

    console.log(`image manifest has been fetched:`, '\n', manifest)

    const config = await registry.getConfig(manifest);

    console.log(`image config has been fetched:`, '\n', config)

    // store in FS to use as an output param later (in argo workflow)
    storeOutputParam(OUTPUTS.IMAGE_NAME, image)
    storeOutputParam(OUTPUTS.IMAGE_SHA, manifest.config.digest)

    const repositoryName = _.get(parseImageName(image), 'repository')
    const imageLink = `${inputs.codefresh.host}/2.0/images/${encodeURIComponent(repositoryName)}/${manifest.config.digest}/${encodeURIComponent(image)}`

    storeOutputParam(OUTPUTS.IMAGE_LINK, imageLink)

    const size = manifest.config.size + _.reduce(manifest.layers, (sum, layer) => {
        return sum + layer.size;
    }, 0);

    const graphQLClient = new GraphQLClient(`${inputs.codefresh.host}/2.0/api/graphql`, {
        headers: {
            'Authorization': inputs.codefresh.apiKey,
        },
    });

    const binaryResult = await _reportImageBinary({
        manifest,
        config,
        image,
        size,
        workflowName,
        workflowUrl,
        logsUrl,
        graphQLClient
    })
    await _reportImageLayers({ manifest, config, graphQLClient })
    await _reportImageRegistry({ imageBinary: binaryResult.createImageBinary, image, manifest, config, graphQLClient })

    console.log('image reported successfully');
}

async function _reportImageBinary({ manifest, config, image, size, workflowName, workflowUrl, logsUrl, graphQLClient }) {
    const imageBinaryVars = {
        imageBinary: {
            id: manifest.config.digest,
            created: config.created,
            imageName: image,
            dockerFile: await _buildDockerfile(),
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

    return binaryResult;
}

async function _reportImageLayers({ manifest, config, graphQLClient }) {
    const imageLayersVars = {
        imageLayers: {
            image: manifest.config.digest,
            layers: _getLayersFromHistory(config.history, manifest.layers),
        }
    };

    console.log('ImageLayers Mutation payload:', JSON.stringify(imageLayersVars.imageLayers, null, 2));

    const imageLayersMutation = gql`mutation($imageLayers: ImageLayersInput!) {
        createImageLayers(imageLayers: $imageLayers) {
            accountId
            created
            image
            layerDigests
            layers {
                created
                instruction
                size
                args
            }
        }
    }`;
    const imageLayersResult = await graphQLClient.request(imageLayersMutation, imageLayersVars)
      .catch(_handleQlError('failed to create image layers'));

    console.log(JSON.stringify(imageLayersResult, null, 2));

    return imageLayersResult;
}

async function _reportImageRegistry({ imageBinary, image, manifest, config, graphQLClient }) {
    const imageRegistryVars = {
        imageRegistry: {
            binaryId: imageBinary.id,
            imageName: image,
            repoDigest: manifest.config.repoDigest,
            created: config.created
        }
    };

    console.log('registryMutation payload:', imageRegistryVars.imageRegistry);

    const registryMutation = gql`mutation($imageRegistry: ImageRegistryInput!) {
        createImageRegistry(imageRegistry: $imageRegistry) {
            binaryId
            repoDigest
        }
    }`;

    const registryResult = await graphQLClient.request(registryMutation, imageRegistryVars)
      .catch(_handleQlError('failed to create image registry'));

    console.log(JSON.stringify(registryResult, null, 2));

    return registryResult;
}

/**
 * @param history {[*]}
 * @returns {[{size, created: (string|Boolean), instruction: string, args: string}]}
 */
function _getLayersFromHistory(history, layers) {

    let shell             = '/bin/sh -c';
    let instructionPrefix = '#(nop)';

    const layersSizes = _.map(layers, l => l.size);

    history = history.reverse().map((row) => {
        row = row || {};

        const CreatedBy = _.get(row, 'created_by', '');
        let instruction, args;

        if (CreatedBy.indexOf(instructionPrefix) === -1) {
            instruction = COMMON_INSTRUCTIONS.run;
            args        = CreatedBy.replace(shell, '').trim();
        } else {
            let cmd               = CreatedBy.substr(CreatedBy.indexOf(instructionPrefix) +
              instructionPrefix.length).trim();
            let nextSpacePosition = cmd.indexOf(' ');

            instruction = cmd.substr(0, nextSpacePosition).trim();
            args        = cmd.substr(nextSpacePosition).trim();

            if (instruction === COMMON_INSTRUCTIONS.shell) {
                shell = (args[0] === '[' && args[args.length - 1] === ']') ? (args
                  .slice(1, -1)
                  .replace(/[\"\']/g, '')
                  .split(',')
                  .map(part => {return part.trim();})
                  .join(' ')) : args;
            }
        }

        return {
            created: row.created,
            size: row.empty_layer ? 0 : layersSizes.pop(),
            instruction,
            args
        };
    }).reverse();

    return history;
}

async function _buildDockerfile() {
    try {
        const { dockerfileContent, dockerfilePath } = configuration.inputs
        if (dockerfileContent) {
            return Buffer.from(dockerfileContent, 'base64').toString()
        }
        const file = await fs.readFile(dockerfilePath ? dockerfilePath : '/tmp/Dockerfile') // use path or artifact
        return file.toString()
    } catch (error) {
        console.error(`Can't get Dockerfile. ${error.message}`)
        return ''
    }
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

main();
