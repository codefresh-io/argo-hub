import { Provider } from './providers/interface'
import { BitbucketService, GitlabService, GithubService } from './providers'
import { config } from './configuration'
import chalk from "chalk";

export class Factory {

    static GetProvider(): Provider {
        if (config.github.token) {
            console.log(chalk.green(`Github provider was selected`));
            return new GithubService()
        } else if (config.gitlab.token) {
            console.log(chalk.green(`Gitlab provider was selected`));
            return new GitlabService()
        } else if (config.bitbucket.token) {
            console.log(chalk.green(`Bitbucket provider was selected`));
            return new BitbucketService()
        }
        throw new Error(`No token identified, please make to add the relevant token according to your git provider`)
    }

}