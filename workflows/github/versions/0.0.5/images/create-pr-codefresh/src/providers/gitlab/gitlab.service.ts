import { Provider } from '../interface'

export class GitlabService implements Provider {
    constructor() {

    }

    createPullRequest(): Promise<string> {
        throw new Error(`Gitlab is not supported`)
    }


}