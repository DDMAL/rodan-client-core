import $ from 'jquery';
import BaseController from 'core/Controllers/BaseController';
import Configuration from 'core/Configuration';
import FileSaver from 'file-saver';
import Radio from 'backbone.radio';
import RODAN_EVENTS from 'lib/Shared/RODAN_EVENTS';

/**
 * Download controller.
 */
export default class ControllerDownload extends BaseController
{
///////////////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Initializes the instance.
     */
    initialize()
    {
    }

///////////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS
///////////////////////////////////////////////////////////////////////////////////////
    /**
     * Event bindings.
     */
    _initializeRadio()
    {
        Radio.channel('rodan-client-core').reply(RODAN_EVENTS.REQUEST__DOWNLOAD_START, (options) => this._handleRequestDownloadStart(options));
    }

    /**
     * Handle download start.
     */
    _handleRequestDownloadStart(options)
    {
        var data = options.data;
        var filename = options.filename;
        var mimetype = options.mimetype;
        var blob = new Blob([data], {type: mimetype});
        FileSaver.saveAs(blob, filename);
    }
}