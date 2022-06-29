const JiraClient = require('jira-connector');
const _ = require('lodash');

const configuration = require('./configuration').inputs;
const codefreshApi = require('./codefresh.api');

const CodefreshJiraClient = require('./CodefreshJiraClient');

class JiraService {

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

            const { hostname } = new URL(jiraContext.spec.data.auth.apiURL);
            jiraConfig = {
                host: hostname,
                basic_auth: {
                    email: jiraContext.spec.data.auth.username,
                    api_token: jiraContext.spec.data.auth.password
                },
                context: jiraConfig.context,
            }
        } else {
            const { hostname } = new URL(jiraConfig.host);
            jiraConfig.host = hostname
        }

        this.jira = new JiraClient({
            ...jiraConfig
        })

    }

    extract() {
        return new RegExp(`${configuration.projectName}-\\d*`, 'i').exec(configuration.message);
    }

    getInfoAboutIssue(issue) {
        return this.jira.issue.getIssue({
                issueKey: issue
            });
    }

}

module.exports = new JiraService();
