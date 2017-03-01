// Did we import?
var rodan = rodan_client_core.default;
console.log(rodan);

// Load a config file.
rodan.config.SERVER_HOST = 'api.dev.rodan.simssa.ca';
rodan.config.DEBUG = true;
rodan.initialize();

// We need to know when all the routes are loaded.
// That means we've connected to the server.
rodan.channel.on(rodan.events.EVENT__SERVER_ROUTESLOADED, function()
{
	rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_LOGIN, {username: 'test', password: 'test'});

	// Test projects...
	//

	
});