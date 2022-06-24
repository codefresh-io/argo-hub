const fs = require('fs')

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

const OUTPUTS = {
    IMAGE_NAME: 'image_name',
    IMAGE_SHA: 'image_sha',
    EXIT_ERROR: 'exit_error'
}

module.exports = {
    storeOutputParam,
    OUTPUTS
}