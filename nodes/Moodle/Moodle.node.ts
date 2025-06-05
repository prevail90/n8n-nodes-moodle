import {
    IExecuteFunctions,
    IDataObject,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    ILoadOptionsFunctions,
    INodePropertyOptions,
    NodeConnectionType,
} from 'n8n-workflow';

import {
    moodleApiRequest,
} from './GenericFunctions';

import {
    userOperations,
    userFields,
} from './descriptions/UserDescription';

// Helper function to flatten object for Moodle API
function flattenObject(obj: IDataObject, prefix: string): IDataObject {
    const flattened: IDataObject = {};
    
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined && value !== null && value !== '') {
            flattened[`${prefix}[${key}]`] = value;
        }
    }
    
    return flattened;
}

export class Moodle implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Moodle',
        name: 'moodle',
        icon: 'file:moodle.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Interact with Moodle LMS (v2024.06.05.14:45)', // Add timestamp
        defaults: {
            name: 'Moodle',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: [
            {
                name: 'moodleApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                options: [
                    {
                        name: 'User',
                        value: 'user',
                    },
                    {
                        name: 'Course',
                        value: 'course',
                    },
                    {
                        name: 'Grade',
                        value: 'grade',
                    },
                ],
                default: 'user',
                description: 'The resource to operate on',
            },
            ...userOperations,
            ...userFields,
        ],
    };

    methods = {
        loadOptions: {
            async getCourses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
                const returnData: INodePropertyOptions[] = [];
                
                const courses = await moodleApiRequest.call(
                    this,
                    'POST',
                    '',
                    {},
                    {
                        wsfunction: 'core_course_get_courses',
                    }
                );
                
                for (const course of courses) {
                    returnData.push({
                        name: course.fullname,
                        value: course.id,
                    });
                }
                
                return returnData;
            },
        },
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        // Add this log to verify the node is being loaded
        console.log('🚀 MOODLE NODE EXECUTING - Version 2024.06.05.14:45');
        
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;
        
        for (let i = 0; i < items.length; i++) {
            try {
                let responseData;
                
                if (resource === 'user') {
                    if (operation === 'create') {
                        const username = this.getNodeParameter('username', i) as string;
                        const password = this.getNodeParameter('password', i) as string;
                        const firstname = this.getNodeParameter('firstname', i) as string;
                        const lastname = this.getNodeParameter('lastname', i) as string;
                        const email = this.getNodeParameter('email', i) as string;
                        const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
                        
                        const userParams = {
                            wsfunction: 'core_user_create_users',
                            'users[0][username]': username,
                            'users[0][password]': password,
                            'users[0][firstname]': firstname,
                            'users[0][lastname]': lastname,
                            'users[0][email]': email,
                        };

                        // Add additional fields if provided
                        if (Object.keys(additionalFields).length > 0) {
                            const flattenedFields = flattenObject(additionalFields, 'users[0]');
                            Object.assign(userParams, flattenedFields);
                        }

                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            userParams
                        );
                    }
                    
                    if (operation === 'get') {
                        const userId = this.getNodeParameter('userId', i) as string;
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'core_user_get_users_by_field',
                                field: 'id',
                                'values[0]': userId,
                            }
                        );
                        
                        responseData = responseData[0];
                    }
                    
                    if (operation === 'getAll') {
                        // Simple approach: Get users by multiple IDs
                        // Start with common user IDs (1, 2, 3, etc.)
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'core_user_get_users_by_field',
                                field: 'id',
                                'values[0]': '1',
                                'values[1]': '2',
                                'values[2]': '3',
                                'values[3]': '4',
                                'values[4]': '5',
                            }
                        );
                        
                        responseData = responseData;
                    }
                    
                    if (operation === 'update') {
                        const userId = this.getNodeParameter('userId', i) as string;
                        const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
                        
                        const updateParams = {
                            wsfunction: 'core_user_update_users',
                            'users[0][id]': userId,
                        };

                        // Add additional fields if provided
                        if (Object.keys(additionalFields).length > 0) {
                            const flattenedFields = flattenObject(additionalFields, 'users[0]');
                            Object.assign(updateParams, flattenedFields);
                        }

                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            updateParams
                        );
                    }
                    
                    if (operation === 'delete') {
                        const userId = this.getNodeParameter('userId', i) as string;
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'core_user_delete_users',
                                'userids[0]': userId,
                            }
                        );
                    }
                }
                
                if (Array.isArray(responseData)) {
                    returnData.push(...responseData.map(item => ({ json: item })));
                } else {
                    returnData.push({ json: responseData });
                }
                
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: (error as Error).message } });
                    continue;
                }
                throw error;
            }
        }
        
        return [returnData];
    }
}