import { config } from '../../configuration'
import { PR_WORKFLOW_LABEL} from '../../constants'
import { Provider } from '../interface'
import { Octokit } from '@octokit/rest'

export class GithubService implements Provider {
    private readonly client

    constructor() {
        this.client = new Octokit({
            auth: config.github.token,
            baseUrl: this._buildBaseUrl()
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
                labels: [`${PR_WORKFLOW_LABEL}=${config.prWorkflow}`]
            });
            return pr.data.html_url
        } catch (err) {
            throw new Error(`Failed to create pr ${err}`)
        }
    }

    _buildBaseUrl(): string  {
        const protocol = 'https'
        if (config.github.api) {
            if (config.github.pathPrefix) {
                return `${protocol}://${config.github.api}/${config.github.pathPrefix}`
            }
            return `${protocol}://${config.github.api}`
        }
        return `${protocol}://api.${config.github.host}`
    }
}