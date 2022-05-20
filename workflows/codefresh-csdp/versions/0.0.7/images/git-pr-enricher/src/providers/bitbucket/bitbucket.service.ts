import { Provider } from '../interface'

export class BitbucketService implements Provider {

    constructor() {
    }

    createPullRequest(): any {
        throw new Error(`Bitbucket is not supported`)
    }


}