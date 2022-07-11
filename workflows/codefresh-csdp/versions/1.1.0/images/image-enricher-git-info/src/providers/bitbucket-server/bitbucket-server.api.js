const _ = require('lodash');
const { inputs } = require("../../configuration");
const rp = require('request-promise');

class BitbucketServerApi {
    constructor() {
        this.serverURL = inputs.bitbucketHost;
        this.username = inputs.bitbucketUsername;
        this.password = inputs.bitbucketPassword;
    }

    async _sendGetRequest(uri) {
        return rp({
            method: 'GET',
            uri: `${this.serverURL}/${uri}`,
            auth: {
                user: this.username,
                pass: this.password
            },
            json: true
        });
    }

    _buildCommitUrl(workspace, repoSlug, commitId) {
        if (!commitId) {
            return undefined;
        }
        return `${this.serverURL}/projects/${workspace}/repos/${repoSlug}/commits/${commitId}`;
    }

    _getRepoSlugAndWorkspaceFromRepo(repo) {
        return repo.split('/')
    }

    async getBranch(repo, branch) {
        const [ workspace, repoSlug ] = this._getRepoSlugAndWorkspaceFromRepo(repo);
        const result = await this._sendGetRequest(`rest/api/latest/projects/${workspace}/repos/${repoSlug}/commits?until=${branch}&limit=0&start=0`);
        const branchInfo = _.get(result, 'values[0]');
        if (!branchInfo) {
            return null
        }
        branchInfo.commitURL = this._buildCommitUrl(workspace, repoSlug, branchInfo.id)
        return branchInfo;
    }

    async getPullRequests(repo, branch) {
        const [ workspace, repoSlug ] = this._getRepoSlugAndWorkspaceFromRepo(repo);
        const result = await this._sendGetRequest(`rest/api/latest/projects/${workspace}/repos/${repoSlug}/pull-requests?start=0&order=newest&state=ALL&at=refs/heads/${branch}&direction=outgoing`);
        return _.get(result, 'values', []);
    }

    async getCommitsInfo(repo, pr) {
        const [ workspace, repoSlug ] = this._getRepoSlugAndWorkspaceFromRepo(repo);
        let result = await this._sendGetRequest(`projects/${workspace}/repos/${repoSlug}/pull-requests/${pr.id}/commits?start=0&avatarSize=48&limit=50&contents`);
        const reversedCommits = _.get(result, 'values', []);
        while (!result.isLastPage) {
            result = await this._sendGetRequest(`projects/${workspace}/repos/${repoSlug}/pull-requests/${pr.id}/commits?start=${result.nextPageStart}&limit=50&avatarSize=48&contents`);
            reversedCommits.push(...result.values);
        }
        const commits = _.reverse(reversedCommits);
        if (commits && commits.length > 0) {
            const firstCommitDate = commits[0].committerTimestamp;
            const lastCommitDate = _.last(commits).committerTimestamp;
            const commitsByUser = {};
            const committersMap = {};
            for (const commit of commits) {
                const userName = commit.author.emailAddress;
                const avatar = commit.author.avatarUrl;
                committersMap[userName] = {
                    userName,
                    avatar,
                };
                if (!commitsByUser[userName]) {
                    commitsByUser[userName] = []
                }
                commitsByUser[userName].push({
                    url: this._buildCommitUrl(workspace, repoSlug, commit.id),
                    userName,
                    sha: commit.id,
                    message: commit.message
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
module.exports = new BitbucketServerApi();
