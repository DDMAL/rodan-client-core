import BaseController from './BaseController';
import Configuration from 'core/Configuration';
import Radio from 'backbone.radio';
import Events from 'lib/Shared/Events';
import RunJobCollection from 'lib/Collections/RunJobCollection';

/**
 * Controller for RunJobs.
 */
export default class ControllerRunJob extends BaseController
{
///////////////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Initializes the instance.
     */
    initialize()
    {
        this._runJobLocks = {};
 //       setInterval(() => this._reacquire(), Configuration.RUNJOB_ACQUIRE_INTERVAL);
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Initialize Radio.
     */
    _initializeRadio()
    {
        Radio.channel('rodan-client-core').reply(Events.REQUEST__RUNJOB_ACQUIRE, options => this._handleRequestAcquire(options));
        Radio.channel('rodan-client-core').reply(Events.REQUEST__RUNJOBS_LOAD, options => this._handleRequestRunJobs(options));
    }

    /**
     * Handle request acquire.
     */
    _handleRequestAcquire(options)
    {
        // Get lock if available. Else, if we already have the lock, simply open the interface.
        var user = Radio.channel('rodan-client-core').request(Events.REQUEST__AUTHENTICATION_USER);
        var runJobUrl = options.runjob.get('url');
        if (options.runjob.available())
        {
            var ajaxSettings = {
                url: options.runjob.get('interactive_acquire'),
                type: 'POST',
                dataType: 'json',
                success: (response) => this._handleSuccessAcquire(response, runJobUrl, options.runjob),
                error: () => this._removeRunJobLock(runJobUrl)
            };
            Radio.channel('rodan-client-core').request(Events.REQUEST__SERVER_REQUEST_AJAX, {settings: ajaxSettings});
        }
        else if (options.runjob.get('working_user') === user.get('url'))
        {
            var url = this._getWorkingUrl(runJobUrl);
            this._openRunJobInterface(url);
        }
    }

    /**
     * Handle success of interactive acquire.
     */
    _handleSuccessAcquire(response, runJobUrl, runJob)
    {
//        this._registerRunJobForReacquire(runJobUrl, response.working_url, runJob.get('interactive_acquire'));
        Radio.channel('rodan-client-core').trigger(Events.EVENT__RUNJOB_ACQUIRED, {runjob: runJob});
        this._openRunJobInterface(response.working_url);
    }

    /**
     * Opens interface.
     */
    _openRunJobInterface(url)
    {
        window.open(url, '', '_blank');
    }

    /**
     * Registers an interactive job to be relocked.
     */
    _registerRunJobForReacquire(runJobUrl, workingUrl, acquireUrl)
    {
        var date = new Date();
        this._runJobLocks[runJobUrl] = {date: date.getTime(), working_url: workingUrl, acquire_url: acquireUrl};
    }

    /**
     * Get working URL for acquired RunJob.
     */
    _getWorkingUrl(runJobUrl)
    {
        var object = this._runJobLocks[runJobUrl];
        if (object)
        {
            return object.working_url;
        }
        return null;
    }

    /**
     * Handle reacquire callback.
     */
    _reacquire()
    {
        var date = new Date();
        for (var runJobUrl in this._runJobLocks)
        {
            var runJob = this._collection.findWhere({url: runJobUrl});

            // If the RunJob is available, renew. Else, get rid of the lock.
            if (runJob.available())
            {
                var data = this._runJobLocks[runJobUrl];
                if (data)
                {
                    var timeElapsed = date.getTime() - data.date;
                    if (timeElapsed < Configuration.RUNJOB_ACQUIRE_DURATION)
                    {
                        $.ajax({url: data.acquire_url, type: 'POST', dataType: 'json', error: () => this._removeRunJobLock(runJobUrl)});
                    }
                    else
                    {
                        this._removeRunJobLock(runJobUrl);
                    }
                }
            }
            else
            {
                this._removeRunJobLock(runJobUrl);
            }
        }
    }

    /**
     * Remove RunJob lock.
     */
    _removeRunJobLock(runJobUrl)
    {
        this._runJobLocks[runJobUrl] = null;
    }

    /**
     * Handle request RunJobs.
     */
    _handleRequestRunJobs(options)
    {
        this._collection = new RunJobCollection();
        this._collection.fetch(options);
        return this._collection;
    }
}