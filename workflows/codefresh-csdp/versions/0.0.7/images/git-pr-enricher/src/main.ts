import { validateConfig} from './configuration'
import { Factory as factory } from './factory'
import chalk from 'chalk'

async function execute() {
    validateConfig()
    const provider = factory.GetProvider()
    await provider.createPullRequest()
}

execute()
    .then(() => {
        console.log(chalk.green(`Pr created successfully`));
    })
    .catch((e) => {
        console.log(chalk.red(e.message));
        process.exit(1);
    })
