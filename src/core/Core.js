// external deps
import $ from 'jquery';
import Radio from 'backbone.radio';

// core includes
import Configuration from 'core/Configuration';
import ControllerAuthentication from 'core/Controllers/ControllerAuthentication';
import ControllerServer from 'core/Controllers/ControllerServer';

// lib includes
import RODAN_EVENTS from 'lib/Shared/RODAN_EVENTS';
import GlobalInputPortTypeCollection from 'lib/Collections/Global/GlobalInputPortTypeCollection';
import GlobalJobCollection from 'lib/Collections/Global/GlobalJobCollection';
import GlobalOutputPortTypeCollection from 'lib/Collections/Global/GlobalOutputPortTypeCollection';
import GlobalProjectCollection from 'lib/Collections/Global/GlobalProjectCollection';
import GlobalResourceTypeCollection from 'lib/Collections/Global/GlobalResourceTypeCollection';

let _instance = null;

/**
 * Main application class.
 */
export default class Core
{
////////////////////////////////////////////////////////////////////////////////
// PUBLIC STATIC METHODS
////////////////////////////////////////////////////////////////////////////////
    /**
     * Creates a singleton Core instance.
     */
    static initialize()
    {
        if (!_instance)
        {
            _instance = new Core();
        }
    }

////////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
////////////////////////////////////////////////////////////////////////////////
    /**
     * Constructor.
     */
    constructor()
    {
        Configuration.load('configuration.json', () => this._startUp());
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Application start-up
     */
    _startUp()
    {
        // Check debug.
        if (Configuration.DEBUG)
        {
            Radio.tuneIn('rodan-client-core');
        }

        // Initialize.
        this._initializeRadio();
        this._initializeCollections();
        this._initializeAjaxPrefilters();
        this._initializeControllers();

        // Get client info.
        Configuration.load('info.json');

        // Extended setup should be done here.
        this._customInitialization();
        
        // This should be last.
//        require('./.plugins');

        // We're ready to go! Connect to the server.
        Radio.channel('rodan-client-core').request(RODAN_EVENTS.REQUEST__SERVER_LOAD_ROUTES);
    }

    /**
     * Custom initialization.
     */
    _customInitialization() {}

    /**
     * Set event binding.
     */
    _initializeRadio()
    {
        Radio.channel('rodan-client-core').on(RODAN_EVENTS.EVENT__SERVER_ROUTESLOADED, () => this._handleEventRoutesLoaded());
        Radio.channel('rodan-client-core').on(RODAN_EVENTS.EVENT__AUTHENTICATION_LOGIN_SUCCESS, () => this._handleAuthenticationSuccess());
    }

    /**
     * Initialize controllers. These are not used for viewing; rather, they are server/auth control.
     */
    _initializeControllers()
    {
 //       this._downloadController = new ControllerDownload();
        this._controllerServer = new ControllerServer();
        this._controllerAuthentication = new ControllerAuthentication(this._controllerServer);
 //       this._projectController = new ControllerProject();
 //       this._resourceController = new ControllerResource();
 //       this._resourceListController = new ControllerResourceList();
 //       this._runJobController = new ControllerRunJob();
 //       this._userPreferenceController = new ControllerUserPreference();
 //       this._workflowController = new ControllerWorkflow();
 //       this._workflowRunController = new ControllerWorkflowRun();
 //       this._workflowBuilderController = new ControllerWorkflowBuilder();
 //       this._workflowJobController = new ControllerWorkflowJob();
 //       this._workflowJobGroupController = new ControllerWorkflowJobGroup();
    }

    /**
     * Initialize AJAX prefilters. This allows the application a lower level of request monitoring (if desired).
     */
    _initializeAjaxPrefilters()
    {
        var that = this;
        $.ajaxPrefilter(function(options)
        {
            that._controllerAuthentication.ajaxPrefilter(options);
            that._controllerServer.ajaxPrefilter(options);
        });
    }

    /**
     * Initialize collections.
     */
    _initializeCollections()
    {
        this._jobCollection = new GlobalJobCollection();
        this._resourceTypeCollection = new GlobalResourceTypeCollection();
        this._inputPortTypeCollection = new GlobalInputPortTypeCollection();
        this._outputPortTypeCollection = new GlobalOutputPortTypeCollection();
        this._projectCollection = new GlobalProjectCollection();
    }

    /**
     * Handle EVENT__SERVER_ROUTESLOADED.
     */
    _handleEventRoutesLoaded()
    {
        // Render layout views.
        /** @ignore */
 //       this.regionMaster.show(this._layoutViewMaster);
        
        // Do version compatibility trimming.
        if (Configuration.ENFORCE_VERSION_COMPATIBILITY)
        {
            RODAN_EVENTS.enforceVersionCompatibility();
        }

        // Check authentication.
        Radio.channel('rodan-client-core').request(RODAN_EVENTS.REQUEST__AUTHENTICATION_CHECK); 
    }

    /**
     * Handle authentication success.
     */
    _handleAuthenticationSuccess()
    {
        var user = Radio.channel('rodan-client-core').request(RODAN_EVENTS.REQUEST__AUTHENTICATION_USER);
        Radio.channel('rodan-client-core').request(RODAN_EVENTS.REQUEST__SERVER_LOAD_ROUTE_OPTIONS);
        Radio.channel('rodan-client-core').request(RODAN_EVENTS.REQUEST__GLOBAL_PROJECTS_LOAD, {data: {user: user.get('uuid')}});
        Radio.channel('rodan-client-core').request(RODAN_EVENTS.REQUEST__GLOBAL_INPUTPORTTYPES_LOAD);
        Radio.channel('rodan-client-core').request(RODAN_EVENTS.REQUEST__GLOBAL_OUTPUTPORTTYPES_LOAD);
        Radio.channel('rodan-client-core').request(RODAN_EVENTS.REQUEST__GLOBAL_RESOURCETYPES_LOAD);
        Radio.channel('rodan-client-core').request(RODAN_EVENTS.REQUEST__GLOBAL_JOBS_LOAD, {data: {enabled: 'True'}});
        Radio.channel('rodan-client-core').trigger(RODAN_EVENTS.EVENT__PROJECT_SELECTED_COLLECTION); 
    }
}
