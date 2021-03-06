import BaseCollection from './BaseCollection';
import ResourceList from 'lib/Models/ResourceList';

/**
 * Collection of ResourceList models.
 */
export default class ResourceListCollection extends BaseCollection
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
        this.model = ResourceList;
        this._route = 'resourcelists';
    }
}