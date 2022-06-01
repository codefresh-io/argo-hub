import { validateConfig} from './configuration'
import { writeResult } from './util'
import { Factory as factory } from './factory'
import chalk from 'chalk'

async function execute() {
    validateConfig()
    const provider = factory.GetProvider()
    return provider.createPullRequest()
}

execute()
    .then(async (url) => {
        console.log(chalk.green(`Pr created successfully`));
        await writeResult(url)
    })
    .catch(async (e) => {
        console.log(chalk.red(e.message));
        await writeResult('error')
        process.exit(1);
    })
