const rp = require('request-promise');
const chalk = require('chalk');
const _ = require('lodash');
const { gql, GraphQLClient, ClientError } = require('graphql-request');

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

    async _doGraphqlRequest(query, variables) {
        const graphQLClient = new GraphQLClient(`${cfHost}/2.0/api/graphql`, {
            headers: {
                'Authorization': `Bearer ${cfApiKey}`
            },
        });

        return await graphQLClient.request(query, variables);
    }

    async createIssueAnnotation(imageName, issue) {
        console.log(chalk.green(`creating issue annotation ${issue.number}=${issue.url}, image: ${imageName}`));
        try {
            const saveAnnotationMutation = gql`mutation saveAnnotation($annotation: AnnotationArgs!) {
                saveAnnotation(annotation: $annotation)
            }`;
            const vars = {
                annotation: {
                    logicEntityId: { 'id': imageName },
                    entityType: 'image',
                    key: `${issue.number}`,
                    type: 'issue',
                    issueValue: {
                        url: issue.url,
                        title: issue.title,
                        assignee: issue.assignee,
                        avatarURL: issue.avatarURL,
                        status: issue.status
                    },
                }
            };
            return await this._doGraphqlRequest(saveAnnotationMutation, vars);
        } catch (e) {
            this._handleError(e, 'Failed to create issue annotation');
        }
    }

    async getJiraContext(name) {
        return rp({
            method: 'GET',
            uri: `${cfHost}/api/contexts/${name}?regex=true&type=atlassian&decrypt=true`,
            headers: {
                'Authorization': `Bearer ${cfApiKey}`
            },
            json: true
        });
    }

    async getJiraIssue(context, issueKey) {
        return rp({
            method: 'GET',
            uri: `${cfHost}/api/atlassian/issues/${issueKey}?jira-context=${context}`,
            headers: {
                'Authorization': `Bearer ${cfApiKey}`
            },
            json: true
        });
    }
}
module.exports = new CodefreshAPI();
