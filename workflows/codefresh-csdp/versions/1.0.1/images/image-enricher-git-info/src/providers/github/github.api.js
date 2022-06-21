const { Octokit } = require('@octokit/rest');
const _ = require('lodash');

const inputs = require('../../configuration').inputs;
const codefreshApi = require('../../codefresh.api');

class GithubApi {

    githubCreds

    async getBranch(repo, branch) {
        try {
            const apiClient = await this._prepareApiClient()
            const [repoOwner, repoName] = this._getRepoOwnerAndName(repo);

            const response = await apiClient.repos.getBranch({
                owner: repoOwner,
                repo: repoName,
                branch,
            });
            return response.data;
        } catch (err) {
            if (err.status === 404) {
                return null
            }
            throw err
        }
    }

    async searchForPullRequests(repo, branch) {
        const apiClient = await this._prepareApiClient()

        console.log(`Looking for PRs from ${repo} repo and ${branch} branch`);

        const response = await apiClient.search.issuesAndPullRequests({ q: `head:${branch}+type:pr+repo:${repo}` });
        return response.data
    }

    async extractCommitsInfo(repo, pullRequestId) {
        const apiClient = await this._prepareApiClient()
        const [repoOwner, repoName] = this._getRepoOwnerAndName(repo);

        const commitsByUserLimit = inputs.commitsByUserLimit

        const committersMap = {};
        const commitsByUser = {};
        let firstCommitDate;
        let lastCommitDate;

        let page = 1;
        while (true) {
            const commits = await apiClient.pulls.listCommits({
                owner: repoOwner,
                repo: repoName,
                pull_number: pullRequestId,
                page,
            });

            if (commits.data.length === 0) {
                break;
            }

            if (page === 1) {
                firstCommitDate = commits.data[0].commit.author.date;
            }

            lastCommitDate = _.last(commits.data).commit.author.date;

            for (const commit of commits.data) {
                if (!commit.author) {
                    continue
                }

                const userName = commit.author.login

                committersMap[userName] = {
                    userName,
                    avatar: commit.author.avatar_url,
                }

                if (!commitsByUser[userName]) {
                    commitsByUser[userName] = []
                }

                commitsByUser[userName].push({
                    url: commit.html_url,
                    userName,
                    sha: commit.sha,
                    message: commit.commit.message,
                    commitDate: commit.commit.author.date,
                })
            }

            page++;
        }

        for (const userName of Object.keys(commitsByUser)) {
            commitsByUser[userName] = _.takeRight(commitsByUser[userName], commitsByUserLimit);
        }


        return {
            committers: _.values(committersMap),
            commits: _.flatten(_.values(commitsByUser)),
            firstCommitDate,
            lastCommitDate
        };
    }

    async _prepareApiClient() {
        const { githubApiHost, githubApiPathPrefix, githubToken } = await this._resolveCreds();

        const octokit = new Octokit({
            auth: githubToken,
            baseUrl: this._buildRequestUrl(githubApiHost, githubApiPathPrefix)
        });

        return octokit
    }

    async _resolveCreds() {
        if (this.githubCreds) {
            return this.githubCreds
        }

        if (inputs.githubToken) {
            this.githubCreds = {
                githubToken: inputs.githubToken,
                githubApiHost: inputs.githubApiHost || 'api.github.com',
                githubApiPathPrefix: inputs.githubApiPathPrefix || '/'
            };
        } else {
            const context = await codefreshApi.getContext(inputs.githubContextName);
            const githubToken = context.spec.data.auth.password;
            const githubApiPathPrefix = _.get(context, 'spec.data.auth.apiPathPrefix', '/');
            const githubApiHost = _.get(context, 'spec.data.auth.apiHost', 'api.github.com');
            this.githubCreds = { githubApiHost, githubApiPathPrefix, githubToken };
        }
        return this.githubCreds
    }

    _buildRequestUrl(apiHost, apiPathPrefix) {
        try {
            let pathPrefix = apiPathPrefix.replace(/\/$/, ""); // remove the last slash
            if (pathPrefix && pathPrefix[0] !== '/') {
                pathPrefix = `/${pathPrefix}`; // ensure left slash
            }

            // Sanitizing URL for supporting all formats existing in DB
            // Normalize parts of url in format: (host)(/pathPrefix)
            let host = apiHost.replace(/\/$/, ""); // remove the last slash
            if (!/^http(s?)/.test(host)) {
                host = `https://${host}`
            }

            return `${host}${pathPrefix}`
        } catch (error) {
            console.error(error);
            throw new Error(`github api host is not valid`);
        }
    }

    _getRepoOwnerAndName(repo) {
        const [owner, ...name] = repo.split('/');
        return [owner, name.join('/')]
    }
}


module.exports = new GithubApi();
