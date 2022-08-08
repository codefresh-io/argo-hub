const BitbucketServerService = require('./../bitbucket-server.service')
const rp = require("request-promise");

describe('Bitbucket Server service test', () => {
    it('success', async () => {

        const branches = await rp({
            method: 'GET',
            uri: 'http://localhost:7990/rest/api/latest/projects/dev/repos/test/commits?until=test&limit=0&start=0',
            auth: {
                 'user': 'Admin',
                'pass': 'ololo@@yoda1992'
            },
            json: true
        });
        // const res = await rp({
        //     method: 'GET',
        //     uri: 'http://localhost:7990/rest/api/1.0/users/admin/avatar.png',
        //     auth: {
        //         'user': 'Admin',
        //         'pass': 'ololo@@yoda1992'
        //     },
        //     json: true
        // });
        const prInfo = await BitbucketServerService.getPullRequestsWithCommits('dev/test', 'test');
        const branchInfo = await BitbucketServerService.getBranch('dev/test', 'test');
        console.log(JSON.stringify(prInfo))
        console.log(JSON.stringify(branchInfo))
    });
})
