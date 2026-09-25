const { reportImageInfo } = require('@codefresh-io/cf-report-image-toolbox')

// registering error handler
require('./outputs');

const { storeOutputParam } = require('./outputs')
const configuration = require('./configuration');

async function main() {
    console.log('starting image reporter')

    const [ validationError, inputs ] = configuration.validateInputs()

    if (validationError) {
        throw validationError
    }

    await reportImageInfo(inputs, storeOutputParam)

    console.log('image reported successfully');
}

main();
