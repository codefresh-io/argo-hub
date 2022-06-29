'use strict';

const _ = require('lodash');
const Url = require('url');

const { Client } = require('../lib/Client');
const { parseFamiliarName } = require('@codefresh-io/docker-reference');
const { buildUrl } = require('../lib/url-builder');

class StandardRegistry {
    constructor(options) {
        this.credentials = options.credentials || {
            username: options.username,
            password: options.password,
        };
        this.domain = options.domain;
        this.requestOptions = options.request;
        this.api = new Client(_.assign({}, options, {
            registry: this,
            credentials: () => this.getCredentials(),
            ignoreRedirects: options.ignoreRedirects,
        }));
    }

    getUrl() {
        return buildUrl(this.requestOptions);
    }

    getDomain() {
        if (!this.domain) {
            const url = this.getUrl();
            this.domain = Url.parse(url).host;
        }

        return this.domain;
    }

    ping() {
        return this.api.ping();
    }

    repository(repository) {
        return {
            getManifest: reference => this.api.getManifest(repository, reference),
            // eslint-disable-next-line max-len
            putManifest: (reference, manifest) => this.api.putManifest(repository, reference, manifest),
            deleteManifest: reference => this.api.deleteManifest(repository, reference),
            getConfig: manifest => this.api.getConfig(repository, manifest),
        };
    }

    repoDigest(repoDigest) {
        const { repository, digest } = parseFamiliarName(repoDigest);
        return {
            getManifest: () => this.api.getManifest(repository, digest),
            putManifest: manifest => this.api.putManifest(repository, digest, manifest),
            deleteManifest: () => this.api.deleteManifest(repository, digest),
            getConfig: manifest => this.api.getConfig(repository, manifest),
        };
    }

    repoTag(repoTag) {
        const { repository, tag } = parseFamiliarName(repoTag);
        return {
            getManifest: () => this.api.getManifest(repository, tag),
            putManifest: manifest => this.api.putManifest(repository, tag, manifest),
            deleteManifest: () => this.api.deleteManifest(repository, tag),
            getConfig: manifest => this.api.getConfig(repository, manifest),
        };
    }

    reference(reference) {
        const { repository, tag, digest } = parseFamiliarName(reference);
        return {
            getManifest: () => this.api.getManifest(repository, tag || digest),
            putManifest: manifest => this.api.putManifest(repository, tag || digest, manifest),
            deleteManifest: () => this.api.deleteManifest(repository, tag || digest),
            getConfig: manifest => this.api.getConfig(repository, manifest),
        };
    }

    getCredentials() {
        return this.credentials;
    }
}

module.exports = StandardRegistry;
