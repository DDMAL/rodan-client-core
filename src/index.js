import Core from 'core/Core';
import Configuration from 'core/Configuration';
import Events from 'lib/Events';
import Environment from 'core/Environment';
import Radio from 'backbone.radio';

// Collections.
import BaseCollection from 'lib/Collections/BaseCollection';
import ConnectionCollection from 'lib/Collections/ConnectionCollection';
import InputPortCollection from 'lib/Collections/InputPortCollection';
import InputPortTypeCollection from 'lib/Collections/InputPortTypeCollection';
import JobCollection from 'lib/Collections/JobCollection';
import OutputPortCollection from 'lib/Collections/OutputPortCollection';
import OutputPortTypeCollection from 'lib/Collections/OutputPortTypeCollection';
import ResourceCollection from 'lib/Collections/ResourceCollection';
import ResourceListCollection from 'lib/Collections/ResourceListCollection';
import RunJobCollection from 'lib/Collections/RunJobCollection';
import UserCollection from 'lib/Collections/UserCollection';
import UserPreferenceCollection from 'lib/Collections/UserPreferenceCollection';
import WorkflowCollection from 'lib/Collections/WorkflowCollection';
import WorkflowJobCollection from 'lib/Collections/WorkflowJobCollection';
import WorkflowJobGroupCollection from 'lib/Collections/WorkflowJobGroupCollection';
import WorkflowRunCollection from 'lib/Collections/WorkflowRunCollection';

// Models.
import BaseModel from 'lib/Models/BaseModel';
import Connection from 'lib/Models/Connection';
import InputPort from 'lib/Models/InputPort';
import InputPortType from 'lib/Models/InputPortType';
import Job from 'lib/Models/Job';
import OutputPort from 'lib/Models/OutputPort';
import OutputPortType from 'lib/Models/OutputPortType';
import Pagination from 'lib/Models/Pagination';
import Project from 'lib/Models/Project';
import Resource from 'lib/Models/Resource';
import ResourceList from 'lib/Models/ResourceList';
import ResourceType from 'lib/Models/ResourceType';
import RunJob from 'lib/Models/RunJob';
import User from 'lib/Models/User';
import UserPreference from 'lib/Models/UserPreference';
import Workflow from 'lib/Models/Workflow';
import WorkflowJob from 'lib/Models/WorkflowJob';
import WorkflowJobGroup from 'lib/Models/WorkflowJobGroup';
import WorkflowRun from 'lib/Models/WorkflowRun';

const defaultExport = 
{
	channel: Radio.channel('rodan-client-core'),
	config: Configuration, 
	deinitialize: Core.deinitialize,
	env: Environment, 
    events: Events,
	initialize: Core.initialize,
	setInitFunction: Core.setPostInitializeFunction,

	// Collections.
	BaseCollection: BaseCollection,
	ConnectionCollection: ConnectionCollection,
	InputPortCollection: InputPortCollection,
	InputPortTypeCollection: InputPortTypeCollection,
	JobCollection: JobCollection,
	OutputPortCollection: OutputPortCollection,
	OutputPortTypeCollection: OutputPortTypeCollection,
	ResourceCollection: ResourceCollection,
	ResourceListCollection: ResourceListCollection,
	RunJobCollection: RunJobCollection,
	UserCollection: UserCollection,
	UserPreferenceCollection: UserPreferenceCollection,
	WorkflowCollection: WorkflowCollection,
	WorkflowJobCollection: WorkflowJobCollection,
	WorkflowJobGroupCollection: WorkflowJobGroupCollection,
	WorkflowRunCollection: WorkflowRunCollection,

	// Models
	BaseModel: BaseModel,
	Connection: Connection,
	InputPort: InputPort,
	InputPortType: InputPortType,
	Job: Job,
	OutputPort: OutputPort,
	OutputPortType: OutputPortType,
	Pagination: Pagination,
	Project: Project,
	Resource: Resource,
	ResourceList: ResourceList,
	ResourceType: ResourceType,
	RunJob: RunJob,
	User: User,
	UserPreference: UserPreference,
	Workflow: Workflow,
	WorkflowJob: WorkflowJob,
	WorkflowJobGroup: WorkflowJobGroup,
	WorkflowRun: WorkflowRun,
};

export default defaultExport;
