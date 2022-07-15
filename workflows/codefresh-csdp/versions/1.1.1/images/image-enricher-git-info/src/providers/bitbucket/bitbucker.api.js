const _ = require('lodash');
const { inputs } = require("../../configuration");
const rp = require("request-promise");

class BitbucketApi {
    constructor() {
        this.serverURL = inputs.bitbucketHost;
        this.username = inputs.bitbucketUsername;
        this.password = inputs.bitbucketPassword;
    }

    async _sendGetRequest(uri, qs) {
        return rp({
            method: 'GET',
            uri: `${this.serverURL}/${uri}`,
            qs,
            auth: {
                user: this.username,
                pass: this.password
            },
            json: true
        });
    }

    async _getPageByUrl(url) {
        return rp({
            method: 'GET',
            uri: `${url}`,
            auth: {
                user: this.username,
                pass: this.password
            },
            json: true
        });
    }

    async getBranch(repo, branch) {
        const [ workspace, repoSlug ] = repo.split('/');
        return this._sendGetRequest(`/repositories/${workspace}/${repoSlug}/refs/branches/${branch}`);
    }

    async getPullRequests(repo, branch) {
        const [ workspace, repoSlug ] = repo.split('/');

        const result = await this._sendGetRequest(`/repositories/${workspace}/${repoSlug}/pullrequests`,{
            pagelen: 50,
            fields: '+values.participants',
            q: `source.branch.name="${branch}"`
        });
        return _.get(result, 'values', []);
    }

    async getCommitsInfo(repo, pr) {
        const [workspace, repoSlug] = repo.split('/');
        let result = await this._sendGetRequest(`/repositories/${workspace}/${repoSlug}/pullrequests/${pr.id}/commits`);
        const commits = _.get(result, 'values', []);
        while (result.next) {
            result = await this._getPageByUrl(result.next);
            commits.push(..._.get(result, 'values', []));
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
