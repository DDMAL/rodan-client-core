import BaseController from './BaseController';
import Radio from 'backbone.radio';
import Resource from 'lib/Models/Resource';
import ResourceCollection from 'lib/Collections/ResourceCollection';
import Events from 'lib/Events';

/**
 * Controller for Resources.
 */
export default class ControllerResource extends BaseController
{
///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Initialize Radio.
     */
    _initializeRadio()
    {
        // Requests
        Radio.channel('rodan-client-core').reply(Events.REQUEST__RESOURCE_CREATE, options => this._handleRequestResourceCreate(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__RESOURCE_DELETE, options => this._handleCommandResourceDelete(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__RESOURCE_DOWNLOAD, options => this._handleRequestResourceDownload(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__RESOURCE_SAVE, options => this._handleCommandResourceSave(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__RESOURCE_VIEWER_ACQUIRE, options => this._handleRequestViewer(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__RESOURCES_LOAD, options => this._handleRequestResources(options));
    }

    /**
     * Handle command add Resource.
     */
    _handleRequestResourceCreate(options)
    {
        var resource = null;
        if (options.resourcetype)
        {
            resource = new Resource({project: options.project.get('url'), file: options.file, resource_type: options.resourcetype});
        }
        else
        {
            resource = new Resource({project: options.project.get('url'), file: options.file});
        }
        var jqXHR = resource.save({}, {success: (model) => this._handleCreateSuccess(model, this._collection)});
        Radio.channel('rodan-client-core').request(Events.REQUEST__TRANSFERMANAGER_MONITOR_UPLOAD, {request: jqXHR, file: options.file});
    }

    /**
     * Handle command delete Resource.
     */
    _handleCommandResourceDelete(options)
    {
        options.resource.destroy({success: (model) => this._handleDeleteSuccess(model, this._collection)});
    }

    /**
     * Handle command download Resource.
     */
    _handleRequestResourceDownload(options)
    {
        var mimetype = options.resource.get('resource_type_full').mimetype;
        var ext = options.resource.get('resource_type_full').extension;
        var filename = options.resource.get('name') + '.' + ext;
        Radio.channel('rodan-client-core').request(Events.REQUEST__TRANSFERMANAGER_DOWNLOAD, {url: options.resource.get('download'), filename: filename, mimetype: mimetype});
    }

    /**
     * Handle command save Resource.
     */
    _handleCommandResourceSave(options)
    {
        options.resource.save(options.fields, {patch: true, success: (model) => Radio.channel('rodan-client-core').trigger(Events.EVENT__RESOURCE_SAVED, {resource: model})});
    }

    /**
     * Handle request Resources.
     */
    _handleRequestResources(options)
    {
        this._collection = new ResourceCollection();
        this._collection.fetch(options);
        return this._collection;
    }

    /**
     * Handle request for Resource viewer.
     */
    _handleRequestViewer(options)
    {
        var ajaxOptions = {
            url: options.resource.get('url') + 'acquire/',
            type: 'POST',
            dataType: 'json',
            success: (response) => this._handleSuccessAcquire(response)
        };
        $.ajax(ajaxOptions);
    }

    /**
     * Handle acquire success.
     */
    _handleSuccessAcquire(response)
    {
        window.open(response.working_url, '', '_blank');
    }

    /**
     * Handle create success.
     */
    _handleCreateSuccess(resource, collection)
    {
        collection.add(resource);
        Radio.channel('rodan-client-core').trigger(Events.EVENT__RESOURCE_CREATED, {resource: resource});
    }

    /**
     * Handle delete success.
     */
    _handleDeleteSuccess(model, collection)
    {
        collection.remove(model);
        Radio.channel('rodan-client-core').trigger(Events.EVENT__RESOURCE_DELETED, {resource: model});
    }

    /**
     * Handle generic success.
     */
    _handleSuccessGeneric(options)
    {
        Radio.channel('rodan-client-core').request(Events.REQUEST__MODAL_HIDE);
    }
}