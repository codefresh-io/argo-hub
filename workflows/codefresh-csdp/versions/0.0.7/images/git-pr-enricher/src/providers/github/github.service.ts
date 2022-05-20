import { config } from '../../configuration'
import { Provider } from '../interface'
import { Octokit } from '@octokit/rest'

export class GithubService implements Provider {
    private readonly client

    constructor() {
        this.client = new Octokit({
            auth: config.github.token,
            baseUrl: config.github.api ? `https://${config.github.host}/${config.github.api}` : `https://${config.github.host}`
        });
    }

    async createPullRequest(): Promise<string> {
        const {owner, repo, title, head, base} = config
        try {
            const pr = await this.client.rest.pulls.create({
                owner,
                repo,
                title,
                head,
                base
            });
            await this.client.rest.issues.update({
                owner,
                repo,
                issue_number: pr.data.number,
                labels: [`pr-workflow=${config.prWorkflow}`]
            });
            return pr.data.html_url
        } catch (err) {
            throw new Error(`Failed to create pr ${err}`)
        }
    }
}