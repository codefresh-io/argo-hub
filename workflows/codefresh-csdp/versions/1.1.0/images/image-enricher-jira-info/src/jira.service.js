const JiraClient = require('jira-connector');
const _ = require('lodash');

const inputs = require('./configuration').inputs;
const codefreshApi = require('./codefresh.api');
const CodefreshJiraClient = require('./CodefreshJiraClient');

class JiraService {

    async init() {
        if (inputs.jira.context) {
            const jiraContext = await codefreshApi.getJiraContext(inputs.jira.context);
            if (!jiraContext) {
                throw new Error(`Codefresh jira integration \"configuration.jira.context\" not found`)
            }
            if (jiraContext.spec.data.auth.type === 'addon') {
                this.jira = new CodefreshJiraClient(inputs.jira.context);
                return;
            }

            const { hostname } = new URL(jiraContext.spec.data.auth.apiURL);
            inputs.jira = {
                host: hostname,
                basic_auth: {
                    email: jiraContext.spec.data.auth.username,
                    api_token: jiraContext.spec.data.auth.password
                },
                context: inputs.jira.context,
            }
        } else {
            const { hostname } = new URL(inputs.jira.host);
            inputs.jira.host = hostname
        }

        this.jira = new JiraClient({
            ...inputs.jira
        })

    }

    extract() {
        return new RegExp(`${inputs.projectName}-\\d*`, 'i').exec(inputs.message);
    }

    async getInfoAboutIssue(issue) {
        try {
            return await this.jira.issue.getIssue({
                issueKey: issue
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
            if (inputs.failOnNotFound === "true") {
                throw new Error(`issue ${issueId} not found`)
            } else {
                console.warn(`skip issue ${issueId}, didn't find in jira system or you don't have permissions for find it`);
                return null
            }
        }
    }

}

module.exports = new JiraService();
