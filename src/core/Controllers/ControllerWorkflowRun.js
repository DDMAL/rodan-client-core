import BaseController from './BaseController';
import Radio from 'backbone.radio';
import Events from 'lib/Shared/Events';
import WorkflowRun from 'lib/Models/WorkflowRun';
import WorkflowRunCollection from 'lib/Collections/WorkflowRunCollection';

/**
 * Controller for WorkflowRun.
 */
export default class ControllerWorkflowRun extends BaseController
{
///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS - Initialize
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Initialize Radio.
     */
    _initializeRadio()
    {
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWRUN_CREATE, options => this._handleRequestWorkflowRunCreate(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWRUN_DELETE, options => this._handleRequestWorkflowRunDelete(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWRUN_SAVE, options => this._handleRequestWorkflowRunSave(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWRUN_START, options => this._handleRequestWorkflowRunStart(options), this);
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS - Radio handlers
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Handle request create WorkflowRun.
     */
    _handleRequestWorkflowRunCreate(options)
    {
        var name = options.workflow.get('name');
        var description = 'Run of Workflow "' + name + '"\n\n' + this._getResourceAssignmentDescription(options.assignments);
        var workflowRun = new WorkflowRun({workflow: options.workflow.get('url'), 
                                           resource_assignments: options.assignments,
                                           name: name,
                                           description: description});
        workflowRun.save({}, {success: (model) => Radio.channel('rodan-client-core').trigger(Events.EVENT__WORKFLOWRUN_CREATED, {workflowrun: model})});
    }

    /**
     * Handle request delete WorkflowRun.
     */
    _handleRequestWorkflowRunDelete(options)
    {
        options.workflowrun.destroy({success: (model) => Radio.channel('rodan-client-core').trigger(Events.EVENT__WORKFLOWRUN_DELETED, {workflowrun: model})});
    }

    /**
     * Handle request save WorkflowRun.
     */
    _handleRequestWorkflowRunSave(options)
    {
        options.workflowrun.save(options.workflowrun.changed,
                                 {patch: true, success: (model) => Radio.channel('rodan-client-core').trigger(Events.EVENT__WORKFLOWRUN_SAVED, {workflowrun: model})});
    }

    /**
     * Handle request start WorkflowRun.
     */
    _handleRequestWorkflowRunStart(options)
    {
        options.workflowrun.set({status: 21});
        options.workflowrun.save(options.workflowrun.changed,
                                 {patch: true, success: (model) => Radio.channel('rodan-client-core').trigger(Events.EVENT__WORKFLOWRUN_STARTED, {workflowrun: model})});
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Given resource assignments, provides descriptive info.
     */
    _getResourceAssignmentDescription(assignments)
    {
        var text = '';
        for (var inputPortUrl in assignments)
        {
            var resourceUrls = assignments[inputPortUrl];
            for (var index in resourceUrls)
            {
                text += '- ' + resourceUrls[index] + '\n';
            }
            text += '\n';
        }
        return text;
    }
}