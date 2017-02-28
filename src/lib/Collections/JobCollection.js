import Radio from 'backbone.radio';
import BaseCollection from './BaseCollection';
import Events from 'lib/Events';
import Job from 'lib/Models/Job';

/**
 * Collection of Job models.
 */
export default class JobCollection extends BaseCollection
{
///////////////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Initializes the instance.
     *
     * @todo currently getting GlobalJobCollection enumerations for these enums; need a better way
     */
    initialize()
    {
        var globalJobCollection = Radio.channel('rodan-client-core').request(Events.REQUEST__GLOBAL_JOB_COLLECTION);
        /** @ignore */
        this.model = Job;
        this._route = 'jobs';
        this._enumerations = globalJobCollection._enumerations;
    }
}