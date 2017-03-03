describe('Download', function() 
{
    before(ensureInitialization);
    it(rodan.events.REQUEST__DOWNLOAD_START);
    after(ensureDeinitialization);
});