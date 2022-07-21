import { promises as fs } from 'fs'
import chalk from 'chalk'

import { config } from '../configuration'

export async function writeResult(res: string) {
    if (config.outputFilePath) {
        await fs.writeFile(config.outputFilePath, res);
        console.log(chalk.green(`Pull request url stored successfully`));
    } else {
        console.log(chalk.yellow(`Output file path was not provided, skipping on store pull request url phase`));
    }

}