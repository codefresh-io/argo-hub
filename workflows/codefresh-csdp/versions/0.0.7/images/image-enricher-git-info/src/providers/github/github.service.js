const githubApi = require('./github.api')

class GithubService {

    async getPullRequestsWithCommits(repo, branch) {
        const searchResult = await githubApi.searchForPullRequests(repo, branch)

        return Promise.all(searchResult.items.map(async (foundItem) => {
            const commitsInfo = await githubApi.extractCommitsInfo(repo, foundItem.number);
            const result = {
                ...commitsInfo,
                prDate: foundItem.closed_at || foundItem.updated_at,
                number: foundItem.number,
                url: foundItem.pull_request.html_url,
                title: foundItem.title,
            }

            return result;
        }));
    }

    async getBranch(repo, branch) {
        return githubApi.getBranch(repo, branch)
    }
}


module.exports = new GithubService();
