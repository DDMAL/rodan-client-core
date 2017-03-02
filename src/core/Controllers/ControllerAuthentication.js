import BaseController from './BaseController';
import Configuration from 'core/Configuration';
import Events from 'lib/Events';
import Radio from 'backbone.radio';
import User from 'lib/Models/User';

/**
 * Controls authentication.
 */
export default class ControllerAuthentication extends BaseController
{
///////////////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Initializes the instance.
     */
    initialize()
    {
        this._token = null;
        this._user = null;
    }

    /**
     * AJAX prefilter associated with authentication.
     *
     * This will make sure that the appropriate request headers for authentication are set on all AJAX requests to the server.
     *
     * @param {object} options object.beforeSend (optional) is a function that takes in the XmlHTTPRequest before sending; this may be useful for doing pre-processing of AJAX requests
     */
    ajaxPrefilter(options)
    {
        var that = this;
        var oldOnBeforeSend = options.beforeSend;
        options.beforeSend = function (xhr)
        {
            if (oldOnBeforeSend)
            {
                oldOnBeforeSend(xhr);
            }
            xhr.setRequestHeader('Authorization', 'Token ' + that._token);
        };
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Initialize radio.
     */
    _initializeRadio()
    {
        Radio.channel('rodan-client-core').reply(Events.REQUEST__USER_CHANGE_PASSWORD, (options) => this._handleRequestChangePassword(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__USER_SAVE, (options) => this._handleRequestSaveUser(options));

        Radio.channel('rodan-client-core').reply(Events.REQUEST__AUTHENTICATION_USER, () => this._handleRequestUser());
        Radio.channel('rodan-client-core').reply(Events.REQUEST__AUTHENTICATION_LOGIN, options => this._login(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__AUTHENTICATION_CHECK, () => this._checkAuthenticationStatus());
        Radio.channel('rodan-client-core').reply(Events.REQUEST__AUTHENTICATION_LOGOUT, () => this._logout());
    }

    /**
     * Handle authentication response.
     */
    _handleAuthenticationResponse(event)
    {
        var request = event.currentTarget;
        switch (request.status)
        {
            case 200:
                var parsed = JSON.parse(request.responseText);
                this._user = new User(parsed);
                this._processAuthenticationData();
                Radio.channel('rodan-client-core').trigger(Events.EVENT__AUTHENTICATION_LOGIN_SUCCESS, {user: this._user});
                break;
            case 400:
                Radio.channel('rodan-client-core').request(Events.REQUEST__SYSTEM_HANDLE_ERROR, {response: request});
                Radio.channel('rodan-client-core').trigger(Events.EVENT__AUTHENTICATION_LOGINREQUIRED);
                break;
            case 401:
                Radio.channel('rodan-client-core').request(Events.REQUEST__SYSTEM_HANDLE_ERROR, {response: request,
                                                                           message: 'Incorrect username/password.'});
                Radio.channel('rodan-client-core').trigger(Events.EVENT__AUTHENTICATION_LOGINREQUIRED);
                break;
            case 403:
                Radio.channel('rodan-client-core').request(Events.REQUEST__SYSTEM_HANDLE_ERROR, {response: request});
                Radio.channel('rodan-client-core').trigger(Events.EVENT__AUTHENTICATION_LOGINREQUIRED);
                break;
            default:
                Radio.channel('rodan-client-core').request(Events.REQUEST__SYSTEM_HANDLE_ERROR, {response: request});
                break;
        }
    }

    /**
     * Handle deauthentication response.
     */
    _handleDeauthenticationResponse(event)
    {
        var request = event.currentTarget;
        switch (request.status)
        {
            case 200:
                Radio.channel('rodan-client-core').trigger(Events.EVENT__AUTHENTICATION_LOGOUT_SUCCESS);
                break;
            case 400:
                Radio.channel('rodan-client-core').request(Events.REQUEST__SYSTEM_HANDLE_ERROR, {response: request});
                break;
            case 401:
                Radio.channel('rodan-client-core').request(Events.REQUEST__SYSTEM_HANDLE_ERROR, {response: request});
                break;
            case 403:
                Radio.channel('rodan-client-core').request(Events.REQUEST__SYSTEM_HANDLE_ERROR, {response: request});
                break;
            default:
                Radio.channel('rodan-client-core').request(Events.REQUEST__SYSTEM_HANDLE_ERROR, {response: request});
                break;
        }
    }

    /**
     * Handle timeout.
     */
    _handleTimeout(event)
    {
        Radio.channel('rodan-client-core').trigger(Events.EVENT__SERVER_WENTAWAY, {event: event});
    }

    /**
     * Sends request to check authentication.
     */
    _checkAuthenticationStatus()
    {
        // First, check if we have the appropriate authentication data. If we do, check it.
        // If we don't, trigger an event to inform of login require.
        if (!this._token || this._token === '')
        {
            Radio.channel('rodan-client-core').trigger(Events.EVENT__AUTHENTICATION_LOGINREQUIRED);
        }
        else
        {
            var authRoute = Radio.channel('rodan-client-core').request(Events.REQUEST__SERVER_GET_ROUTE, 'auth-me');
            var request = new XMLHttpRequest();
            request.onload = (event) => this._handleAuthenticationResponse(event);
            request.ontimeout = (event) => this._handleTimeout(event);
            request.open('GET', authRoute, true);
            request.setRequestHeader('Accept', 'application/json');
            this._setAuthenticationData(request);
            request.send();
        }
    }

    /**
     * Login.
     */
    _login(options)
    {
        var authRoute = this._getAuthenticationRoute();
        var request = new XMLHttpRequest();
        request.onload = (event) => this._handleAuthenticationResponse(event);
        request.ontimeout = (event) => this._handleTimeout(event);
        request.open('POST', authRoute, true);
        request.setRequestHeader('Accept', 'application/json');
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.send('username=' + options.username + '&password=' + options.password);
    }

    /**
     * Logout.
     */
    _logout()
    {
        var authRoute = Radio.channel('rodan-client-core').request(Events.REQUEST__SERVER_GET_ROUTE, 'auth-reset-token');
        var request = new XMLHttpRequest();
        request.onload = (event) => this._handleDeauthenticationResponse(event);
        request.ontimeout = (event) => this._handleTimeout(event);
        request.open('POST', authRoute, true);
        request.setRequestHeader('Accept', 'application/json');
        this._setAuthenticationData(request);
        request.send();
        this._user = null;
    }

    /**
     * Sets the appropriate authentication data to the request.
     */
    _setAuthenticationData(request)
    {
        request.setRequestHeader('Authorization', 'Token ' + this._token); 
    }

    /** 
     * Save authentication data.
     */
    _processAuthenticationData()
    {
        if (this._user.has('token'))
        {
            this._token = this._user.get('token');
        }
    }

    /**
     * Send out active user.
     */
    _handleRequestUser()
    {
        return this._user;
    }

    /**
     * Returns authentication route.
     */
    _getAuthenticationRoute()
    {
        return Radio.channel('rodan-client-core').request(Events.REQUEST__SERVER_GET_ROUTE, 'auth-token');
    }

    /**
     * Handle request save User.
     */
    _handleRequestSaveUser(options)
    {
        var route = Radio.channel('rodan-client-core').request(Events.REQUEST__SERVER_GET_ROUTE, 'auth-me');
        var ajaxSettings = {success: (response) => this._handleSaveUserSuccess(response),
                            error: (response) => Radio.channel('rodan-client-core').request(Events.REQUEST__SYSTEM_HANDLE_ERROR, {response: response}),
                            type: 'PATCH',
                            url: route,
                            dataType: 'json',
                            data: options.fields};
        Radio.channel('rodan-client-core').request(Events.REQUEST__SERVER_REQUEST_AJAX, {settings: ajaxSettings});
    }

    /**
     * Handle request change password.
     */
    _handleRequestChangePassword(options)
    {
        var route = Radio.channel('rodan-client-core').request(Events.REQUEST__SERVER_GET_ROUTE, 'auth-change-password');
        var ajaxSettings = {success: (response) => this._handleChangePasswordSuccess(response),
                        //    error: (response) => Radio.channel('rodan-client-core').request(Events.REQUEST__SYSTEM_HANDLE_ERROR, {response: response}),
                            type: 'POST',
                            url: route,
                         //   dataType: 'json',
                            data: {new_password: options.newpassword, current_password: options.currentpassword}};
        Radio.channel('rodan-client-core').request(Events.REQUEST__SERVER_REQUEST_AJAX, {settings: ajaxSettings});
    }

    /**
     * Handle response from saving user.
     */
    _handleSaveUserSuccess(response)
    {
        this._user = new User(response);
        Radio.channel('rodan-client-core').trigger(Events.EVENT__USER_SAVED, {user: this._user});
    }

    /**
     * Handle success response from changing password.
     */
    _handleChangePasswordSuccess(response)
    {
        Radio.channel('rodan-client-core').trigger(Events.EVENT__USER_CHANGED_PASSWORD);
    }
}