'use strict';

const StandardRegistry = require('./StandardRegistry');
const DockerhubRegistry = require('./DockerhubRegistry');
const EcrRegistry = require('./EcrRegistry');
const GcrRegistry = require('./GcrRegistry');
const AcrRegistry = require('./AcrRegistry');

module.exports = {
    StandardRegistry,
    DockerhubRegistry,
    EcrRegistry,
    GcrRegistry,
    AcrRegistry,
};
