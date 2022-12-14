const JiraClient = require('jira-connector');
const { Version2Client } = require('jira.js');

const _ = require('lodash');

const inputs = require('./configuration').inputs;
const codefreshApi = require('./codefresh.api');
const CodefreshJiraClient = require('./CodefreshJiraClient');

class JiraService {
    // jira: Version2Client

    async init() {
        let jiraConfig = _.cloneDeep(inputs.jira)

        if (jiraConfig.context) {
            const jiraContext = await codefreshApi.getJiraContext(jiraConfig.context);
            if (!jiraContext) {
                throw new Error(`Codefresh jira integration \"configuration.jira.context\" not found`)
            }
            if (jiraContext.spec.data.auth.type === 'addon') {
                this.jira = new CodefreshJiraClient(jiraConfig.context);
                return;
            }

            // const { hostname } = new URL(jiraContext.spec.data.auth.apiURL);
            jiraConfig = {
                host: jiraContext.spec.data.auth.apiURL,
                authentication: {
                    basic: {
                        email: jiraContext.spec.data.auth.username,
                        apiToken: jiraContext.spec.data.auth.password
                    },
                },
                context: jiraConfig.context,
            }
        }/* else {
            const { hostname } = new URL(jiraConfig.host);
            jiraConfig.host = hostname
        }*/

        this.jira = new Version2Client({
            ...jiraConfig
        })

    }

    extract() {
        return new RegExp(`${inputs.projectName}-\\d*`, 'i').exec(inputs.message);
    }

    async getInfoAboutIssue(issue) {
        try {
            return await this.jira.issues.getIssue({
                issueIdOrKey: issue,
            });
        } catch (error) {
            return this._handleJiraError(error, issue)
        }
    }

    _handleJiraError(error, issueId) {
        let errorObject = error
        if (_.isString(errorObject)) { // jira returns errors in string format
            errorObject = JSON.parse(errorObject);
        }
        const errorMessage = JSON.stringify(errorObject.body)
        console.error(`failed to get jira issue ${issueId}: ${errorMessage}`)

        if (errorObject.statusCode === 401) {
            throw new Error('failed to authenticate to Jira, please verify you are using valid credentials')
        }
        if (errorObject.statusCode === 404) {
            if (errorObject.body.errorMessage === 'Site temporarily unavailable') {
                throw new Error(`provided jira host is unavailable – ${errorObject.request.uri.host}`)
            }
            if (inputs.failOnNotFound === 'true') {
                throw new Error(`issue ${issueId} not found`)
            } else {
                console.warn(`skip issue ${issueId}, didn't find in jira system or you don't have permissions for find it`);
                return null
            }
        }
    }
}

module.exports = new JiraService();
