const codefreshApi = require('./codefresh.api');

class CodefreshJiraClient {
    constructor(context) {
        this.context = context;
        this.issues = {
            getIssue: this.getIssue.bind(this),
        };
    }

    async getIssue({ issueIdOrKey }) {
        return codefreshApi.getJiraIssue(this.context, issueIdOrKey);
    }
}

module.exports = CodefreshJiraClient;
