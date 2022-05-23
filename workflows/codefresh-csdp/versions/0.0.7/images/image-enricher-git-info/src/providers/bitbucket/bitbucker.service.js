const chalk = require('chalk');

class BitbucketService {

    async getPullRequestsWithCommits() {
        console.log(chalk.yellow(`Bitbucket provider hasn't implemented yet`));
        return [];
    }

    async getBranch() {
        console.log(chalk.yellow(`Bitbucket provider hasn't implemented yet`));
        return [];
    }
}
module.exports = new BitbucketService();
