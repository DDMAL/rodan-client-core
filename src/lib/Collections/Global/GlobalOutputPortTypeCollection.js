import GlobalCollection from './GlobalCollection';
import Events from 'lib/Events';
import OutputPortType from 'lib/Models/OutputPortType';

let _instance = null;

/**
 * Global Collection of OutputPortType models.
 * This uses a pseudo-singleton model so we can inherit from BaseCollection.
 */
export default class GlobalOutputPortTypeCollection extends GlobalCollection
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
        this.model = OutputPortType;
        this._route = 'outputporttypes';
        this._loadCommand = Events.REQUEST__GLOBAL_OUTPUTPORTTYPES_LOAD;
        this._requestCommand = Events.REQUEST__GLOBAL_OUTPUTPORTTYPE_COLLECTION;
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