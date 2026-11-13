'use strict';

/** CommonJS bridge: call load() and await the ESM-only VoIP implementation. */
const load = () => import('../VoIP/index.js');
module.exports = { load, loadVoipV1: load };
