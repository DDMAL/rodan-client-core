import BaseController from './BaseController';
import Radio from 'backbone.radio';
import Events from 'lib/Shared/Events';
import Workflow from 'lib/Models/Workflow';
import WorkflowCollection from 'lib/Collections/WorkflowCollection';

/**
 * Controller for Workflows.
 */
export default class ControllerWorkflow extends BaseController
{
///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS - Initialization
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Initialize Radio.
     */
    _initializeRadio()
    {
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOW_SAVE, options => this._handleRequestSaveWorkflow(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOW_DELETE, options => this._handleCommandDeleteWorkflow(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOW_IMPORT, options => this._handleCommandImportWorkflow(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOW_CREATE, options => this._handleCommandAddWorkflow(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOW_EXPORT, options => this._handleCommandExportWorkflow(options));
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS - Radio handlers
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Handle command delete workflow.
     */
    _handleCommandDeleteWorkflow(options)
    {
        options.workflow.destroy({success: (model) => this._handleDeleteSuccess(model, this._collection)});
    }

    /**
     * Handle command add workflow.
     */
    _handleCommandAddWorkflow(options)
    {
        var workflow = new Workflow({project: options.project.get('url'), name: 'untitled'});
        workflow.save({}, {success: (model) => this._handleCreateSuccess(model, this._collection)});
    }

    /**
     * Handle save workflow.
     */
    _handleRequestSaveWorkflow(options)
    {
        options.workflow.save(options.fields, {patch: true, success: (model) => Radio.channel('rodan-client-core').trigger(Events.EVENT__WORKFLOW_SAVED, {workflow: model})});
    }

    /**
     * Handle export workflow.
     */
    _handleCommandExportWorkflow(options)
    {
        options.workflow.sync('read', options.workflow, {data: {export: true}, success: (result) => this._handleExportSuccess(result, options.workflow)});
    }

    /**
     * Handle import workflow.
     */
    _handleCommandImportWorkflow(options)
    {
        var fileReader = new FileReader();
        fileReader.onerror = (event) => this._handleFileReaderError(event);
        fileReader.onload = (event) => this._handleFileReaderLoaded(event, options.project);
        fileReader.readAsText(options.file);
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS - FileReader handlers
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Handle FileReader error.
     */
    _handleFileReaderError(event)
    {
        // TODO error
        console.error(event);
    }

    /**
     * Handle FileReader loaded.
     */
    _handleFileReaderLoaded(event, project)
    {
        var workflow = new Workflow({project: project.get('url'), serialized: JSON.parse(event.target.result)});
        workflow.save({}, {success: (model) => this._handleImportSuccess(model, this._collection)});
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS - REST handlers
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Handle create success.
     */
    _handleCreateSuccess(model, collection)
    {
 //       collection.add(model);
        Radio.channel('rodan-client-core').trigger(Events.EVENT__WORKFLOW_CREATED, {workflow: model});
    }

    /**
     * Handle delete success.
     */
    _handleDeleteSuccess(model, collection)
    {
  //      collection.remove(model);
        Radio.channel('rodan-client-core').trigger(Events.EVENT__WORKFLOW_DELETED, {workflow: model});
    }

    /**
     * Handle export success.
     */
    _handleExportSuccess(result, model)
    {
        var data = JSON.stringify(result);
        Radio.channel('rodan-client-core').request(Events.REQUEST__DOWNLOAD_START, {data: data, filename: model.get('name'), mimetype: 'application/json'});
    }

    /**
     * Handle import success.
     */
    _handleImportSuccess(model, collection)
    {
 //       collection.add(model, {});
        Radio.channel('rodan-client-core').trigger(Events.EVENT__WORKFLOW_CREATED, {workflow: model});
    }
}