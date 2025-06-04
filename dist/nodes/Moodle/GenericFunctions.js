"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moodleApiRequest = moodleApiRequest;
exports.moodleApiRequestAllItems = moodleApiRequestAllItems;
const n8n_workflow_1 = require("n8n-workflow");
async function moodleApiRequest(method, endpoint, body = {}, qs = {}) {
    const credentials = await this.getCredentials('moodleApi');
    const url = credentials.url;
    const token = credentials.token;
    const options = {
        method,
        url: `${url}/webservice/rest/server.php`,
        qs: {
            wstoken: token,
            moodlewsrestformat: 'json',
            ...qs,
        },
        body,
        json: true,
    };
    try {
        const response = await this.helpers.httpRequest(options);
        if (response.exception) {
            throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                message: response.message || 'An error occurred',
                description: response.debuginfo,
            });
        }
        return response;
    }
    catch (error) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
    }
}
async function moodleApiRequestAllItems(method, endpoint, body = {}, qs = {}) {
    return moodleApiRequest.call(this, method, endpoint, body, qs);
}
//# sourceMappingURL=GenericFunctions.js.map