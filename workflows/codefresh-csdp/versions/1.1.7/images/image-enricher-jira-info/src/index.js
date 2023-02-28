const { imageEnricherJiraInfo } = require('@codefresh-io/cf-report-image-toolbox')

// registering error handler
require('./outputs');

const configuration = require('./configuration');

async function main() {
    console.log('starting jira enricher')

    const [ validationError, inputs ] = configuration.validateInputs()

    if (validationError) {
        throw validationError
    }

    await imageEnricherJiraInfo(inputs)
}

main();
