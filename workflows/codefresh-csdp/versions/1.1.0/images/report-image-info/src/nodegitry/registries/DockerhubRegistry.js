'use strict';

const StandardRegistry = require('./StandardRegistry');

class DockerhubRegistry extends StandardRegistry {
    constructor(options) {
        if (!options.request) {
            options.request = {};
        }
        options.request.host = 'index.docker.io';
        super(options);
    }

    async getUrl() {
        return 'https://index.docker.io/v2';
    }

    async getDomain() {
        return 'docker.io';
    }
}

module.exports = DockerhubRegistry;
