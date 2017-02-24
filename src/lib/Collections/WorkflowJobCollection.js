import BaseCollection from './BaseCollection';
import WorkflowJob from 'lib/Models/WorkflowJob';

/**
 * Collection of WorkflowJob models.
 */
export default class WorkflowJobCollection extends BaseCollection
{
///////////////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Initializes the instance.
     */
    initialize()
    {
        /** @ignore */
        this.model = WorkflowJob;
        this._route = 'workflowjobs';
    }
}