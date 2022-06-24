const fs = require('fs')

// Outputs are used to provide some data about the template execution.
// They are used by 3rd-party CI image-reporting feature.

const storeOutputParam = (name, value) => {
    const OUTPUT_DIR = '/cf-outputs';
    const OUTPUT_FILE = `${OUTPUT_DIR}/${name}`

    console.log(`storing output ${name}="${value}" to file: ${OUTPUT_FILE}`)

    try {
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR);
        }
        fs.writeFileSync(OUTPUT_FILE, value);
    } catch (error) {
        console.error(`failed to store output to file: ${OUTPUT_FILE}: ${error.message}`)
    }
}

// Emissary executor requires all of the output files to exist.
// It exports outputs sequentially and if the output parameter at index 0 doesn't exists in fs, executor stops the output export
// and following output parameters will not be exported.
const ensureOutputFilesExists = () => {
    try {
        console.log('ensuring output destinations exist')
        for (const output of Object.values(OUTPUTS)) {
            storeOutputParam(output, '')
        }
        console.log('\n')
    } catch (error) {
        console.error(`failed to ensure outputs destination: ${error.message}`)
    }
}

const OUTPUTS = {
    EXIT_ERROR: 'exit_error'
}

module.exports = {
    storeOutputParam,
    ensureOutputFilesExists,
    OUTPUTS
}