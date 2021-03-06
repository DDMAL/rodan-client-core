import GlobalCollection from './GlobalCollection';
import Events from 'lib/Events';
import Project from 'lib/Models/Project';

let _instance = null;

/**
 * Global Collection of Project models.
 * This uses a pseudo-singleton model so we can inherit from BaseCollection.
 */
export default class GlobalProjectCollection extends GlobalCollection
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
        this.model = Project;
        this._route = 'projects';
        this._allowPagination = true;
        this._loadCommand = Events.REQUEST__GLOBAL_PROJECTS_LOAD;
        this._requestCommand = Events.REQUEST__GLOBAL_PROJECT_COLLECTION;
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