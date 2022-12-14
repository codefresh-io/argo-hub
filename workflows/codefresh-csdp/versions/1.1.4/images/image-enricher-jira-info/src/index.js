// registering error handler
require('./outputs');

const _ = require('lodash');
const chalk = require('chalk');

const jiraService = require('./jira.service');
const codefreshApi = require('./codefresh.api');
const configuration = require('./configuration');

async function main() {
    console.log('starting jira enricher')

    const [ validationError, inputs ] = configuration.validateInputs()

    if (validationError) {
        throw validationError
    }

    console.log(`looking for Issues from message ${inputs.message}`);

    try {
        await jiraService.init()
    } catch(e) {
        throw new Error(`Cant initialize jira client, reason: ${e.message}`)
    }

    const issues = jiraService.extract();

    if (!_.isArray(issues)) {
        if (inputs.failOnNotFound === 'true') {
            throw new Error(`issues weren't found, FAIL_ON_NOT_FOUND=true`)
        }
        console.warn(`issues weren't found, FAIL_ON_NOT_FOUND=false`);
        return;
    } else {
        console.log(`detected issues: [${issues.join(', ')}]`)
    }

    for (const issue of issues) {
        const normalizedIssue = issue.toUpperCase();
        console.log(`looking for the issue ${normalizedIssue}`)

        const issueInfo = await jiraService
            .getInfoAboutIssue(normalizedIssue);

        if (!issueInfo) {
            // issue not found and error not thrown, continue execution
            continue
        }

        const baseUrl = issueInfo.baseUrl || inputs.jira.host;
        const url = `${baseUrl}/browse/${normalizedIssue}`;
        const avatarUrls = _.get(issueInfo, 'fields.assignee.avatarUrls', {});

        await codefreshApi.createIssueAnnotation(inputs.imageName, {
            number: normalizedIssue,
            url: url,
            title: _.get(issueInfo, 'fields.summary'),
            assignee: _.get(issueInfo, 'fields.assignee.displayName'),
            status: _.get(issueInfo, 'fields.status.name'),
            avatarURL: Object.values(avatarUrls)[0]
        });

        console.log(chalk.green(`codefresh assigned issue ${normalizedIssue} to your image ${inputs.imageName}`));
    }
}

main();
