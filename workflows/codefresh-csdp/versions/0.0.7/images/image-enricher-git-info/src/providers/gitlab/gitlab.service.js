const chalk = require('chalk');

class GitlabService {

    async getPullRequestsWithCommits() {
        console.log(chalk.yellow(`Gitlab provider hasn't implemented yet`));
        return [];
    }

    async getBranch() {
        console.log(chalk.yellow(`Gitlab provider hasn't implemented yet`));
        return [];
    }
}
module.exports = new GitlabService();
