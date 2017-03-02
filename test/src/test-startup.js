// Startup/init test.
describe('#initialize()', function() 
{
    after(rodan.deinitialize);
    it('proper initialization', function(done)
    {
        rodan.channel.on(rodan.events.EVENT__SERVER_ROUTESLOADED, done);
    	rodan.initialize();
    });
});