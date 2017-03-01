// Startup/init test.
describe('Startup (#initialize(), #setInitFunction())', function() 
{
    it('proper initialization', function(done)
    {
        var triggered = false;
        var postInitCalled = false;

        // This is the post-init function.
        var postInit = function()
        {
            assert.isFalse(triggered, 'routes loaded before function sent to setInitFunction() was called'); 
            postInitCalled = true;
        };

        // Catch Radio event.
        rodan.channel.on(rodan.events.EVENT__SERVER_ROUTESLOADED, function(options)
        { 
            assert.isTrue(postInitCalled, 'setInitFunction() has not yet been called'); 
            done(); 
        });

        // Set timeout.
        setTimeout(function() 
        {
            if (!triggered && !postInitCalled)
            {
                assert.isTrue(triggered);
                assert.isTrue(postInitCalled);
                done(); 
            }
        }, TIMER_WAIT);

        // Initialize.
        rodan.setInitFunction(postInit);
    	rodan.initialize();
    });
});