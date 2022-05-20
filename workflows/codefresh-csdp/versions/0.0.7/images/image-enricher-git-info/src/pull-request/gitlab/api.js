const chalk = require('chalk');
const configuration = require("../../configuration");
const { Gitlab } = require('@gitbeaker/node');
const _ = require("lodash");
const rp = require('request-promise');
const { host, apiToken } = require("../../configuration");

class GitlabAPI {

    constructor() {
        this.api = new Gitlab({
            host: `https://${configuration.gitlabHost}`,
            token: configuration.gitlabToken,
        });
    }

    async _getAvatarForEmail(email) {
        try {
            return await rp({
                method: 'GET',
                uri: `https://${configuration.gitlabHost}/api/v4/avatar?email=${email}&size=32`,
                json: true
            });
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    async _getParticipantsAvatars(repo, prIid) {
        const participants = await this.api.MergeRequests.participants(repo, prIid);
        const avatarsByUser = {};
        _.forEach(participants, participant => {
            avatarsByUser[participant.name] = participant.avatar_url;
        })
        return avatarsByUser;
    }

    async _getAvatarFromCommit(avatarsByName, commit) {
        const avatar = avatarsByName[commit.committer_name];
        if (!avatar) {
            const result = await this._getAvatarForEmail(commit.committer_email);
            return _.get(result, 'avatar_url');
        }
        return avatar;
    }

    async _getCommitsInfo(repo, pr) {
        const commits = await this.api.MergeRequests.commits(repo, pr.iid);
        const avatarsByName = await this._getParticipantsAvatars(repo, pr.iid)
        if (commits && commits.length > 0) {
            const firstCommitDate = commits[0].created_at;
            const lastCommitDate = _.last(commits).created_at;
            const commitsByUser = {};
            const committersMap = {};
            for (const commit of commits) {
                const avatar = await this._getAvatarFromCommit(avatarsByName, commit);
                const userName = commit.committer_email;
                committersMap[userName] = {
                    userName,
                    avatar,
                };
                if (!commitsByUser[userName]) {
                    commitsByUser[userName] = []
                }
                commitsByUser[userName].push({
                    url: commit.web_url,
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

    async pullRequests() {
        const { branch, repo } = configuration;
        const prs = await this.api.MergeRequests.all({ projectId: repo, 'state': 'all', 'scope': 'all', 'sourceBranch': branch });
        return Promise.all(prs.map(async (pr) => {
            const info = await this._getCommitsInfo(repo, pr);
            const result = {
                ...info,
                prDate: pr.closed_at || pr.updated_at,
                number: pr.iid,
                url: `${pr.web_url}`,
                title: pr.title,
            }

            return result;
        }));
    }
}
module.exports = new GitlabAPI();
