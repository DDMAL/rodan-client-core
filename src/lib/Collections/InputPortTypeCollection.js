import BaseCollection from './BaseCollection';
import InputPortType from 'lib/Models/InputPortType';

/**
 * Collection of InputPortType models.
 */
export default class InputPortTypeCollection extends BaseCollection
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
        this.model = InputPortType;
        this._route = 'inputporttypes';
    }
}