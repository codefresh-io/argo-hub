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
        try {
            const githubBranch = await githubApi.getBranch(repo, branch)
            return {
                name: githubBranch.name,
                commit: githubBranch.commit.sha,
                commitMsg: githubBranch.commit.commit.message,
                commitURL: githubBranch.commit.html_url,
                committerUsername: githubBranch.commit.author.login
            }
        } catch (error) {
            console.error(`failed to get branch: ${error.message}`)
            return null
        }
    }
}


module.exports = new GithubService();
