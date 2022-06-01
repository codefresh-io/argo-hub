import { Provider } from '../interface'

export class BitbucketService implements Provider {

    constructor() {
    }

    createPullRequest(): Promise<string> {
        throw new Error(`Bitbucket is not supported`)
    }


}