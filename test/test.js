// Did we import?
var rodan = rodan_client_core;
console.log(rodan);

// Load a config file.
rodan.config.load('configuration.json', () => rodan.initialize());

// We need to know when all the routes are loaded.
// That means we've connected to the server.
rodan.channel.on(rodan.events.EVENT__SERVER_ROUTESLOADED, function()
{
	rodan.config.DEBUG = true;
	rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_LOGIN, {username: 'test', password: 'test'});

	// Test projects...
	//

	
});