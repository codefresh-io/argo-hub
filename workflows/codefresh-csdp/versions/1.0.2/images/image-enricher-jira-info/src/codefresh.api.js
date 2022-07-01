const { cfHost, cfApiKey, imageName } = require('./configuration').inputs;
const rp = require('request-promise');

class CodefreshAPI {

    async createIssueV2(issue) {

        console.log(`Create issue request ${issue.number}=${issue.url}, image: ${imageName}`);
        const body = {
            "operationName":"saveAnnotation",
            "variables": {
                "annotation": {
                    "logicEntityId": {"id": imageName},
                    "entityType": "image",
                    "key": `${issue.number}`,
                    "type": "issue",
                    "issueValue": {
                        "url": issue.url,
                        "title": issue.title,
                        "assignee": issue.assignee,
                        "avatarURL": issue.avatarURL,
                        "status": issue.status
                    },
                },
            },
            "query":"mutation saveAnnotation( $annotation: AnnotationArgs!) {\n saveAnnotation(annotation: $annotation)\n}"
        }
        console.log(JSON.stringify(body));
        return rp({
            method: 'POST',
            uri: `${cfHost}/2.0/api/graphql`,
            body,
            headers: {
                'Authorization': `Bearer ${cfApiKey}`
            },
            json: true
        });
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
