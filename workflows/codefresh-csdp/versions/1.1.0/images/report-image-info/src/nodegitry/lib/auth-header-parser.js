'use strict';

const BASIC_AUTHENTICATION_HEADER_PREFIX = 'Basic ';
const AUTHENTICATION_HEADER_PREFIX = 'Bearer ';
const AUTHENTICATION_HEADER_REGEX = /^Bearer (?:,?(?:[a-zA-Z]*)="(?:[^"]*)")+$/;
const AUTHENTICATION_HEADER_REGEX_ALTERNATIVE = /^Bearer (?:,?(?:[a-zA-Z]*)=(?:(?:"[^"]*")|(?:(?:[^,]+):\w+,?(?:,\w+)*)))+$/;

exports.parseAuthenticationHeader = (header) => {
    if (header.startsWith(BASIC_AUTHENTICATION_HEADER_PREFIX)) {
        return { realm: 'basic' };
    }
    if (!header.startsWith(AUTHENTICATION_HEADER_PREFIX)) {
        throw new Error(`Authentication string must start with "${AUTHENTICATION_HEADER_PREFIX.trim()}"`);
    }

    const result = {};
    let regex;
    if (AUTHENTICATION_HEADER_REGEX.test(header)) {
        regex = /([a-z]*)="([^"]*)"(?:,|$)/ig;
        regex.lastIndex = AUTHENTICATION_HEADER_PREFIX.length;
        for (let regexResult = regex.exec(header); regexResult; regexResult = regex.exec(header)) {
            result[regexResult[1]] = regexResult[2];
        }
    } else if (AUTHENTICATION_HEADER_REGEX_ALTERNATIVE.test(header)) {
        regex = /([a-z]*)=((?:"[^"]*")|(?:(?:[^,]+):\w+,?(?:,\w+)*))(?:,|$)/ig;
        regex.lastIndex = AUTHENTICATION_HEADER_PREFIX.length;
        for (let regexResult = regex.exec(header); regexResult; regexResult = regex.exec(header)) {
            result[regexResult[1]] = (regexResult[2] || '').replace(/"/g, '');
        }
    } else {
        throw new Error('Authentication string is invalid');
    }

    return result;
};
