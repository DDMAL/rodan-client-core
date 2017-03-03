describe('Server', function()
{
    before(function(done) { ensureInitializationAndLogin(done); });
    after(ensureDeinitialization);

    describe(rodan.events.REQUEST__SERVER_CONFIGURATION, function()
    {
        it(rodan.events.REQUEST__SERVER_CONFIGURATION, function(done)
        {
            var config = rodan.channel.request(rodan.events.REQUEST__SERVER_CONFIGURATION);
            assert.isOk(config.job_packages);
            assert.isOk(config.page_length);
            done();
        });
    });

    describe(rodan.events.REQUEST__SERVER_DATE, function()
    {
        it(rodan.events.REQUEST__SERVER_DATE, function(done)
        {
            var serverDate = rodan.channel.request(rodan.events.REQUEST__SERVER_DATE);
            assert.isOk(serverDate);
            done();
        });
    });

    describe(rodan.events.REQUEST__SERVER_GET_HOSTNAME, function()
    {
        it(rodan.events.REQUEST__SERVER_GET_HOSTNAME, function(done)
        {
            var hostname = rodan.channel.request(rodan.events.REQUEST__SERVER_GET_HOSTNAME);
            assert.equal(hostname, rodan.config.SERVER_HOST);
            done();
        });
    });

    describe(rodan.events.REQUEST__SERVER_GET_ROUTE, function()
    {
        it(rodan.events.REQUEST__SERVER_GET_ROUTE, function(done)
        {
            var route = rodan.channel.request(rodan.events.REQUEST__SERVER_GET_ROUTE, TEST_ROUTE);
            var url = new URL(route);
            assert.equal(url.hostname, rodan.config.SERVER_HOST);
            assert.isOk(url.pathname);
            assert(url.pathname.length > 0);
            done();
        });
    });

    it(rodan.events.REQUEST__SERVER_GET_ROUTE_OPTIONS);

    describe(rodan.events.REQUEST__SERVER_GET_VERSION, function()
    {
        it(rodan.events.REQUEST__SERVER_GET_VERSION, function(done)
        {
            var version = rodan.channel.request(rodan.events.REQUEST__SERVER_GET_VERSION);
            version = version.split('.');
            assert.lengthOf(version, 3);
            done();
        });
    });

    it(rodan.events.REQUEST__SYSTEM_HANDLE_ERROR);

    it(rodan.events.REQUEST__SERVER_LOAD_ROUTES, function(done)
    {
        rodan.channel.once(rodan.events.EVENT__SERVER_ROUTESLOADED, done);
        rodan.channel.request(rodan.events.REQUEST__SERVER_LOAD_ROUTES);
    });
});