const _ = require('lodash')
const githubApi = require('./github.api')

class GithubService {

    async getPullRequestsWithCommits(repo, branch) {
        try {
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
        } catch (error) {
            throw new Error(`failed to get pull requests: ${error.message}`)
        }
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
            if (_.get(error, 'status') === 404) {
                // branch could be delete, but PR still can be found
                return
            }
            throw new Error(`failed to get branch: ${error.message}`)
        }
    }
}


module.exports = new GithubService();
