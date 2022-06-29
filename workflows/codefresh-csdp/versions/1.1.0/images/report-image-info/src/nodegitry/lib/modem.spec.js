'use strict';

const nock = require('nock');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

const { RegistryModem } = require('./Modem');

chai.use(sinonChai);
chai.use(chaiAsPromised);
const { expect } = chai;

const CREDENTIALS = {
    user: 'username',
    pass: 'password'
};

describe('Registry Modem -', () => {

    let modem;
    let getUrlStub;

    before(() => {
        nock.disableNetConnect();
    });

    beforeEach(() => {
        getUrlStub = sinon.stub().resolves('http://registry.io:5000/v2/');
        modem = new RegistryModem({
            registry: {
                getUrl: getUrlStub,
            },
            promise: Promise,
            clientId: 'some-client-id',
            credentials: {
                username: CREDENTIALS.user,
                password: CREDENTIALS.pass
            }
        });
    });

    afterEach(() => {
        nock.cleanAll();
    });

    after(() => {
        nock.enableNetConnect();
    });

    describe('Token retrieval', () => {

        function authInfoNock() {
            nock('http://registry.io:5000')
                .get('/v2/')
                .reply(401, {}, {
                    'www-authenticate': 'Bearer realm="http://auth.io",service="reg.me"'
                });
        }

        function authBasicInfoNock() {
            nock('http://registry.io:5000')
                .get('/v2/')
                .reply(401, {}, {
                    'www-authenticate': 'Basic realm="no matter what"'
                });
        }

        function authTokenNock() {
            nock('http://auth.io')
                .get('/')
                .query({
                    service: 'reg.me',
                    scope: 'repository:image/repo:push',
                    client_id: 'some-client-id'
                })
                .basicAuth(CREDENTIALS)
                .reply(200, { token: 'the-token' });

        }

        function basicNocks() {
            authInfoNock();
            authTokenNock();
        }

        beforeEach(async () => {
            modem._request = modem._request.defaults({
                baseUrl: await modem.registry.getUrl(),
            });
        });

        it('should retrieve auth token', () => {
            basicNocks();

            const token = modem._authenticateRequest('image/repo', ['push']);

            return expect(token).to.eventually.become({ bearer: 'the-token' });
        });

        it('should use basic auth when www-authenticate realm is basic', () => {
            authBasicInfoNock();

            const token = modem._authenticateRequest('image/repo', ['push']);

            return expect(token).to.eventually.become({
                username: CREDENTIALS.user,
                password: CREDENTIALS.pass,
            });
        });

        it('should return empty object when registry has no authentication', () => {
            nock('http://registry.io:5000')
                .get('/v2/')
                .reply(200, {});

            const token = modem._authenticateRequest('image/repo', ['push']);

            return expect(token).to.eventually.become(undefined);
        });

        it('should retrieve auth token when two actions are present', () => {
            authInfoNock();

            nock('http://auth.io')
                .get('/')
                .query({
                    service: 'reg.me',
                    scope: 'repository:image/repo:push,pull',
                    client_id: 'some-client-id'
                })
                .basicAuth(CREDENTIALS)
                .reply(200, { token: 'double-token' });

            const token = modem._authenticateRequest('image/repo', ['push', 'pull']);

            return expect(token).to.eventually.become({ bearer: 'double-token' });
        });

        it('should throw an error when credentials are wrong (docker-hub error format)', () => {
            authInfoNock();

            nock('http://auth.io')
                .get('/')
                .query(true)
                .basicAuth(CREDENTIALS)
                .reply(401, { details: 'An error message about wrong credentials' });

            const token = modem._authenticateRequest('image/repo', ['pull']);

            return expect(token).to.be.rejectedWith('Failed retrieving token: An error message about wrong credentials');
        });

        it('should throw an error when credentials are wrong (gcr error format)', () => {
            authInfoNock();

            nock('http://auth.io')
                .get('/')
                .query(true)
                .basicAuth(CREDENTIALS)
                .reply(401, {
                    errors: [{
                        code: 'UNAUTHORIZED',
                        message: 'An error message about wrong credentials'
                    }]
                });

            const token = modem._authenticateRequest('image/repo', ['pull']);

            return expect(token).to.be.rejectedWith('Failed retrieving token: An error message about wrong credentials');
        });
    });

    describe('Dialing', () => {

        beforeEach(() => {
            sinon.stub(modem, '_authenticateRequest');
        });

        it('should return the registry reply', async () => {
            modem._authenticateRequest
                .withArgs('image-repo', ['push'])
                .resolves({ bearer: 'auth-token' });

            nock('http://registry.io:5000')
                .post('/v2/some/image/post', 'payload string')
                .query({
                    param1: 'value1',
                    param2: 'value-2'
                })
                .matchHeader('x-header', 'Header Content')
                .matchHeader('authorization', 'Bearer auth-token')
                .reply(200, 'this is mocked reply');

            const result = modem.dial({
                method: 'POST',
                path: '/some/image/post',
                auth: {
                    repository: 'image-repo',
                    actions: ['push']
                },
                parameters: {
                    param1: 'value1',
                    param2: 'value-2'
                },
                headers: {
                    'X-Header': 'Header Content'
                },
                payload: 'payload string',
                statusCodes: {
                    200: true
                }
            });

            await expect(result).to.eventually.become('this is mocked reply');
            expect(getUrlStub).to.have.been.called;
        });

        it('should return the registry reply when no authentication needed', async () => {
            modem._authenticateRequest
                .withArgs('image-repo', ['push'])
                .resolves({ bearer: 'auth-token' });

            nock('http://registry.io:5000')
                .get('/v2/some/image/no/auth')
                .query({
                    param1: 'value1',
                    param2: 'value-2'
                })
                .matchHeader('x-header', 'Header Content')
                .reply(200, 'this is mocked reply');

            const result = modem.dial({
                method: 'GET',
                path: '/some/image/no/auth',
                parameters: {
                    param1: 'value1',
                    param2: 'value-2'
                },
                headers: {
                    'X-Header': 'Header Content'
                },
                statusCodes: {
                    200: true
                }
            });

            await expect(result).to.eventually.become('this is mocked reply');
            expect(getUrlStub).to.have.been.called;
        });

        it('should throw error on expected error code', async () => {
            modem._authenticateRequest
                .withArgs('image-repo', ['push'])
                .resolves({ bearer: 'auth-token' });

            nock('http://registry.io:5000')
                .get('/v2/some/image/expected/error')
                .query({
                    param1: 'value1',
                    param2: 'value-2'
                })
                .matchHeader('x-header', 'Header Content')
                .matchHeader('authorization', 'Bearer auth-token')
                .reply(500, 'some errors');

            const result = modem.dial({
                method: 'GET',
                path: '/some/image/expected/error',
                auth: {
                    repository: 'image-repo',
                    actions: ['push']
                },
                parameters: {
                    param1: 'value1',
                    param2: 'value-2'
                },
                headers: {
                    'X-Header': 'Header Content'
                },
                statusCodes: {
                    200: true,
                    500: 'this is an error'
                }
            });

            await expect(result).to.be.rejectedWith('this is an error');
            expect(getUrlStub).to.have.been.called;
        });

        it('should throw unknown error on unexpected error code', async () => {
            modem._authenticateRequest
                .withArgs('image-repo', ['push'])
                .resolves({ bearer: 'auth-token' });

            nock('http://registry.io:5000')
                .get('/v2/some/image/unexpected/error')
                .query({
                    param1: 'value1',
                    param2: 'value-2'
                })
                .matchHeader('x-header', 'Header Content')
                .matchHeader('authorization', 'Bearer auth-token')
                .reply(400, 'some errors');

            const result = modem.dial({
                method: 'GET',
                path: '/some/image/unexpected/error',
                auth: {
                    repository: 'image-repo',
                    actions: ['push']
                },
                parameters: {
                    param1: 'value1',
                    param2: 'value-2'
                },
                headers: {
                    'X-Header': 'Header Content'
                },
                statusCodes: {
                    200: true,
                    500: 'this is an error'
                }
            });

            await expect(result).to.be.rejectedWith('Unknown error');
            expect(getUrlStub).to.have.been.called;
        });
    });
});

