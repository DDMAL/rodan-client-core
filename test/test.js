// Did we import?
var rodan = rodan_client_core;
console.log(rodan);

// We need to know when all the routes are loaded.
// That means we've connected to the server.
rodan.channel.on(rodan.events.EVENT__SERVER_ROUTESLOADED, function()
{
	rodan.config.DEBUG = true;
	console.log('here');
	rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_LOGIN, {username: 'test', password: 'test'});
});

// Try to start.
rodan.initialize();