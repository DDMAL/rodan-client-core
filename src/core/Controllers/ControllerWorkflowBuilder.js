import _ from 'underscore';
import BaseCollection from 'lib/Collections/BaseCollection';
import BaseController from './BaseController';
import Configuration from 'core/Configuration';
import Connection from 'lib/Models/Connection';
import InputPort from 'lib/Models/InputPort';
import JobCollection from 'lib/Collections/JobCollection';
import OutputPort from 'lib/Models/OutputPort';
import Radio from 'backbone.radio';
import Resource from 'lib/Models/Resource';
import ResourceCollection from 'lib/Collections/ResourceCollection';
import ResourceList from 'lib/Models/ResourceList';
import Events from 'lib/Events';
import WorkflowCollection from 'lib/Collections/WorkflowCollection';

/**
 * Controller for the WorkflowBuilder.
 */
export default class ControllerWorkflowBuilder extends BaseController
{
///////////////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Initializer.
     */
    initialize()
    {
        this._resourceAssignments = []; // this helps manage the list of resource assignments while building the resource
        this._resourcesAvailable = []; // this is just a cache for resources that will work with a given input port
        this._workflowRunOptions = {};
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Initialize Radio.
     */
    _initializeRadio()
    {
        Radio.channel('rodan-client-core').on(Events.EVENT__WORKFLOWBUILDER_SELECTED, options => this._handleEventBuilderSelected(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_SET_ADDPORTS, options => this._handleRequestSetAddPorts(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_ADD_CONNECTION, options => this._handleCommandAddConnection(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_ADD_INPUTPORT, options => this._handleCommandAddInputPort(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_ADD_OUTPUTPORT, options => this._handleCommandAddOutputPort(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_ADD_WORKFLOWJOB, options => this._handleRequestAddWorkflowJob(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_ADD_WORKFLOWJOBGROUP, options => this._handleRequestAddWorkflowJobGroup(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_ASSIGN_RESOURCE, options => this._handleRequestAssignResource(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_CREATE_WORKFLOWRUN, options => this._handleRequestCreateWorkflowRun(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_ADD_DISTRIBUTOR, options => this._handleRequestCreateDistributor(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_REMOVE_CONNECTION, options => this._handleRequestDeleteConnection(options), this); 
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_REMOVE_INPUTPORT, options => this._handleCommandDeleteInputPort(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_REMOVE_OUTPUTPORT, options => this._handleCommandDeleteOutputPort(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_REMOVE_WORKFLOWJOB, options => this._handleRequestDeleteWorkflowJob(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_REMOVE_WORKFLOWJOBGROUP, options => this._handleRequestDeleteWorkflowJobGroup(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_GET_RESOURCEASSIGNMENTS, options => this._handleRequestGetResourceAssignments(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_IMPORT_WORKFLOW, options => this._handleRequestImportWorkflow(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_LOAD_WORKFLOW, options => this._handleEventLoadWorkflow(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_UNASSIGN_RESOURCE, options => this._handleRequestUnassignResource(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_UNGROUP_WORKFLOWJOBGROUP, options => this._handleRequestWorkflowJobGroupUngroup(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_VALIDATE_WORKFLOW, options => this._handleRequestValidateWorkflow(options), this);
        Radio.channel('rodan-client-core').reply(Events.REQUEST__WORKFLOWBUILDER_GET_SATISFYING_INPUTPORTS, options => this._handleRequestGetSatisfyingInputPorts(options), this);
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS - Radio handlers
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Handle selection.
     */
    _handleEventBuilderSelected(options)
    {
        this._resourceAssignments = [];
        this._resourcesAvailable = [];
        this._addPorts = true;
        Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWBUILDER_LOAD_WORKFLOW, {'workflow': options.workflow});
    }

    /**
     * Handle request set add ports.
     */
    _handleRequestSetAddPorts(options)
    {
        this._addPorts = options.addports;
    }

    /**
     * Handle request create WorkflowRun.
     */
    _handleRequestCreateWorkflowRun(options)
    {
        this._workflowRunOptions = {workflow: options.workflow, assignments: {}};
        var inputPortTypes = Radio.channel('rodan-client-core').request(Events.REQUEST__GLOBAL_INPUTPORTTYPE_COLLECTION);
        var knownInputPorts = this._workflowRunOptions.workflow.get('workflow_input_ports').clone();
        for (var inputPortUrl in this._resourceAssignments)
        {
            // If our assignments for an InputPort are not needed, we just skip it.
            var inputPort = knownInputPorts.findWhere({url: inputPortUrl});
            if (!inputPort)
            {
                continue;
            }

            // If there is nothing for a given InputPort, error.
            this._workflowRunOptions.assignments[inputPortUrl] = [];
            var collection = this._getResourceAssignments(inputPortUrl);
            if (collection.length === 0)
            {
                console.error('TODO ERROR');
                return;
            }

            // Get URLs.
            var resourceUrls = [];
            for (var i = 0; i < collection.length; i++)
            {
                var resource = collection.at(i);
                resourceUrls.push(resource.get('url'));
            } 

            // If the InputPort requires a ResourceList, we'll have to create one.
            // Else, just get the Resource URLs.
            var inputPortType = inputPortTypes.findWhere({url: inputPort.get('input_port_type')});
            if (inputPortType.get('is_list'))
            {
                var resource = collection.at(0);
                var resourceType = resource.get('resource_type');
                var resourceList = new ResourceList();
                resourceList.set({resources: resourceUrls, resource_type: resourceType});
                this._workflowRunOptions.assignments[inputPortUrl] = resourceList;
            }
            else
            {
                this._workflowRunOptions.assignments[inputPortUrl] = resourceUrls;
            }

            // Finally, remove the InputPort from the cloned Collection.
            knownInputPorts.remove(inputPort);
        }

        // If we have anything left oveer in our cloned Collection, something is wrong.
        if (knownInputPorts.length > 0)
        {
            console.error('TODO ERROR');
        }
        else
        {
            this._attemptWorkflowRunCreation();
        }
    }

    /**
     * Handles success of workflow fetch.
     */
    _handleWorkflowLoadSuccess(workflow)
    {
        this._processWorkflow(workflow);
        Radio.channel('rodan-client-core').trigger(Events.EVENT__WORKFLOWBUILDER_LOADED_WORKFLOW, {workflow: workflow});
        Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWBUILDER_VALIDATE_WORKFLOW, {workflow: workflow});
    }

    /**
     * Handle request add workflow job.
     */
    _handleRequestAddWorkflowJob(options)
    {
        Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWJOB_CREATE, {job: options.job, workflow: options.workflow, addports: this._addPorts});
        Radio.channel('rodan-client-core').once(Events.EVENT__WORKFLOWJOB_CREATED, 
                               () => Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWBUILDER_VALIDATE_WORKFLOW, {workflow: options.workflow}));
    }

    /**
     * Handle command delete WorkflowJob.
     */
    _handleRequestDeleteWorkflowJob(options)
    {
        Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWJOB_DELETE, {workflowjob: options.workflowjob, workflow: options.workflow});
        Radio.channel('rodan-client-core').once(Events.EVENT__WORKFLOWJOB_DELETED, 
                               () => Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWBUILDER_VALIDATE_WORKFLOW, {workflow: options.workflow}));
    }

    /**
     * Handle command delete WorkflowJobGroup.
     */
    _handleRequestDeleteWorkflowJobGroup(options)
    {
        Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWJOBGROUP_DELETE, {workflowjobgroup: options.workflowjobgroup, workflow: options.workflow});
        Radio.channel('rodan-client-core').once(Events.EVENT__WORKFLOWJOBGROUP_DELETED, () => this._handleEventWorkflowJobGroupDelete(options.workflowjobgroup, options.workflow));
    }

    /**
     * Handle request delete Connection.
     */
    _handleRequestDeleteConnection(options)
    {
        options.connection.destroy({success: (model) => this._handleConnectionDeletionSuccess(options.connection, options.workflow)});
    }

    /**
     * Handle request import Workflow.
     */
    _handleRequestImportWorkflow(options)
    {
        Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWJOBGROUP_IMPORT, {origin: options.origin, target: options.target});
        Radio.channel('rodan-client-core').once(Events.EVENT__WORKFLOWJOBGROUP_IMPORTED, 
                               () => Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWBUILDER_LOAD_WORKFLOW, {workflow: options.target}));
    }

    /**
     * Handle add connection.
     */
    _handleCommandAddConnection(options)
    {
        this._createConnection(options.outputport, options.inputport, options.workflow);
    }

    /**
     * Create input port
     */
    _handleCommandAddInputPort(options)
    {
        var port = new InputPort({input_port_type: options.inputporttype.get('url'), workflow_job: options.workflowjob.get('url')});
        port.save({}, {success: (model) => this._handleInputPortCreationSuccess(port, options.workflow, options.workflowjob)});
    }

    /**
     * Create output port
     */
    _handleCommandAddOutputPort(options)
    {
        var port = new OutputPort({output_port_type: options.outputporttype.get('url'), workflow_job: options.workflowjob.get('url')});
        port.save({}, {success: (model) => this._handleOutputPortCreationSuccess(port, options.workflow, options.workflowjob, options.targetinputports)});
    }

    /**
     * Delete input port
     */
    _handleCommandDeleteInputPort(options)
    {
        options.inputport.destroy({success: (model) => this._handleInputPortDeletionSuccess(model, options.workflow, options.workflowjob)});
    }

    /**
     * Delete output port
     */
    _handleCommandDeleteOutputPort(options)
    {
        options.outputport.destroy({success: (model) => this._handleOutputPortDeletionSuccess(model, options.workflow, options.workflowjob)});
    }

    /**
     * Handle request load Workflow.
     */
    _handleEventLoadWorkflow(options)
    {
        options.workflow.fetch({'success': (workflow) => this._handleWorkflowLoadSuccess(workflow)});
    }

    /**
     * Handle request validate Workflow.
     */
    _handleRequestValidateWorkflow(options)
    {
        this._validateWorkflow(options.workflow);  
    }

    /**
     * Handle request create distributor.
     */
    _handleRequestCreateDistributor(options)
    {
        var requiredResourceTypes = this._getCompatibleResourceTypeURLs(options.inputports);
        if (requiredResourceTypes.length > 0)
        {
            var jobs = this._getCandidateResourceDistributorJobs(requiredResourceTypes);
            if (jobs.length > 0)
            {
                // TODO - offer list
                var targetInputPorts = [];
                for (var index in options.inputports)
                {
                    var inputPort = options.inputports[index];
                    targetInputPorts.push(options.workflow.get('workflow_input_ports').get(inputPort.id));
                }
                Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWJOB_CREATE, {job: jobs[0], 
                                                                               workflow: options.workflow, 
                                                                               addports: true,
                                                                               targetinputports: targetInputPorts});
            }
        }
    }

    /**
     * Handle request WorkflowJobGroup ungroup.
     */
    _handleRequestWorkflowJobGroupUngroup(options)
    {
        Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWJOBGROUP_DELETE, {workflowjobgroup: options.workflowjobgroup, workflow: options.workflow});
    }

    /**
     * Handle request add WorkflowJobGroup.
     */
    _handleRequestAddWorkflowJobGroup(options)
    {
//        Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWJOBGROUP_CREATE, {workflowjobs: options.workflowjobs, workflow: options.workflow});
    }

    /**
     * Handle request assign Resource to InputPort.
     */
    _handleRequestAssignResource(options)
    {
        var url = options.inputport.get('url');
        var resourcesAssigned = this._getResourceAssignments(url);
        var multipleUrl = this._getInputPortURLWithMultipleAssignments();
        if (multipleUrl && resourcesAssigned.length > 0 && multipleUrl !== url)
        {
            console.error('TODO ERROR');
            return;
        }
        resourcesAssigned.add(options.resource);
    }

    /**
     * Handle request unassigne Resource from InputPort.
     */
    _handleRequestUnassignResource(options)
    {
        var resourcesAssigned = this._getResourceAssignments(options.inputport.get('url'));
        resourcesAssigned.remove(options.resource);
    }

    /**
     * Handle request get Resource assignments.
     */
    _handleRequestGetResourceAssignments(options)
    {
        return this._getResourceAssignments(options.inputport.get('url'));
    }

    /**
     * Handle WorkflowJobGroup delete success. This will remove associated WorkflowJobs.
     */
    _handleEventWorkflowJobGroupDelete(workflowJobGroup, workflow)
    {
        var workflowJobs = workflowJobGroup.get('workflow_jobs');
        for (var index in workflowJobs)
        {
            var workflowJob = workflow.get('workflow_jobs').findWhere({url: workflowJobs[index]});
            Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWBUILDER_REMOVE_WORKFLOWJOB, {workflowjob: workflowJob, workflow: workflow});
        }
    }

    /**
     * Handle request get satisfying InputPorts.
     */
    _handleRequestGetSatisfyingInputPorts(options)
    {
        var outputPort = options.outputport;
        var workflow = options.workflow;
        return this._getSatisfiableInputPorts(outputPort, workflow);
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS - REST response handlers
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Handle ResourceList creation success.
     */
    _handleResourceListCreationSuccess(model, inputPortUrl)
    {
        this._workflowRunOptions.assignments[inputPortUrl] = [model.get('url')];
        this._attemptWorkflowRunCreation();
    }

    /**
     * Handle ResourceList creation error.
     */
    _handleResourceListCreationError()
    {
        // todo - need something here
    }

    /**
     * Handle InputPort creation success.
     */
    _handleInputPortCreationSuccess(model, workflow, workflowJob)
    {
        workflow.get('workflow_input_ports').add(model);
        workflowJob.get('input_ports').add(model);
        Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWBUILDER_VALIDATE_WORKFLOW, {workflow: workflow});
    }

    /**
     * Handle OutputPort creation success.
     */
    _handleOutputPortCreationSuccess(model, workflow, workflowJob, targetInputPorts)
    {
        workflow.get('workflow_output_ports').add(model);
        workflowJob.get('output_ports').add(model);
        for (var index in targetInputPorts)
        {
            this._createConnection(model, targetInputPorts[index], workflow);
        }
        Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWBUILDER_VALIDATE_WORKFLOW, {workflow: workflow});
    }

    /**
     * Handles success of Connection creation.
     */
    _handleConnectionCreationSuccess(model, workflow, inputPort, outputPort)
    {
        workflow.get('connections').add(model);
        inputPort.fetch(); // to get populated Connection array
        outputPort.fetch(); // to get populated Connection array
        Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWBUILDER_VALIDATE_WORKFLOW, {workflow: workflow});
    }

    /**
     * Handle InputPort deletion success.
     */
    _handleInputPortDeletionSuccess(model, workflow, workflowJob)
    {
        workflowJob.get('input_ports').remove(model);
        Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWBUILDER_VALIDATE_WORKFLOW, {workflow: workflow});
    }

    /**
     * Handle OutputPort deletion success.
     */
    _handleOutputPortDeletionSuccess(model, workflow, workflowJob)
    {
        workflowJob.get('output_ports').remove(model);
        Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWBUILDER_VALIDATE_WORKFLOW, {workflow: workflow});
    }

    /**
     * Handle Connection deletion success.
     */
    _handleConnectionDeletionSuccess(model, workflow)
    {
        workflow.get('connections').remove(model);
        Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWBUILDER_VALIDATE_WORKFLOW, {workflow: workflow});
    }

    /**
     * Handle validation failure.
     */
    _handleValidationFailure(model, response, options)
    {
        model.set({'valid': false});
        Radio.channel('rodan-client-core').trigger(Events.EVENT__WORKFLOWBUILDER_VALIDATED_WORKFLOW, {workflow: model});
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Create connection.
     */
    _createConnection(outputPort, inputPort, workflow)
    {
        var connection = new Connection({input_port: inputPort.get('url'), output_port: outputPort.get('url')});
        connection.save({}, {success: (model) => this._handleConnectionCreationSuccess(model, workflow, inputPort, outputPort)});
    }

    /**
     * Process workflow for GUI.
     */
    _processWorkflow(workflow)
    {
        // Process all WorkflowJobs and their associated ports.
        var connections = {};
        var workflowJobs = workflow.get('workflow_jobs');
        if (workflowJobs !== undefined)
        {
            for (var i = 0; i < workflowJobs.length; i++)
            {
                // Create WorkflowJob item then process connections.
                var workflowJob = workflowJobs.at(i);
                var tempConnections = this._processWorkflowJob(workflowJob);

                // For the connections returned, merge them into our master list.
                for (var connectionUrl in tempConnections)
                {
                    var connection = tempConnections[connectionUrl];
                    if (connections.hasOwnProperty(connectionUrl))
                    {
                        connections[connectionUrl].inputPort = 
                            connections[connectionUrl].inputPort === null ? connection.inputPort : connections[connectionUrl].inputPort;
                        connections[connectionUrl].outputPort = 
                            connections[connectionUrl].outputPort === null ? connection.outputPort : connections[connectionUrl].outputPort;
                    }
                    else
                    {
                        connections[connectionUrl] = connection;
                    }
                }
            }
        }

        // Process connections.
        for (var connectionUrl in connections)
        { 
            var connection = connections[connectionUrl];
            var connectionModel = new Connection({input_port: connection.inputPort.get('url'), 
                                                  output_port: connection.outputPort.get('url'),
                                                  url: connectionUrl});

            // TODO - better way to get connections?
            var connectionId = connectionModel.parseIdFromUrl(connectionUrl);
            connectionModel.set({uuid: connectionId});
            connectionModel.fetch();
            workflow.get('connections').add(connectionModel);
        }

        // Finally inport the WorkflowJobGroups. 
        Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWJOBGROUP_LOAD_COLLECTION, {workflow: workflow});
    }

    /**
     * Process workflow job for GUI.
     */
    _processWorkflowJob(model)
    {
        // We want to keep track of what connections need to be made and return those.
        var connections = {};

        // Process input ports.
        var inputPorts = model.get('input_ports');
        if (inputPorts !== undefined)
        {
            for (var i = 0; i < inputPorts.length; i++)
            {
                var inputPort = inputPorts.at(i);

                // Get connections.
                var inputPortConnections = inputPort.get('connections');
                for (var k = 0; k < inputPortConnections.length; k++)
                {
                    var connection = inputPortConnections[k];
                    connections[connection] = {'inputPort': inputPort, 'outputPort': null};
                }
            }
        }

        // Process output ports.
        var outputPorts = model.get('output_ports');
        if (outputPorts !== undefined)
        {
            for (var j = 0; j < outputPorts.length; j++)
            {
                var outputPort = outputPorts.at(j);

                // Get connections.
                var outputPortConnections = outputPort.get('connections');
                for (var k = 0; k < outputPortConnections.length; k++)
                {
                    var connection = outputPortConnections[k];
                    connections[connection] = {'inputPort': null, 'outputPort': outputPort};
                }
            }
        }

        return connections;
    }

    /**
     * Attempts to validate Workflow.
     */
    _validateWorkflow(workflow)
    {
        workflow.save({valid: true}, {patch: true,
                                      success: (model) => Radio.channel('rodan-client-core').trigger(Events.EVENT__WORKFLOWBUILDER_VALIDATED_WORKFLOW, {workflow: model}),
                                      error: (model, response, options) => this._handleValidationFailure(model, response, options)});
    }

    /**
     * Given an array of InputPorts, returns an array of ResourceType URLs that
     * would satisfy the InputPorts.
     */
    _getCompatibleResourceTypeURLs(inputPorts)
    {
        var resourceTypes = [];
        var inputPortTypes = Radio.channel('rodan-client-core').request(Events.REQUEST__GLOBAL_INPUTPORTTYPE_COLLECTION);
        for (var index in inputPorts)
        {
            // Get the available resource types.
            var inputPort = inputPorts[index];
            var inputPortTypeURL = inputPort.get('input_port_type');
            var inputPortType = inputPortTypes.findWhere({url: inputPortTypeURL});
            var inputPortResourceTypes = inputPortType.get('resource_types');

            // If this is the first iteration, set the array. Else, do an intersection.
            if (resourceTypes.length === 0)
            {
                resourceTypes = inputPortResourceTypes;
            }
            resourceTypes = _.intersection(resourceTypes, inputPortResourceTypes);
        }
        return resourceTypes;
    }

    /**
     * Given an OutputPort, returns an array of ResourceType URLs that would satisfy it.
     */
    _getOutputPortResourceTypeURLs(outputPort)
    {
        var resourceTypes = [];
        var outputPortTypes = Radio.channel('rodan-client-core').request(Events.REQUEST__GLOBAL_OUTPUTPORTTYPE_COLLECTION);
        var outputPortTypeURL = outputPort.get('output_port_type');
        var outputPortType = outputPortTypes.findWhere({url: outputPortTypeURL});
        var outputPortResourceTypes = outputPortType.get('resource_types');
        return outputPortResourceTypes;
    }

    /**
     * Given an array of ResourceType URLs, finds jobs that both give at least one and take at least
     * one of the ResourceTypes. The returned array {job: Job, inputporttypes: URL strings, outputporttypes: URL string}.
     * The port types are those ports of the associated Job that will satisfy the resource requirements.
     */
    _getCandidateResourceDistributorJobs(resourceTypes)
    {
        var jobs = Radio.channel('rodan-client-core').request(Events.REQUEST__GLOBAL_JOB_COLLECTION).where({category: Configuration.RESOURCE_DISTRIBUTOR_CATEGORY});
        var satisfiableJobs = [];
        for (var i = 0; i < jobs.length; i++)
        {
            var job = jobs[i];
            var inputPortType = job.get('input_port_types').at(0);
            var outputPortType = job.get('output_port_types').at(0);

            // Intersect against InputPortType ResourceTypes.
            var intersect = _.intersection(resourceTypes, inputPortType.get('resource_types'));
            if (intersect.length === 0)
            {
                continue;
            }

            intersect = _.intersection(resourceTypes, outputPortType.get('resource_types'));
            if (intersect.length === 0)
            {
                continue;
            }
            
            // We want to keep this job.
            satisfiableJobs.push(job);
        }
        return satisfiableJobs;
    }

    /**
     * Return InputPort URL that has multiple assignments.
     * Returns null if DNE.
     */
    _getInputPortURLWithMultipleAssignments()
    {
        for (var inputPortUrl in this._resourceAssignments)
        {
            var resourceAssignments = this._getResourceAssignments(inputPortUrl);
            if (resourceAssignments.length > 1)
            {
                return inputPortUrl;
            }
        }
        return null;
    }

    /**
     * Returns resource assignment for given InputPort url.
     */
    _getResourceAssignments(inputPortUrl)
    {
        if (!this._resourceAssignments[inputPortUrl])
        {
            this._resourceAssignments[inputPortUrl] = new BaseCollection(null, {model: Resource});
        }
        return this._resourceAssignments[inputPortUrl];
    }

    /**
     * Returns resources available for given InputPort.
     */
    _getResourcesAvailable(inputPort)
    {
        if (!this._resourcesAvailable[inputPort.get('url')])
        {
            var project = Radio.channel('rodan-client-core').request(Events.REQUEST__PROJECT_GET_ACTIVE);
            var resourceTypeURLs = this._getCompatibleResourceTypeURLs([inputPort]);
            var data = {project: project.id, resource_type__in: ''};
            var globalResourceTypes = Radio.channel('rodan-client-core').request(Events.REQUEST__GLOBAL_RESOURCETYPE_COLLECTION);
            var first = true;
            for (var index in resourceTypeURLs)
            {
                var idString = null;
                if (first)
                {
                    first = false;
                    idString = globalResourceTypes.findWhere({url: resourceTypeURLs[index]}).id;
                }
                else
                {
                    idString = ',' + globalResourceTypes.findWhere({url: resourceTypeURLs[index]}).id;
                }
                data.resource_type__in = data.resource_type__in + idString;
            }
            this._resourcesAvailable[inputPort.get('url')] = new ResourceCollection();
            this._resourcesAvailable[inputPort.get('url')].fetch({data: data});
        }
        this._resourcesAvailable[inputPort.get('url')].syncCollection();
        return this._resourcesAvailable[inputPort.get('url')];
    }

    /**
     * Check WorkflowRun Resource assignments.
     *
     * This method checks if any Resource assignments are ResourceLists.
     * If there are and the ResourceList has no ID, it saves the list and waits for a response.
     * If it has an ID, it replaces the object with the URL for that ResourceList.
     * If a reference is just to an array of REsource refs, it is ignored.
     *
     * If everything checks out create the WorkflowRun and return true. Else return false.
     */
    _attemptWorkflowRunCreation()
    {
        for (var inputPortUrl in this._workflowRunOptions.assignments)
        {
            var assignments = this._workflowRunOptions.assignments[inputPortUrl];
            if (assignments instanceof ResourceList && !assignments.id)
            {
                // TODO - shitty way to do this; once I do a "save", I don't do another; this ensures that 'inputPortUrl'
                // doesn't get set to the last one in the loop
                assignments.save({}, {success: (model) => this._handleResourceListCreationSuccess(model, inputPortUrl),
                                       error: () => this._handleResourceListCreationError()});
                return false;
            }
        }
        Radio.channel('rodan-client-core').request(Events.REQUEST__WORKFLOWRUN_CREATE, this._workflowRunOptions);
        return true;
    }

    /**
     * Given a WorkflowJob, returns array of all InputPorts.
     */
    _getInputPorts(workflowJobs)
    {
        var inputPorts = [];
        for (var i = 0; i < workflowJobs.length; i++)
        {
            var workflowJob = workflowJobs[i];
            inputPorts.push(workflowJob.get('input_ports').models());
        }
        return inputPorts;
    }

    /**
     * Given an OutputPort, return an array of those InputPort URLs that would be satisfied by the OutputPort.
     */
    _getSatisfiableInputPorts(outputPort, workflow)
    {
        var outputPortResourceTypes = this._getOutputPortResourceTypeURLs(outputPort);
        var inputPortTypes = Radio.channel('rodan-client-core').request(Events.REQUEST__GLOBAL_INPUTPORTTYPE_COLLECTION);
        var inputPorts = [];
        var workflowJobs = workflow.get('workflow_jobs').models;
        for (var i = 0; i < workflowJobs.length; i++)
        {
            // Get WorkflowJob.
            var workflowJob = workflowJobs[i];
            if (workflowJob.get('url') === outputPort.get('workflow_job'))
            {
                continue;
            }

            // For each InputPort, get ResourceType URL.
            var possibleInputPorts = workflowJob.get('input_ports').models;
            for (var j = 0; j < possibleInputPorts.length; j++)
            {
                var inputPort = possibleInputPorts[j];
                var inputPortType = inputPortTypes.findWhere({url: inputPort.get('input_port_type')});
                var inputPortResourceTypes = inputPortType.get('resource_types');
                var resourceTypes = _.intersection(outputPortResourceTypes, inputPortResourceTypes);
                if (resourceTypes.length > 0)
                {
                    inputPorts.push(inputPort.get('url'));
                }
            }
        }
        return inputPorts;
    }
}