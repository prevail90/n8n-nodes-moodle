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

export class Moodle implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Moodle',
        name: 'moodle',
        icon: 'file:moodle.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Interact with Moodle LMS',
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
                        
                        const body: IDataObject = {
                            users: [{
                                username,
                                password,
                                firstname,
                                lastname,
                                email,
                                ...additionalFields,
                            }],
                        };
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            body,
                            {
                                wsfunction: 'core_user_create_users',
                            }
                        );
                    }
                    
                    if (operation === 'get') {
                        const userId = this.getNodeParameter('userId', i) as string;
                        
                        const body: IDataObject = {
                            field: 'id',
                            values: [userId],
                        };
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            body,
                            {
                                wsfunction: 'core_user_get_users_by_field',
                            }
                        );
                        
                        responseData = responseData[0];
                    }
                    
                    if (operation === 'getAll') {
                        const body: IDataObject = {
                            criteria: [],
                        };
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            body,
                            {
                                wsfunction: 'core_user_get_users',
                            }
                        );
                        
                        responseData = responseData.users;
                    }
                    
                    if (operation === 'update') {
                        const userId = this.getNodeParameter('userId', i) as string;
                        const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
                        
                        const body: IDataObject = {
                            users: [{
                                id: userId,
                                ...additionalFields,
                            }],
                        };
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            body,
                            {
                                wsfunction: 'core_user_update_users',
                            }
                        );
                    }
                    
                    if (operation === 'delete') {
                        const userId = this.getNodeParameter('userId', i) as string;
                        
                        const body: IDataObject = {
                            userids: [userId],
                        };
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            body,
                            {
                                wsfunction: 'core_user_delete_users',
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