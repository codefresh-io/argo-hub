'use strict';

const chai = require('chai');

const { buildUrl } = require('./url-builder');

const { expect } = chai;

describe('Url Builder', () => {

    it('should throw error when url and host are defined', () => {
        expect(() => buildUrl({
            url: 'http://registry.io',
            host: 'registry.io'
        })).to.throw('Illegal Arguments: You cannot declare registry url and host together');
    });

    it('should return the right url when every part is defined', () => {
        const url = buildUrl({
            protocol: 'https',
            host: 'reg.io',
            port: 5000,
            version: 'v3'
        });

        expect(url).to.equal('https://reg.io:5000/v3');
    });

    it('should not have a port part in the url when port is missing', () => {
        const url = buildUrl({
            protocol: 'https',
            host: 'reg.io',
            version: 'v4'
        });

        expect(url).to.equal('https://reg.io/v4');
    });

    it('should return the right url when only host defined', () => {
        const url = buildUrl({
            host: 'reg.io'
        });

        expect(url).to.equal('https://reg.io/v2');
    });

    it('should take only first part of domain if domain is composite', () => {
        const url = buildUrl({
            host: 'reg.io/test'
        });

        expect(url).to.equal('https://reg.io/v2');
    });

    it('should return the url when url is defined', () => {
        const url = buildUrl({ url: 'http://r.example.io:342/v1' });

        expect(url).to.equal('http://r.example.io:342/v1');
    });
});
