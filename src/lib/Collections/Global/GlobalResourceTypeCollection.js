import GlobalCollection from './GlobalCollection';
import Events from 'lib/Events';
import ResourceType from 'lib/Models/ResourceType';

let _instance = null;

/**
 * Global Collection of ResourceType models.
 * This uses a pseudo-singleton model so we can inherit from BaseCollection.
 */
export default class GlobalResourceTypeCollection extends GlobalCollection
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
        this.model = ResourceType;
        this._route = 'resourcetypes';
        this._loadCommand = Events.REQUEST__GLOBAL_RESOURCETYPES_LOAD;
        this._requestCommand = Events.REQUEST__GLOBAL_RESOURCETYPE_COLLECTION;
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