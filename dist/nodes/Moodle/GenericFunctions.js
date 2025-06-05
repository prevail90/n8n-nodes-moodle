"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moodleApiRequest = moodleApiRequest;
exports.moodleApiRequestAllItems = moodleApiRequestAllItems;
const n8n_workflow_1 = require("n8n-workflow");
async function moodleApiRequest(method, endpoint, body = {}, qs = {}) {
    var _a;
    const credentials = await this.getCredentials('moodleApi');
    const url = credentials.url;
    const token = credentials.token;
    // Clean up URL - remove trailing slash if present
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const fullUrl = `${cleanUrl}/webservice/rest/server.php`;
    // Combine all parameters
    const allParams = Object.assign(Object.assign({ wstoken: token, moodlewsrestformat: 'json' }, qs), body);
    // Debug: log what we're sending
    console.log('Moodle API Request Parameters:', JSON.stringify(allParams, null, 2));
    // Build form data exactly like curl does
    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(allParams)) {
        formData.append(key, String(value));
    }
    const bodyString = formData.toString();
    console.log('Form data string:', bodyString);
    console.log('Content-Length:', bodyString.length);
    const options = {
        method,
        url: fullUrl,
        body: bodyString,
        timeout: 30000,
        headers: {
            'User-Agent': 'n8n-moodle-node/1.0.0',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': bodyString.length.toString(),
        },
        json: false, // Important: don't let n8n parse as JSON
    };
    try {
        const response = await this.helpers.httpRequest(options);
        // Parse JSON response manually
        let parsedResponse;
        try {
            parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
        }
        catch (parseError) {
            console.log('Failed to parse response:', response);
            throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                message: 'Failed to parse Moodle API response',
                description: `Response was not valid JSON: ${response}`,
            });
        }
        // Check for Moodle API errors
        if (parsedResponse.exception) {
            throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                message: parsedResponse.message || 'Moodle API Error',
                description: `${parsedResponse.debuginfo || ''}\nErrorcode: ${parsedResponse.errorcode || 'Unknown'}`,
                httpCode: parsedResponse.httpCode,
            });
        }
        return parsedResponse;
    }
    catch (error) {
        // Enhanced error handling
        let errorMessage = 'Unknown error occurred';
        let errorDescription = '';
        if (error.code) {
            switch (error.code) {
                case 'ECONNREFUSED':
                    errorMessage = 'Connection refused - Moodle server may be offline or unreachable';
                    errorDescription = `Unable to connect to ${fullUrl}`;
                    break;
                case 'ENOTFOUND':
                    errorMessage = 'Host not found - Invalid URL or DNS issue';
                    errorDescription = `Cannot resolve hostname: ${fullUrl}`;
                    break;
                case 'ETIMEDOUT':
                    errorMessage = 'Connection timeout - Server is not responding';
                    errorDescription = 'Request timed out after 30 seconds';
                    break;
                default:
                    errorMessage = error.message || errorMessage;
                    errorDescription = `Error code: ${error.code}`;
            }
        }
        else if (error.response) {
            errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
            errorDescription = `Response: ${JSON.stringify(error.response.data, null, 2)}`;
        }
        else {
            errorMessage = error.message || errorMessage;
        }
        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
            message: errorMessage,
            description: errorDescription,
            httpCode: (_a = error.response) === null || _a === void 0 ? void 0 : _a.status,
        });
    }
}
async function moodleApiRequestAllItems(method, endpoint, body = {}, qs = {}) {
    return moodleApiRequest.call(this, method, endpoint, body, qs);
}
