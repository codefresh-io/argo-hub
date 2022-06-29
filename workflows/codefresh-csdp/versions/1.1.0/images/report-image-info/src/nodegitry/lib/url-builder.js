'use strict';

exports.buildUrl = (options) => {

    if (options.url && options.host) {
        throw new Error('Illegal Arguments: You cannot declare registry url and host together');
    }

    if (options.host) {
        const protocol = options.protocol || 'https';
        const version = options.version || 'v2';

        const host = options.host.split('/')[0];

        if (options.port) {
            return `${protocol}://${host}:${options.port}/${version}`;
        } else {
            return `${protocol}://${host}/${version}`;
        }
    } else {
        return options.url;
    }
};
