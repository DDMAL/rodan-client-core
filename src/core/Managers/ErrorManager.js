import Backbone from 'backbone';
import Radio from 'backbone.radio';
import Events from 'lib/Events';

/**
 * General error manager.
 */
export default class ErrorHandler
{
///////////////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Constructor.
     */
    constructor()
    {
        window.onerror = (errorText, url, lineNumber, columnNumber, error) => this._handleJavaScriptError(errorText, url, lineNumber, columnNumber, error);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__SYSTEM_HANDLE_ERROR, (options) => this._handleError(options));
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Handles Javscript error.
     */
    _handleJavaScriptError(errorText, url, lineNumber, columnNumber, error)
    {
        var text = 'Rodan Client has encountered an unexpected error.<br><br>';
        text += 'text: ' + errorText + '<br>';
        text += 'url: ' + url + '<br>';
        text += 'line: ' + lineNumber + '<br>';
        text += 'column: ' + columnNumber;
        this._showError(text, error);
    }

    /**
     * Handle error.
     */
    _handleError(options)
    {
        var response = options.response;
        var responseTextObject = response.responseText !== '' ? JSON.parse(response.responseText) : null;
        if (responseTextObject !== null)
        {
            if (responseTextObject.hasOwnProperty('error_code'))
            {
                var error = options.response.responseJSON
                var text = error.error_code + '<br>';
                text += error.details[0];
                Radio.channel('rodan-client-core').trigger(Events.EVENT__SERVER_ERROR, {json: error});
            }
            else
            {
                var response = options.response;
                var responseTextObject = JSON.parse(response.responseText);
                var message = 'An unknown error occured.';

                // Look for message in options first.
                if (options.hasOwnProperty('message'))
                {
                    message = options.message;
                }

                // Go through the response text.
                for(var property in responseTextObject)
                {
                    if (responseTextObject.hasOwnProperty(property))
                    {
                        message += '\n';
                        message += property + ': ' + responseTextObject[property];
                    }
                }
                this._showError(message, null);
            }
        }
        else
        {
            this._showError(response.statusText, null);
        }
    }

    /**
     * Show error.
     */
    _showError(text, error)
    {
        if (error)
        {
            console.error(error);
        }
        else
        {
            console.warn(text);
        }
    }
}