const { GraphQLClient, gql } = require('graphql-request')
const rp = require('request-promise')
const _ = require('lodash');
const chalk = require('chalk');

const { cfHost, cfApiKey } = require('./configuration').inputs;

class CodefreshAPI {
    _handleError(e, prefix) {
        const qlError = _.get(e, 'response.errors.0')
        if (qlError) {
            throw new Error(prefix
                ? `${prefix}: `.concat(qlError.message)
                : qlError.message);
        }
        throw e;
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

    async patchImageWithGitBranchData(imageDigest, branch, imageName) {
        console.log(chalk.green(`Patching image with data from branch: ${branch.name}`));
        try {

            const patchImageBinaryMutation = gql`mutation patchImageBinary($imageId: String!, $imagePatch: ImageBinaryPatchInput!, $imageName: String) {
                patchImageBinary(imageId: $imageId, imagePatch: $imagePatch, imageName: $imageName) {
                    imageName
                }
            }`;
            const vars = {
                imageId: imageDigest,
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
        console.log(chalk.green(`Create pull request ${pullRequest.number}=${pullRequest.url}`));
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
                        commits: pullRequest.commits
                    }
                }
            };
            return await this._doGraphqlRequest(saveAnnotationMutation, vars);
        } catch (e) {
            this._handleError(e, 'Failed to create pr annotation');
        }
    }
}

module.exports = new CodefreshAPI();
