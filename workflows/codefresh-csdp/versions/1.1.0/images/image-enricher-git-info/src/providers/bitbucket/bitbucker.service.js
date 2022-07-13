const _ = require('lodash');
const bitBucketApi = require('./bitbucker.api');

class BitbucketService {

    async getPullRequestsWithCommits(repo, branch) {
        try {
            const prs = await bitBucketApi.getPullRequests(repo, branch);
            return Promise.all(prs.map(async (pr) => {
                const info = await bitBucketApi.getCommitsInfo(repo, pr);
                const result = {
                    ...info,
                    prDate: pr.updated_on || pr.created_on,
                    number: pr.id,
                    url: `${pr.links.html.href}`,
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
            const bitBucketBranch = await bitBucketApi.getBranch(repo, branch)
            return {
                name: bitBucketBranch.name,
                commit: bitBucketBranch.target.hash,
                commitMsg: bitBucketBranch.target.message,
                commitURL: bitBucketBranch.target.links.html.href,
                committerUsername: bitBucketBranch.target.author.user.nickname
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
module.exports = new BitbucketService();
