// Authentication
describe('Authentication', function()
{
    // Authentication check.
    describe(rodan.events.REQUEST__AUTHENTICATION_CHECK, function() 
    {
        it(rodan.events.EVENT__AUTHENTICATION_LOGINREQUIRED, function(done)
        {
            var triggered = false;

            // Catch Radio event.
            rodan.channel.once(rodan.events.EVENT__AUTHENTICATION_LOGINREQUIRED, function(options)
            { 
                triggered = true;
                assert.isTrue(true); 
                done(); 
            });

            // Set timeout.
            setTimeout(function() 
            {
                if (!triggered)
                {
                    assert.isTrue(triggered);
                    done(); 
                }
            }, TIMER_WAIT);
            rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_CHECK);
        });
    });

    // Failed login.
    describe(rodan.events.REQUEST__AUTHENTICATION_LOGIN, function() 
    {
        it(rodan.events.EVENT__AUTHENTICATION_LOGINREQUIRED, function(done)
        {
            var triggered = false;

            // Catch Radio event.
            rodan.channel.once(rodan.events.EVENT__AUTHENTICATION_LOGINREQUIRED, function(options)
            { 
                triggered = true;
                assert.isTrue(true); 
                done(); 
            });

            // Set timeout.
            setTimeout(function() 
            {
                if (!triggered)
                {
                    assert.isTrue(triggered);
                    done(); 
                }
            }, TIMER_WAIT);
            rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_LOGIN, {username: TEST_USERNAME, password: TEST_PASSWORD + 'garbage'});
        });
    });

    // Success login.
    var testUser = null;
    describe(rodan.events.REQUEST__AUTHENTICATION_LOGIN, function() 
    {
        it(rodan.events.EVENT__AUTHENTICATION_LOGIN_SUCCESS, function(done)
        {
            var triggered = false;

            // Catch Radio event.
            rodan.channel.once(rodan.events.EVENT__AUTHENTICATION_LOGIN_SUCCESS, function(options)
            { 
                triggered = true;
                testUser = options.user;
                assert.isTrue(true);
                done(); 
            });

            // Set timeout.
            setTimeout(function() 
            {
                if (!triggered)
                {
                    assert.isTrue(triggered);
                    done(); 
                }
            }, TIMER_WAIT);
            rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_LOGIN, {username: TEST_USERNAME, password: TEST_PASSWORD});
        });
    }); 

    // Get user.
    describe(rodan.events.REQUEST__AUTHENTICATION_USER, function() 
    {
        it('get User', function(done)
        {
            var user = rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_USER);
            assert.instanceOf(user, rodan.User);
            assert.deepEqual(user, testUser);
            done(); 
        });
    }); 

    // Logout success.
    describe(rodan.events.REQUEST__AUTHENTICATION_LOGOUT, function() 
    {
        it(rodan.events.EVENT__AUTHENTICATION_LOGOUT_SUCCESS, function(done)
        {
            var triggered = false;

            // Catch Radio event.
            rodan.channel.once(rodan.events.EVENT__AUTHENTICATION_LOGOUT_SUCCESS, function(options)
            { 
                triggered = true;
                assert.isTrue(true);
                done(); 
            });

            // Set timeout.
            setTimeout(function() 
            {
                if (!triggered)
                {
                    assert.isTrue(triggered);
                    done(); 
                }
            }, TIMER_WAIT);
            rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_LOGOUT);
        });
    }); 
});