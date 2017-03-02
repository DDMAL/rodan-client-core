////////////////////////////////////////////////////////////////////////////////
// AUTHENTICATION
////////////////////////////////////////////////////////////////////////////////
describe('Authentication', function()
{
    this.timeout(TIMER_WAIT);

////////////////////////////////////////////////////////////////////////////////
// TEST BLOCKS
////////////////////////////////////////////////////////////////////////////////
    /**
     * Authentication check.
     */
    describe(rodan.events.REQUEST__AUTHENTICATION_CHECK, function() 
    {
        beforeEach(ensureInitialization);
        it(rodan.events.EVENT__AUTHENTICATION_LOGINREQUIRED, function(done)
        {
            rodan.channel.once(rodan.events.EVENT__AUTHENTICATION_LOGINREQUIRED, done);
            rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_CHECK);
        });
        afterEach(ensureDeinitialization);
    });

    /**
     * Failed login.
     */
    describe(rodan.events.REQUEST__AUTHENTICATION_LOGIN, function() 
    {
        beforeEach(ensureInitialization);
        it(rodan.events.EVENT__AUTHENTICATION_LOGINREQUIRED, function(done)
        {
            rodan.channel.once(rodan.events.EVENT__AUTHENTICATION_LOGINREQUIRED, done);
            rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_LOGIN, {username: TEST_USERNAME, password: TEST_PASSWORD + 'garbage'});
        });
        afterEach(ensureDeinitialization);
    });

    /**
     * Success login.
     */
    describe(rodan.events.REQUEST__AUTHENTICATION_LOGIN, function() 
    {
        beforeEach(ensureInitialization);
        it(rodan.events.EVENT__AUTHENTICATION_LOGIN_SUCCESS, function(done)
        {
            rodan.channel.once(rodan.events.EVENT__AUTHENTICATION_LOGIN_SUCCESS, function(options)
            { 
                assert.instanceOf(options.user, rodan.User);
                done(); 
            });
            rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_LOGIN, {username: TEST_USERNAME, password: TEST_PASSWORD});
        });
        afterEach(ensureDeinitialization);
    });

    /**
     * Success logout.
     */
    describe(rodan.events.REQUEST__AUTHENTICATION_LOGOUT, function() 
    {
        before(function(done) { ensureInitialization(done); });
        beforeEach(function(done) { ensureLogin(done); });
        it(rodan.events.EVENT__AUTHENTICATION_LOGOUT_SUCCESS, function(done)
        {
            rodan.channel.once(rodan.events.EVENT__AUTHENTICATION_LOGOUT_SUCCESS, done);
            rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_LOGOUT);
        });
        afterEach(ensureDeinitialization);
    });

    /**
     * Get authenticated user.
     */
    describe(rodan.events.REQUEST__AUTHENTICATION_USER, function() 
    {
        before(function(done) { ensureInitialization(done); });
        beforeEach(function(done) { ensureLogin(done); });
        it(rodan.events.REQUEST__AUTHENTICATION_USER, function(done)
        {
            var user = rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_USER);
            assert.instanceOf(user, rodan.User);
            done(); 
        });
        afterEach(ensureDeinitialization);
    });
});