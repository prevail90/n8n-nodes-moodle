import {
    IExecuteFunctions,
    IHookFunctions,
    ILoadOptionsFunctions,
    IWebhookFunctions,
} from 'n8n-workflow';

import {
    IDataObject,
    IHttpRequestOptions,
    IHttpRequestMethods,
    NodeApiError,
} from 'n8n-workflow';

export async function moodleApiRequest(
    this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body: IDataObject = {},
    qs: IDataObject = {},
): Promise<any> {
    const credentials = await this.getCredentials('moodleApi');
    const url = credentials.url as string;
    const token = credentials.token as string;

    const options: IHttpRequestOptions = {
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
        
        // Check for Moodle API errors
        if (response.exception) {
            throw new NodeApiError(this.getNode(), {
                message: response.message || 'An error occurred',
                description: response.debuginfo,
            });
        }
        
        return response;
    } catch (error) {
        throw new NodeApiError(this.getNode(), error as any);
    }
}

export async function moodleApiRequestAllItems(
    this: IExecuteFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body: IDataObject = {},
    qs: IDataObject = {},
): Promise<any> {
    // Moodle doesn't have built-in pagination for most endpoints
    // This is a placeholder for endpoints that might need it
    return moodleApiRequest.call(this, method, endpoint, body, qs);
}
