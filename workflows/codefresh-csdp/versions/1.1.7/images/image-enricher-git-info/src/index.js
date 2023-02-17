const { imageEnricherGitInfo } = require('@codefresh-io/cf-docker-images')

// registering error handler
require('./outputs');

const configuration = require('./configuration');

async function main() {
    console.log('starting git enricher')

    const [ validationError, inputs ] = configuration.validateInputs()
    if (validationError) {
        throw validationError
    }

    await imageEnricherGitInfo(inputs)
}

main();
