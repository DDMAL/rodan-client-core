const rodan = rodan_client_core.default;
const assert = chai.assert;

// Setup config.
rodan.config.DEBUG = true;
rodan.config.SERVER_HOST = 'api.dev.rodan.simssa.ca';
const TIMER_WAIT = 4000;
const TEST_USERNAME = 'test';
const TEST_PASSWORD = 'test';
const TEST_ROUTE = 'auth-me'

////////////////////////////////////////////////////////////////////////////////
// UTILITY HOOKS
////////////////////////////////////////////////////////////////////////////////
/**
 * Ensure initialization has occured.
 */
function ensureInitialization(done)
{
    rodan.channel.once(rodan.events.EVENT__SERVER_ROUTESLOADED, done);
    rodan.initialize();
}

/**
 * Ensure deinitialization has occured.
 */
function ensureDeinitialization(done)
{
    rodan.deinitialize();
    done();
}

/**
 * Ensures login with TEST_USERNAME/TEST_PASSWORD.
 */
function ensureLogin(done)
{
    rodan.channel.once(rodan.events.EVENT__AUTHENTICATION_LOGIN_SUCCESS, function(options)
    {
    	assert.instanceOf(options.user, rodan.User);
    	done();
    });
    rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_LOGIN, {username: TEST_USERNAME, password: TEST_PASSWORD});
}

/**
 * Ensures logout.
 */
function ensureLogout(done)
{
    rodan.channel.once(rodan.events.EVENT__AUTHENTICATION_LOGOUT_SUCCESS, done);
    rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_LOGOUT);
}

/**
 * Ensure init and login.
 */
function ensureInitializationAndLogin(done)
{
    ensureInitialization(function() { ensureLogin(done); });
}

////////////////////////////////////////////////////////////////////////////////
// UTILITY METHODS
////////////////////////////////////////////////////////////////////////////////
/**
 * Generate random ID.
 */
function createRandomId()
{
    return Math.floor(Math.random() * 100000);
}