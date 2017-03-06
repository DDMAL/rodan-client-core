describe('Configuration', function() 
{
    before(ensureInitialization);
    describe('#load()', function() 
    {
	    it(rodan.events.EVENT__CONFIGURATION_LOADED);
    });
    after(ensureDeinitialization);
});