describe('Global Collections', function()
{
    it('REQUEST__GLOBAL_*_LOAD');

    this.timeout(TIMER_WAIT);
    before(ensureInitialization);
    beforeEach(function(done) { ensureLogin(done); });
    after(ensureDeinitialization);

    describe(rodan.events.REQUEST__GLOBAL_INPUTPORTTYPE_COLLECTION, function()
    {
        it(rodan.GlobalInputPortTypeCollection.name, function(done)
        {
            var collection = rodan.channel.request(rodan.events.REQUEST__GLOBAL_INPUTPORTTYPE_COLLECTION);
            assert.instanceOf(collection, rodan.GlobalInputPortTypeCollection);
            done();
        });
    });

    describe(rodan.events.REQUEST__GLOBAL_JOB_COLLECTION, function()
    {
        it(rodan.GlobalInputPortTypeCollection.name, function(done)
        {
            var collection = rodan.channel.request(rodan.events.REQUEST__GLOBAL_JOB_COLLECTION);
            assert.instanceOf(collection, rodan.GlobalJobCollection);
            done();
        });
    });

    describe(rodan.events.REQUEST__GLOBAL_OUTPUTPORTTYPE_COLLECTION, function()
    {
        it(rodan.GlobalInputPortTypeCollection.name, function(done)
        {
            var collection = rodan.channel.request(rodan.events.REQUEST__GLOBAL_OUTPUTPORTTYPE_COLLECTION);
            assert.instanceOf(collection, rodan.GlobalOutputPortTypeCollection);
            done();
        });
    });

    describe(rodan.events.REQUEST__GLOBAL_PROJECT_COLLECTION, function()
    {
        it(rodan.GlobalInputPortTypeCollection.name, function(done)
        {
            var collection = rodan.channel.request(rodan.events.REQUEST__GLOBAL_PROJECT_COLLECTION);
            assert.instanceOf(collection, rodan.GlobalProjectCollection);
            done();
        });
    });

    describe(rodan.events.REQUEST__GLOBAL_RESOURCETYPE_COLLECTION, function()
    {
        it(rodan.GlobalInputPortTypeCollection.name, function(done)
        {
            var collection = rodan.channel.request(rodan.events.REQUEST__GLOBAL_RESOURCETYPE_COLLECTION);
            assert.instanceOf(collection, rodan.GlobalResourceTypeCollection);
            done();
        });
    });
});