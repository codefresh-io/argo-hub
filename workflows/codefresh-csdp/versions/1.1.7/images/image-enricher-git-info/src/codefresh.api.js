const { GraphQLClient, gql, ClientError } = require('graphql-request')
const rp = require('request-promise')
const _ = require('lodash');
const chalk = require('chalk');

const { cfHost, cfApiKey } = require('./configuration').inputs;

class CodefreshAPI {
    _handleError(e, prefix) {
        let formattedMessage
        if (e instanceof ClientError) {
            if (e.response.status !== 200) {
                formattedMessage = e.response.error
            } else {
                const qlErrorMessage = _.get(e, 'response.errors.0.message')
                if (qlErrorMessage) {
                    formattedMessage = qlErrorMessage
                }
            }
        }
        throw new Error(prefix
            ? `${prefix} (${formattedMessage || e.message})`
            : formattedMessage || e.message);
    }

    async getContext(name) {
        try {
            return await rp({
                method: 'GET',
                uri: `${cfHost}/api/contexts/${name}?decrypt=true`,
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
        const graphQLClient = new GraphQLClient(`${cfHost}/2.0/api/graphql`, {
            headers: {
                'Authorization': `Bearer ${cfApiKey}`
            },
        });

        return await graphQLClient.request(query, variables);
    }

    async patchImageWithGitBranchData(imageName,  branch) {
        console.log(chalk.green(`patching image with data from branch: ${branch.name}`));
        try {

            const patchImageBinaryMutation = gql`mutation patchImageBinary($imagePatch: ImageBinaryPatchInput!, $imageName: String) {
                patchImageBinary(imagePatch: $imagePatch, imageName: $imageName) {
                    imageName
                }
            }`;
            const vars = {
                imageName,
                imagePatch: {
                    branch: branch.name,
                    commit: branch.commit,
                    commitMsg: branch.commitMsg,
                    commitURL: branch.commitURL,
                    author: {
                        username: branch.committerUsername
                    }
                }
            }

            return await this._doGraphqlRequest(patchImageBinaryMutation, vars);
        } catch (e) {
            this._handleError(e, 'Failed to patch image with branch data');
        }
    }

    async createPullRequestAnnotation(imageName, pullRequest) {
        console.log(chalk.green(`creating pull request annotation ${pullRequest.number}=${pullRequest.url}`));
        try {
            const saveAnnotationMutation = gql`mutation saveAnnotation($annotation: AnnotationArgs!) {
                saveAnnotation(annotation: $annotation)
            }`;
            const vars = {
                annotation: {
                    logicEntityId: { id: imageName },
                    entityType: 'image',
                    key: `#${pullRequest.number}`,
                    type: 'pr',
                    pullRequestValue: {
                        url: pullRequest.url,
                        title: pullRequest.title,
                        committers: pullRequest.committers,
                        commits: pullRequest.commits.map(c => ({
                            url: c.url,
                            userName: c.userName,
                            sha: c.sha,
                            message: c.message,
                            commitDate: c.commitDate
                        }))
                    }
                }
            };
            await this._doGraphqlRequest(saveAnnotationMutation, vars);
        } catch (e) {
            this._handleError(e, 'Failed to create pr annotation');
        }
    }
}

module.exports = new CodefreshAPI();
