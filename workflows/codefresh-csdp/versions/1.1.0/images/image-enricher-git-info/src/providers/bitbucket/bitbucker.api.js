const _ = require('lodash');
const { Bitbucket } = require("bitbucket");
const { inputs } = require("../../configuration");

class BitbucketApi {
    constructor() {
        const clientOptions = {
            baseUrl: inputs.bitbucketHost,
            auth: {
                username: inputs.bitbucketUsername,
                password: inputs.bitbucketPassword,
            },
        }
        this.api = new Bitbucket(clientOptions);
    }

    async searchForPullRequests() {
        return [];
    }

    async getBranch(repo, branch) {
        const [ workspace, repoSlug ] = repo.split('/');
        const result = await this.api.repositories.getBranch({ repo_slug: repoSlug, workspace, name: branch });
        return result.data;
    }

    async getPullRequests(repo, branch) {
        const [ workspace, repoSlug ] = repo.split('/');
        const result = await this.api.pullrequests.list({ pagelen: 50, repo_slug: repoSlug, workspace, fields: '+values.participants', q: `source.branch.name~"${branch}"` });
        return _.get(result, 'data.values', []);
    }

    async getCommitsInfo(repo, pr) {
        const [workspace, repoSlug] = repo.split('/');
        let result = await this.api.pullrequests.listCommits({ repo_slug: repoSlug, workspace, pull_request_id: pr.id });
        const commits = _.get(result, 'data.values', []);
        while (this.api.hasNextPage(result.data)) {
            result = await this.api.getNextPage(result.data);
            commits.push(..._.get(result, 'data.values', []));
        }

        if (commits && commits.length > 0) {
            const firstCommitDate = commits[0].date;
            const lastCommitDate = _.last(commits).date;
            const commitsByUser = {};
            const committersMap = {};
            for (const commit of commits) {
                const avatar = commit.author.user.links.avatar.href;
                const userName = commit.author.user.nickname;
                committersMap[userName] = {
                    userName,
                    avatar,
                };
                if (!commitsByUser[userName]) {
                    commitsByUser[userName] = []
                }
                commitsByUser[userName].push({
                    url: commit.links.html.href,
                    userName,
                    sha: commit.hash,
                    message: commit.message,
                    commitDate: commit.date
                });
            }
            return {
                committers: _.values(committersMap),
                commits: _.flatten(_.values(commitsByUser)),
                firstCommitDate,
                lastCommitDate
            };
        }
        return null;
    }
}
module.exports = new BitbucketApi();
