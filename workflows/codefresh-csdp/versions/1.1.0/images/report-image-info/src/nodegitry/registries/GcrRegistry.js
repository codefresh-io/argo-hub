'use strict';

const { GoogleAuth } = require('google-auth-library');

const StandardRegistry = require('./StandardRegistry');

class GcrRegistry extends StandardRegistry {
    constructor(options) {
        super(options);
        const { keyFilePath, client_email, private_key } = JSON.parse(options.keyfile || 'false') || this.credentials || options;

        if (keyFilePath) {
            this._googleAuth = new GoogleAuth({
                keyFilename: keyFilePath,
                scopes: ['https://www.googleapis.com/auth/devstorage.read_write'],
            });
        } else {
            this._googleAuth = new GoogleAuth({
                credentials: {
                    client_email,
                    private_key,
                },
                scopes: ['https://www.googleapis.com/auth/devstorage.read_write'],
            });
        }
    }

    async _getClient() {
        if (!this._clientPromise) {
            this._clientPromise = this._googleAuth.getClient();
        }

        const client = await this._clientPromise;
        await client.authorize();
        return client;
    }

    async getCredentials() {
        const client = await this._getClient();
        const { access_token } = await client.authorize();
        return {
            username: 'oauth2accesstoken',
            password: access_token
        };
    }

    async getProjectId() {
        return this._googleAuth.getProjectId();
    }
}

module.exports = GcrRegistry;
