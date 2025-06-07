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

    // Clean up URL - remove trailing slash if present
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const fullUrl = `${cleanUrl}/webservice/rest/server.php`;

    // Combine all parameters
    const allParams: IDataObject = {
        wstoken: token,
        moodlewsrestformat: 'json',
        ...qs,
        ...body,
    };

    // Generate request ID for tracking
    const requestId = Math.random().toString(36).substring(7);
    const timestamp = new Date().toISOString();

    // Debug: log what we're sending
    console.log(`[${requestId}] ${timestamp} - Moodle API Request:`, JSON.stringify({
        function: allParams.wsfunction,
        params: Object.keys(allParams).filter(k => k !== 'wstoken').reduce((obj: IDataObject, key) => {
            obj[key] = allParams[key];
            return obj;
        }, {} as IDataObject)
    }, null, 2));

    // Build form data exactly like curl does
    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(allParams)) {
        formData.append(key, String(value));
    }
    
    const bodyString = formData.toString();
    
    const options: IHttpRequestOptions = {
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
        console.log(`[${requestId}] Sending request...`);
        const response = await this.helpers.httpRequest(options);
        console.log(`[${requestId}] Received response`);
        
        // Parse JSON response manually
        let parsedResponse;
        try {
            parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
        } catch (parseError) {
            console.log(`[${requestId}] Failed to parse response as JSON:`, response);
            
            // Check if the response is an error message string
            if (typeof response === 'string' && response.includes('is already used for another')) {
                throw new NodeApiError(this.getNode(), {
                    message: 'Moodle API Error',
                    description: response,
                });
            }
            
            throw new NodeApiError(this.getNode(), {
                message: 'Failed to parse Moodle API response',
                description: `Response was not valid JSON: ${response}`,
            });
        }
        
        // Log the full response for debugging
        console.log(`[${requestId}] Moodle API Response:`, JSON.stringify(parsedResponse, null, 2));
        
        // Check for null response (common for successful delete operations)
        if (parsedResponse === null || parsedResponse === undefined) {
            console.log(`[${requestId}] Received null/undefined response - treating as success`);
            return parsedResponse;
        }
        
        // Check for Moodle API errors only if response is not null
        if (parsedResponse && typeof parsedResponse === 'object' && parsedResponse.exception) {
            console.log(`[${requestId}] Moodle API Error detected`);
            throw new NodeApiError(this.getNode(), {
                message: parsedResponse.message || 'Moodle API Error',
                description: `${parsedResponse.debuginfo || ''}\nErrorcode: ${parsedResponse.errorcode || 'Unknown'}`,
                httpCode: parsedResponse.httpCode,
            });
        }
        
        // Check for warnings in successful responses
        if (parsedResponse && parsedResponse.warnings && Array.isArray(parsedResponse.warnings)) {
            console.log(`[${requestId}] Moodle API Warnings:`, parsedResponse.warnings);
            // Don't throw error for warnings, just log them
        }
        
        console.log(`[${requestId}] Request completed successfully`);
        return parsedResponse;
    } catch (error: any) {
        // If it's already a NodeApiError, just re-throw it
        if (error instanceof NodeApiError) {
            throw error;
        }
        
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
        } else if (error.response) {
            errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
            errorDescription = `Response: ${JSON.stringify(error.response.data, null, 2)}`;
        } else {
            errorMessage = error.message || errorMessage;
        }

        throw new NodeApiError(this.getNode(), {
            message: errorMessage,
            description: errorDescription,
            httpCode: error.response?.status,
        });
    }
}

export async function moodleApiRequestAllItems(
    this: IExecuteFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body: IDataObject = {},
    qs: IDataObject = {},
): Promise<any> {
    return moodleApiRequest.call(this, method, endpoint, body, qs);
}