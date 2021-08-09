/* eslint-disable global-require */

/* Legacy Modules */
const path = require('path');


/* Global Folder Aliasing */
require('app-module-path').addPath(path.join(`${__dirname}`, '..'));

/* Utils */
const debugLog = require('../utils/DebugLogger');


/* Common Tests */
require('./common');


/* Module Tests */
describe('::::MODULE TESTS::::\n', () => {
  describe('CORE', () => {
    require('./modules/core.test.js');
  });

  describe('MODELS', () => {
    require('./modules/models.test.js');
  });

  describe('ROUTES', () => {
    require('./modules/routes.test.js');
  });

  describe('SERVICES', () => {
    require('./modules/services.test.js');
  });

  describe('UTILS', () => {
    require('./modules/utils.test.js');
  });

  afterAll(() => {
    debugLog.success('ALL TESTS COMPLETED!', '', 2);
  });
});
