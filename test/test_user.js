// Authentication
describe('User', function()
{
    // UserPreference should be cleared if no user logged in.
    describe(rodan.events.REQUEST__USER_PREFERENCE, function() 
    {
        rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_LOGOUT);
        it('UserPreference should be falsy', function(done)
        {
            var userPreference = rodan.channel.request(rodan.events.REQUEST__USER_PREFERENCE);
            assert.isNotOk(userPreference);
            done(); 
        });
    });
});