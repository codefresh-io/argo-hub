const _ = require('lodash');
const gitlabApi = require('./gitlab.api');

class GitlabService {

    async getPullRequestsWithCommits(repo, branch) {
        try {
            const prs = await gitlabApi.getPullRequests(repo, branch);
            return Promise.all(prs.map(async (pr) => {
                const info = await gitlabApi.getCommitsInfo(repo, pr);
                const result = {
                    ...info,
                    prDate: pr.closed_at || pr.updated_at,
                    number: pr.iid,
                    url: `${pr.web_url}`,
                    title: pr.title,
                }
    
                return result;
            }));
        } catch (error) {
            throw new Error(`failed to get pull requests: ${error.message}`)
        }
    }

    async getBranch(repo, branch) {
        try {
            const gitlabBranch = await gitlabApi.getBranch(repo, branch)
            return {
                name: gitlabBranch.name,
                commit: gitlabBranch.commit.id,
                commitMsg: gitlabBranch.commit.message,
                commitURL: gitlabBranch.commit.web_url || gitlabBranch.web_url,
                committerUsername: gitlabBranch.commit.committer_name
            }
        } catch (error) {
            if (_.get(error, 'response.statusCode') === 404) {
                // branch could be delete, but PR still can be found
                return
            }
            throw new Error(`failed to get branch: ${error.message}`)
        }
    }
}
module.exports = new GitlabService();
