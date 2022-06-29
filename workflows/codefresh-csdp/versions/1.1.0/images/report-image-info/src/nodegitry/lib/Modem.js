'use strict';

const _ = require('lodash');
let request = require('requestretry');
const os = require('os');
const CFError = require('cf-errors');

const { parseAuthenticationHeader } = require('./auth-header-parser');

const AUTHENTICATION_HEADER_NAME = 'www-authenticate';

const OK_STATUS_CODE = 200;
const UNAUTHORIZED_STATUS_CODE = 401;

const RETRY_STATUS_CODES = [502, 503, 504];
request = request.defaults(
    {
        retryStrategy: (err, response = {}) => {
            return request.RetryStrategies.NetworkError(err, response) ||
                RETRY_STATUS_CODES.includes(response.statusCode);
        },
    });

exports.RegistryModem = class {

    constructor(options) {
        this.registry = options.registry;
        this._promise = options.promise || Promise;
        this.clientId = options.clientId || os.hostname();
        this.ignoreRedirects = options.ignoreRedirects;

        const requestOptions = options.request || {};
        const requestConfig = {};

        this._request = request.defaults(_.assign(requestConfig, _.pick(requestOptions, [
            'timeout',
            'retryStrategy',
            'maxAttempts',
            'retryDelay',
            'promiseFactory',
            'ca',
        ])));

        if (typeof options.credentials === 'function') {
            const credentialsFunction = options.credentials;
            this._getCredentials = () => this._promise.resolve(credentialsFunction());
        } else {
            this._getCredentials = () => this._promise.resolve(options.credentials);
        }

        this._authenticationInfoPromise = undefined;
    }

    handleRedirect(url) {
        return new this._promise((resolve, reject) => {
            request({
                url,
            }, (err, response, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve([response, body]);
                }
            });
        });
    }

    dial(options) {
        const statusCodes = options.statusCodes;
        const requestOptions = {
            method: options.method,
            url: options.path,
            qs: options.parameters,
            headers: options.headers,
            body: options.payload
        };

        console.log('nodegistry request options', JSON.stringify(requestOptions))
        
        return this._promise.resolve()
            .then(() => this.registry.getUrl())
            .then((url) => {
                this._request = this._request.defaults({
                    baseUrl: url,
                });

                console.log('nodegistry request baseUrl', url)
            })
            .then(() => {
                if (options.auth) {
                    console.log('authenticate auth options', JSON.stringify(options.auth))
                    return this._authenticateRequest(
                        options.auth.repository,
                        options.auth.actions,
                    )
                        .then((auth) => {
                            if (auth) {
                                requestOptions.auth = auth;
                            }
                        });
                }
                return this._promise.resolve();
            })
            .then(() => new this._promise((resolve, reject) => {
                if (this.ignoreRedirects) {
                    requestOptions.followAllRedirects = false;
                    requestOptions.followRedirect = false;
                }
                this._request(requestOptions, (err, response, body) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve([response, body]);
                    }
                });
            }))
            .then(([response, body]) => {
                if (response.statusCode === 307) {
                    console.log('handling redirect')
                    return this.handleRedirect(response.headers.location);
                }
                return this._promise.resolve([response, body]);
            })
            .then(([response, body]) => {
                console.log('response', JSON.stringify(response))
                console.log('response body', JSON.stringify(body))

                const currentStatus = statusCodes[response.statusCode];
                if (currentStatus === true) {
                    return options.returnRawResponse ? response : body;
                } else {
                    throw new CFError({
                        statusCode: response.statusCode,
                        message: currentStatus || 'Unknown error',
                        cause: new Error(body),
                        body,
                    });
                }
            });
    }

    _authenticateRequest(repository, actions) {
        return this._promise.all([
            this._retrieveAuthenticationInfo(),
            this._getCredentials(),
        ])
            .then(([authInfo, credentials]) => {
                if (authInfo === undefined) {
                    return undefined;
                }
                if (authInfo.realm === 'basic') {
                    return credentials;
                }
                return new this._promise((resolve, reject) => {
                    const requestOptions = {
                        url: authInfo.realm,
                        qs: {
                            scope: repository ? `repository:${repository}:${actions.join(',')}` : undefined,
                            service: authInfo.service,
                            client_id: this.clientId,
                        },
                        auth: credentials,
                        json: true,
                    }
                    console.log('authenticate request options', JSON.stringify(requestOptions))
                    request(requestOptions, (err, response, body) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve([response, body]);
                        }
                    });
                })
                    .then(([response, body]) => {
                        if (response.statusCode !== OK_STATUS_CODE) {
                            const message = body.details || (body.errors && body.errors.length && body.errors[0].message) || 'Unknown Error';
                            throw new CFError({
                                statusCode: response.statusCode,
                                message: `Failed retrieving token: ${message}`,
                                cause: new Error(body),
                                body,
                            });
                        }

                        const bearer = body.token || body.access_token;
                        return { bearer };
                    });
            });
    }

    _retrieveAuthenticationInfo() {
        if (!this._authenticationInfoPromise) {
            this._authenticationInfoPromise = new this._promise((resolve, reject) => {
                this._request({
                    url: '/',
                    json: true
                }, (err, response, body) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve([response, body]);
                    }
                });
            })
                .then(([response, body]) => {
                    switch (response.statusCode) {
                        case OK_STATUS_CODE:
                            return undefined;
                        case UNAUTHORIZED_STATUS_CODE: {
                            const authHeader = response.headers[AUTHENTICATION_HEADER_NAME];
                            return parseAuthenticationHeader(authHeader);
                        }
                        default:
                            throw new CFError({
                                statusCode: response.statusCode,
                                message: `Unknown status code ${response.statusCode} on ` +
                                    'getting authentication information',
                                cause: new Error(body),
                                body,
                            });
                    }
                });
        }

        return this._authenticationInfoPromise;
    }
};
