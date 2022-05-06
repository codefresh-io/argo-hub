const chalk = require('chalk');

class GitlabService {

    async getPullRequestsWithCommits() {
        console.log(chalk.yellow(`Gitlab currently not support for non pr merge event triggers. `));
        return [];
    }
}
module.exports = new GitlabService();
