const rodan = rodan_client_core.default;
const assert = chai.assert;

// Setup config.
rodan.config.DEBUG = false;
rodan.config.SERVER_HOST = 'api.dev.rodan.simssa.ca';
const TIMER_WAIT = 3000;
const TEST_USERNAME = 'test';
const TEST_PASSWORD = 'test';