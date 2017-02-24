import BaseCollection from './BaseCollection';
import Connection from 'lib/Models/Connection';

/**
 * Collection of Connection models.
 */
export default class ConnectionCollection extends BaseCollection
{
    /**
     * Initializes the instance.
     */
    initialize()
    {
        /** @ignore */
        this.model = Connection;
        this._route = 'connections';
    }
}