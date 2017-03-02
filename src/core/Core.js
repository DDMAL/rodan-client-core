// external deps
import $ from 'jquery';
import Radio from 'backbone.radio';

// core includes
import Configuration from 'core/Configuration';
import ControllerAuthentication from 'core/Controllers/ControllerAuthentication';
import ControllerDownload from 'core/Controllers/ControllerDownload';
import ControllerProject from 'core/Controllers/ControllerProject';
import ControllerResource from 'core/Controllers/ControllerResource';
import ControllerRunJob from 'core/Controllers/ControllerRunJob';
import ControllerServer from 'core/Controllers/ControllerServer';
import ControllerUserPreference from 'core/Controllers/ControllerUserPreference';
import ControllerWorkflow from 'core/Controllers/ControllerWorkflow';
import ControllerWorkflowBuilder from 'core/Controllers/ControllerWorkflowBuilder';
import ControllerWorkflowJob from 'core/Controllers/ControllerWorkflowJob';
import ControllerWorkflowJobGroup from 'core/Controllers/ControllerWorkflowJobGroup';
import ControllerWorkflowRun from 'core/Controllers/ControllerWorkflowRun';
import ErrorManager from 'core/Managers/ErrorManager';
import TransferManager from 'core/Managers/TransferManager';
import UpdateManager from 'core/Managers/UpdateManager';

// lib includes
import GlobalInputPortTypeCollection from 'lib/Collections/Global/GlobalInputPortTypeCollection';
import GlobalJobCollection from 'lib/Collections/Global/GlobalJobCollection';
import GlobalOutputPortTypeCollection from 'lib/Collections/Global/GlobalOutputPortTypeCollection';
import GlobalProjectCollection from 'lib/Collections/Global/GlobalProjectCollection';
import GlobalResourceTypeCollection from 'lib/Collections/Global/GlobalResourceTypeCollection';
import Events from 'lib/Events';

let _instance = null;
let _postInitFunction = null;

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

    /**
     * Destroys the singleton Core instance.
     */
    static deinitialize()
    {
        if (_instance)
        {
            Radio.channel('rodan-client-core').reset();
            _instance._deinitializeCollections();
            _instance = null;
        }
    }

    /**
     * This method takes in a function that will be called after the Core is
     * initialized and before REQUEST__SERVER_LOAD_ROUTES is called. The
     * function passed here should initialize anything required for viewing or
     * other custom behavior for the application.
     *
     * @param {function} postInitFunction function to be called after init
     */
    static setPostInitializeFunction(postInitFunction)
    {
        _postInitFunction = postInitFunction;
    }

////////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
////////////////////////////////////////////////////////////////////////////////
    /**
     * Constructor.
     */
    constructor()
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
        this._initializeManagers();

        // Call post init.
        if (_postInitFunction)
        {
            _postInitFunction();  
        }

        // We're ready to go! Connect to the server.
        Radio.channel('rodan-client-core').request(Events.REQUEST__SERVER_LOAD_ROUTES);
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Set event binding.
     */
    _initializeRadio()
    {
        Radio.channel('rodan-client-core').on(Events.EVENT__SERVER_ROUTESLOADED, () => this._handleEventRoutesLoaded());
        Radio.channel('rodan-client-core').on(Events.EVENT__AUTHENTICATION_LOGIN_SUCCESS, () => this._handleAuthenticationSuccess());
    }

    /**
     * Initialize controllers.
     */
    _initializeControllers()
    {
        this._controllerAuthentication = new ControllerAuthentication();
        this._controllerDownload = new ControllerDownload();
        this._controllerProject = new ControllerProject();
        this._controllerResource = new ControllerResource();
        this._controllerRunJob = new ControllerRunJob();
        this._controllerServer = new ControllerServer();
        this._controllerUserPreference = new ControllerUserPreference();
        this._controllerWorkflow = new ControllerWorkflow();
        this._controllerWorkflowBuilder = new ControllerWorkflowBuilder();
        this._controllerWorkflowJob = new ControllerWorkflowJob();
        this._controllerWorkflowJobGroup = new ControllerWorkflowJobGroup();
        this._controllerWorkflowRun = new ControllerWorkflowRun();
 //       this._resourceListController = new ControllerResourceList();
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
     * Deinitialize (delete) collections.
     */
    _deinitializeCollections()
    {
        this._jobCollection.deinitialize();
        this._resourceTypeCollection.deinitialize();
        this._inputPortTypeCollection.deinitialize();
        this._outputPortTypeCollection.deinitialize();
        this._projectCollection.deinitialize();
    }

    /**
     * Initialize managers.
     */
    _initializeManagers()
    {
        this._managerError = new ErrorManager();
        this._managerTransfer = new TransferManager();
        this._managerUpdater = new UpdateManager();
    }

    /**
     * Handle EVENT__SERVER_ROUTESLOADED.
     */
    _handleEventRoutesLoaded()
    {
        // Do version compatibility trimming.
        if (Configuration.ENFORCE_VERSION_COMPATIBILITY)
        {
            Events.enforceVersionCompatibility();
        }
    }

    /**
     * Handle authentication success.
     */
    _handleAuthenticationSuccess()
    {
        var user = Radio.channel('rodan-client-core').request(Events.REQUEST__AUTHENTICATION_USER);
        Radio.channel('rodan-client-core').request(Events.REQUEST__SERVER_LOAD_ROUTE_OPTIONS);
        Radio.channel('rodan-client-core').request(Events.REQUEST__GLOBAL_PROJECTS_LOAD, {data: {user: user.get('uuid')}});
        Radio.channel('rodan-client-core').request(Events.REQUEST__GLOBAL_INPUTPORTTYPES_LOAD);
        Radio.channel('rodan-client-core').request(Events.REQUEST__GLOBAL_OUTPUTPORTTYPES_LOAD);
        Radio.channel('rodan-client-core').request(Events.REQUEST__GLOBAL_RESOURCETYPES_LOAD);
        Radio.channel('rodan-client-core').request(Events.REQUEST__GLOBAL_JOBS_LOAD, {data: {enabled: 'True'}});
    }
}
