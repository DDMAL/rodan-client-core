import GlobalCollection from './GlobalCollection';
import Events from 'lib/Events';
import Job from 'lib/Models/Job';

let _instance = null;

/**
 * Global Collection of Job models.
 * This uses a pseudo-singleton model so we can inherit from BaseCollection.
 */
export default class GlobalJobCollection extends GlobalCollection
{
///////////////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Initializes the instance.
     *
     * @throws {Error} thrown iff called more than once
     */
    initialize()
    {
        if (_instance)
        {
            throw new Error('only one instance of this class may exist');
        }
        _instance = this;
        /** @ignore */
        this.model = Job;
        this._route = 'jobs';
        this._loadCommand = Events.REQUEST__GLOBAL_JOBS_LOAD;
        this._requestCommand = Events.REQUEST__GLOBAL_JOB_COLLECTION;
        this._enumerations = new Map();
        this._enumerations.set('category', {label: 'Category'});
        this._enumerations.set('interactive', {label: 'Interactive', values: [{value: 'True', label: 'True'}, {value: 'False', label: 'False'}]});
    }

    /**
     * Nullifies singleton instance.
     */
    deinitialize()
    {
        if (_instance)
        {
            _instance = null;
        }
    }
}