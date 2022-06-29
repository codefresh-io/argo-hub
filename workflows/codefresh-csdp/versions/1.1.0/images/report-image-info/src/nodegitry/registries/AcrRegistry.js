'use strict';

const _ = require('lodash');
const StandardRegistry = require('./StandardRegistry');
const qs = require('querystring');
const request = require('request-promise');
const jwt = require('jsonwebtoken');
const CFError = require('cf-errors');

const MANAGED_IDENTITY_URL = 'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/';
const ACR_DOCKER_USERNAME = '00000000-0000-0000-0000-000000000000';

class AcrRegistry extends StandardRegistry {
    constructor(options) {
        super(options);
        const { clientId, clientSecret } = options.credentials || options;
        this._credentials = { clientId, clientSecret };
        this._auth = null;
    }

    async getCredentials() {
        const auth = await this._refreshAuth();
        return auth.credentials;
    }

    async getDomain() {
        const auth = await this._refreshAuth();
        return auth.domain;
    }

    _getManagedIdentityURL(clientId) {
        if (clientId) {
            return `${MANAGED_IDENTITY_URL}&client_id=${clientId}`;
        }
        return MANAGED_IDENTITY_URL;
    }

    async _exchangeTokenToRefreshToken(service, credentials) {
        const exchangeEndpoint = `https://${service}/oauth2/exchange`;

        const reqBody = qs.stringify({
            grant_type: 'access_token',
            service,
            access_token: _.get(credentials, 'access_token'),
        });

        const options = {
            method: 'POST',
            uri: exchangeEndpoint,
            headers: {
                'Content-Length': reqBody.length,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: reqBody,
            resolveWithFullResponse: true,
        };

        const exchangeResponse = await request(options);
        const exchangeResponseData = JSON.parse(exchangeResponse.body);

        // Now we have a refresh_token to used against token endpoint
        // to get a valid ACR-specific token
        return exchangeResponseData.refresh_token;
    }

    async _getTokenFromManagedIdentity(domain, clientId) {
        const managedIdentityURL = this._getManagedIdentityURL(clientId);
        const options = {
            method: 'GET',
            json: true,
            headers: {
                Metadata: true
            },
            uri: managedIdentityURL
        };
        const credentials = await request(options);
        return this._exchangeTokenToRefreshToken(domain, credentials);
    }

    async _getCredentialsUsingMI() {
        try {
            const authorizationToken = await this._getTokenFromManagedIdentity(this.domain, _.get(this, '_credentials.clientId'));
            const { exp } = jwt.decode(authorizationToken);
            return {
                domain: this.domain,
                expiresAt: new Date(exp * 1000),
                credentials: {
                    username: ACR_DOCKER_USERNAME,
                    password: authorizationToken
                }
            };
        } catch (err) {
            throw new CFError({
                cause: err,
                message: 'Failed to get ACR credentials using managed identity'
            });
        }
    }

    async _getCredentialsUsingSP() {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 1);
        return {
            domain: this.domain,
            expiresAt,
            credentials: {
                username: _.get(this, '_credentials.clientId'),
                password: _.get(this, '_credentials.clientSecret')
            }
        };
    }

    async _refreshAuth() {
        const tokenExpires = _.get(this, '_auth.expiresAt', new Date(0));
        if (new Date() < tokenExpires) {
            return this._auth;
        }

        if (_.get(this, '_credentials.clientSecret') && _.get(this, '_credentials.clientId')) {
            this._auth = await this._getCredentialsUsingSP();
        } else {
            this._auth = await this._getCredentialsUsingMI();
        }
        return this._auth;
    }
}

module.exports = AcrRegistry;
