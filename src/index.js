import Core from 'core/Core';
import Configuration from 'core/Configuration';
import Environment from 'lib/Shared/Environment';
import Radio from 'backbone.radio';
import RODAN_EVENTS from 'lib/Shared/RODAN_EVENTS';

const initialize = function() { Core.initialize(); };
const channel = Radio.channel('rodan-client-core');

export
{
	channel,
	initialize,
	Configuration as config, 
	Environment as env, 
	RODAN_EVENTS as events
};