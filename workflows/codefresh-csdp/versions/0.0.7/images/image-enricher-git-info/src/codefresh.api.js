const { GraphQLClient, gql } = require('graphql-request')
const rp = require('request-promise')
const _ = require('lodash');
const chalk = require('chalk');

const { cfHost, cfApiKey } = require('./configuration').inputs;

class CodefreshAPI {
    _handleError(e) {
        if (_.get(e, 'error.message')) {
            const code = _.get(e, 'error.code');
            const statusCode = _.get(e, 'error.status');
            const message = _.get(e, 'error.message');
            throw new Error(`Codefresh error ${statusCode} [${code}]: ${message}`);
        };

        throw e;
    }
    
    async getContext(name) {
        try {
            let host = cfHost
            if (!/^http(s?):\/\//.test(host)) {
                host = `https://${host}`
            }
            return await rp({
                method: 'GET',
                uri: `${host}/api/contexts/${name}?decrypt=true`,
                headers: {
                    'Authorization': `Bearer ${cfApiKey}`
                },
                json: true
            });
        } catch (e) {
            return this._handleError(e);
        }
    }

    async _doGraphqlRequest(query, variables) {
        let host = cfHost
        if (!/^http(s?):\/\//.test(host)) {
            host = `https://${host}`
        }
        const graphQLClient = new GraphQLClient(`${host}/2.0/api/graphql`, {
            headers: {
                'Authorization': `Bearer ${cfApiKey}`
            },
        });

        return await graphQLClient.request(query, variables);
    }

    async patchImageWithGitBranchData(imageName, imageDigest, branch) {
    }

    async createRevisionAnnotation(imageName, branch) {
        console.log(chalk.green(`Create revision branch ${branch.name}, image ${imageName}`));
        try {

            const saveAnnotationMutation = gql`mutation saveAnnotation($annotation: AnnotationArgs!) {
                saveAnnotation(annotation: $annotation)
            }`;
            const annotation = {
                logicEntityId: { id: imageName },
                entityType: 'image',
                key: branch.commit.sha,
                type: 'revision',
                revisionValue: {
                    branch: branch.name,
                    commit: branch.commit.sha,
                    commitMsg: branch.commit.commit.message,
                    commitURL: branch.commit.html_url,
                    author: branch.commit.author.login
                }
            };
            // return await this._doGraphqlRequest(saveAnnotationMutation, { annotation });
        } catch (e) {
            return this._handleError(e);
        }
    }

    async createPullRequestAnnotation(imageName, pullRequest) {
        console.log(chalk.green(`Create pull request ${pullRequest.number}=${pullRequest.url}, image ${imageName}`));
        try {
            const saveAnnotationMutation = gql`mutation saveAnnotation($annotation: AnnotationArgs!) {
                saveAnnotation(annotation: $annotation)
            }`;
            const annotation = {
                logicEntityId: { id: imageName },
                entityType: 'image',
                key: `#${pullRequest.number}`,
                type: 'pr',
                pullRequestValue: {
                    url: pullRequest.url,
                    title: pullRequest.title,
                    committers: pullRequest.committers,
                    commits: pullRequest.commits
                }
            };
            return await this._doGraphqlRequest(saveAnnotationMutation, { annotation });
        } catch (e) {
            return this._handleError(e);
        }
    }
}

module.exports = new CodefreshAPI();
