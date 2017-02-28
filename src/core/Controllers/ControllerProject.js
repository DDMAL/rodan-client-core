import BaseController from './BaseController';
import Project from 'lib/Models/Project';
import Radio from 'backbone.radio';
import Events from 'lib/Shared/Events';
import UserCollection from 'lib/Collections/UserCollection';
import WorkflowRunCollection from 'lib/Collections/WorkflowRunCollection';

/**
 * Controller for Projects.
 */
export default class ControllerProject extends BaseController
{
///////////////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Initialize the instance.
     */
    initialize()
    {
        this._activeProject = null;
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS - initialization
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Initialize Radio.
     */
    _initializeRadio()
    {
        // Events.
        Radio.channel('rodan-client-core').on(Events.EVENT__PROJECT_ADDED_USER_ADMIN, options => this._handleEventProjectAddedUserAdmin(options));
        Radio.channel('rodan-client-core').on(Events.EVENT__PROJECT_ADDED_USER_WORKER, options => this._handleEventProjectAddedUserWorker(options));
        Radio.channel('rodan-client-core').on(Events.EVENT__PROJECT_CREATED, options => this._handleEventProjectGenericResponse(options));
        Radio.channel('rodan-client-core').on(Events.EVENT__PROJECT_DELETED, options => this._handleEventProjectDeleteResponse(options));
        Radio.channel('rodan-client-core').on(Events.EVENT__PROJECT_REMOVED_USER_ADMIN, options => this._handleEventProjectRemovedUser(options));
        Radio.channel('rodan-client-core').on(Events.EVENT__PROJECT_REMOVED_USER_WORKER, options => this._handleEventProjectRemovedUser(options));
        Radio.channel('rodan-client-core').on(Events.EVENT__PROJECT_SAVED, options => this._handleEventProjectGenericResponse(options));

        // Requests.
        Radio.channel('rodan-client-core').reply(Events.REQUEST__PROJECT_ADD_USER_ADMIN, (options) => this._handleRequestProjectAddUserAdmin(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__PROJECT_ADD_USER_WORKER, (options) => this._handleRequestProjectAddUserWorker(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__PROJECT_GET_ACTIVE, () => this._handleRequestProjectActive());
        Radio.channel('rodan-client-core').reply(Events.REQUEST__PROJECT_CREATE, options => this._handleRequestCreateProject(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__PROJECT_SET_ACTIVE, options => this._handleRequestSetActiveProject(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__PROJECT_SAVE, options => this._handleRequestProjectSave(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__PROJECT_DELETE, options => this._handleRequestProjectDelete(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__PROJECT_REMOVE_USER_ADMIN, options => this._handleRequestRemoveUserAdmin(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__PROJECT_REMOVE_USER_WORKER, options => this._handleRequestRemoveUserWorker(options));
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS - Event handlers
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Handle event Project generic response.
     */
    _handleEventProjectGenericResponse()
    {
        Radio.channel('rodan-client-core').request(Events.REQUEST__GLOBAL_PROJECTS_LOAD, {});
    }

    /**
     * Handle event Project delete response.
     */
    _handleEventProjectDeleteResponse()
    {
        Radio.channel('rodan-client-core').request(Events.REQUEST__GLOBAL_PROJECTS_LOAD, {});
    }

    /**
     * Handle request Project save.
     */
    _handleRequestProjectSave(options)
    {
        options.project.save(options.fields, {patch: true, success: (model) => Radio.channel('rodan-client-core').trigger(Events.EVENT__PROJECT_SAVED, {project: model})});
    }

    /**
     * Handle request Project create.
     */
    _handleRequestCreateProject(options)
    {
        var project = new Project({creator: options.user});
        project.save({}, {success: (model) => Radio.channel('rodan-client-core').trigger(Events.EVENT__PROJECT_CREATED, {project: model})});
    }

    /**
     * Handle request Project delete.
     */
    _handleRequestProjectDelete(options)
    {
        this._activeProject = null;
        options.project.destroy({success: (model) => Radio.channel('rodan-client-core').trigger(Events.EVENT__PROJECT_DELETED, {project: model})});
    }

    /**
     * Handle request set active Project.
     */
    _handleRequestSetActiveProject(options)
    {
        this._activeProject = options.project;
    }

    /**
     * Handle request for current active project. Returns null.
     */
    _handleRequestProjectActive()
    {
        return this._activeProject;
    }

    /**
     * Handle project admins get success.
     */
    _handleProjectGetAdminsSuccess(response, collection)
    {
        collection.fetch({data: {username__in: response.join()}});
    }

    /**
     * Handle project workers get success.
     */
    _handleProjectGetWorkersSuccess(response, collection)
    {
        collection.fetch({data: {username__in: response.join()}});
    }

    /**
     * Handle request to remove User as Project admin.
     * We have to use a custom AJAX call since modifying the users of a Project
     * has no endpoint at the moment.
     */
    _handleRequestRemoveUserAdmin(options)
    {
        var admins = options.project.get('admins');
        if (admins.length > 1)
        {
            var userIndex = admins.indexOf(options.user.get('username'));
            if (userIndex >= 0)
            {
                admins.splice(userIndex, 1);
                var usersSendObject = {};
                admins.map(function(value) { usersSendObject[value] = value; return value; });
                var ajaxSettings = {success: (response) => Radio.channel('rodan-client-core').trigger(Events.EVENT__PROJECT_REMOVED_USER_ADMIN, {project: options.project}),
                                    error: (response) => Radio.channel('rodan-client-core').request(Events.REQUEST__SYSTEM_HANDLE_ERROR, {response: response}),
                                    type: 'PUT',
                                    dataType: 'json',
                                    data: usersSendObject,
                                    url: options.project.get('url') + 'admins/'};
                Radio.channel('rodan-client-core').request(Events.REQUEST__SERVER_REQUEST_AJAX, {settings: ajaxSettings});
            }
        }
    }

    /**
     * Handle request to remove User as Project worker.
     * We have to use a custom AJAX call since modifying the users of a Project
     * has no endpoint at the moment.
     */
    _handleRequestRemoveUserWorker(options)
    {
        var users = options.project.get('workers');
        if (users.length > 0)
        {
            var userIndex = users.indexOf(options.user.get('username'));
            if (userIndex >= 0)
            {
                users.splice(userIndex, 1);
                var usersSendObject = {};
                users.map(function(value) { usersSendObject[value] = value; return value; });
                var ajaxSettings = {success: (response) => Radio.channel('rodan-client-core').trigger(Events.EVENT__PROJECT_REMOVED_USER_WORKER, {project: options.project}),
                                    error: (response) => Radio.channel('rodan-client-core').request(Events.REQUEST__SYSTEM_HANDLE_ERROR, {response: response}),
                                    type: 'PUT',
                                    dataType: 'json',
                                    data: usersSendObject,
                                    url: options.project.get('url') + 'workers/'};
                Radio.channel('rodan-client-core').request(Events.REQUEST__SERVER_REQUEST_AJAX, {settings: ajaxSettings});
            }
        }
    }

    /**
     * Handle project removed user.
     */
    _handleEventProjectRemovedUser(options)
    {
        this._activeProject.fetch();
    }

    /**
     * Handle request add admin.
     */
     _handleRequestProjectAddUserAdmin(options)
     {
        var users = options.project.get('admins');
        users.push(options.username);
        var usersSendObject = {};
        users.map(function(value) { usersSendObject[value] = value; return value; });
        var ajaxSettings = {success: (response) => Radio.channel('rodan-client-core').trigger(Events.EVENT__PROJECT_ADDED_USER_ADMIN, {project: options.project}),
                            error: (response) => Radio.channel('rodan-client-core').request(Events.REQUEST__SYSTEM_HANDLE_ERROR, {response: response}),
                            type: 'PUT',
                            dataType: 'json',
                            data: usersSendObject,
                            url: options.project.get('url') + 'admins/'};
        Radio.channel('rodan-client-core').request(Events.REQUEST__SERVER_REQUEST_AJAX, {settings: ajaxSettings});
     }

    /**
     * Handle request add worker.
     */
     _handleRequestProjectAddUserWorker(options)
     {
        var users = options.project.get('workers');
        users.push(options.username);
        var usersSendObject = {};
        users.map(function(value) { usersSendObject[value] = value; return value; });
        var ajaxSettings = {success: (response) => Radio.channel('rodan-client-core').trigger(Events.EVENT__PROJECT_ADDED_USER_WORKER, {project: options.project}),
                            error: (response) => Radio.channel('rodan-client-core').request(Events.REQUEST__SYSTEM_HANDLE_ERROR, {response: response}),
                            type: 'PUT',
                            dataType: 'json',
                            data: usersSendObject,
                            url: options.project.get('url') + 'workers/'};
        Radio.channel('rodan-client-core').request(Events.REQUEST__SERVER_REQUEST_AJAX, {settings: ajaxSettings});
    }

    /**
     * Handle event added admin.
     */
     _handleEventProjectAddedUserAdmin()
     {
        this._activeProject.fetch();
     }

    /**
     * Handle event added worker.
     */
     _handleEventProjectAddedUserWorker()
     {
        this._activeProject.fetch();
     }
}
