'use strict';

const { expect } = require('chai');

const { parseAuthenticationHeader } = require('./auth-header-parser');

describe('Authentication Header Parser', () => {

    it('should parse a regular header', () => {
        const result = parseAuthenticationHeader('Bearer service="registry.io",resource="some/image",actions="pull"');

        expect(result).to.be.deep.equal({
            service: 'registry.io',
            resource: 'some/image',
            actions: 'pull'
        });
    });

    it('should throw error for invalid header', () => {
        const invalidHeader = 'Bearer service="registry.io,resource="some/image",actions="pull"';

        expect(() => parseAuthenticationHeader(invalidHeader)).to.throw;
    });

});

