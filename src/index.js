import Core from 'core/Core';
import Configuration from 'core/Configuration';
import Environment from 'lib/Shared/Environment';
import * as collections from 'lib/Collections/';
import * as models from 'lib/Models/';
import Radio from 'backbone.radio';
import RODAN_EVENTS from 'lib/Shared/RODAN_EVENTS';

const initialize = function() { Core.initialize(); };
const channel = Radio.channel('rodan-client-core');
const setInitFunction = function(func) { Core.setPostInitializeFunction(func); };

export
{
	channel,
	collections,
	Configuration as config, 
	Environment as env, 
	initialize,
	models,
	RODAN_EVENTS as events,
	setInitFunction
};