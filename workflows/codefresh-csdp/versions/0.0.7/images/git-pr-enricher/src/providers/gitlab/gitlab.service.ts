import { Provider } from '../interface'

export class GitlabService implements Provider {
    constructor() {

    }

    createPullRequest(): any {
        throw new Error(`Gitlab is not supported`)
    }


}