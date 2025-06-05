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
        description: 'Interact with Moodle LMS - Complete Integration (v2024.06.05.15:00)',
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
            // Resource Selection
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
                        name: 'Enrollment',
                        value: 'enrollment',
                    },
                    {
                        name: 'Grade',
                        value: 'grade',
                    },
                    {
                        name: 'Message',
                        value: 'message',
                    },
                ],
                default: 'user',
                description: 'The resource to operate on',
            },

            // USER OPERATIONS
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['user'],
                    },
                },
                options: [
                    {
                        name: 'Create',
                        value: 'create',
                        description: 'Create a new user',
                    },
                    {
                        name: 'Get',
                        value: 'get',
                        description: 'Get a user by ID',
                    },
                    {
                        name: 'Get All',
                        value: 'getAll',
                        description: 'Get multiple users',
                    },
                    {
                        name: 'Update',
                        value: 'update',
                        description: 'Update a user',
                    },
                    {
                        name: 'Delete',
                        value: 'delete',
                        description: 'Delete a user',
                    },
                ],
                default: 'get',
                description: 'The operation to perform on users',
            },

            // COURSE OPERATIONS
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['course'],
                    },
                },
                options: [
                    {
                        name: 'Create',
                        value: 'create',
                        description: 'Create a new course',
                    },
                    {
                        name: 'Get',
                        value: 'get',
                        description: 'Get a course by ID',
                    },
                    {
                        name: 'Get All',
                        value: 'getAll',
                        description: 'Get all courses',
                    },
                    {
                        name: 'Update',
                        value: 'update',
                        description: 'Update a course',
                    },
                    {
                        name: 'Delete',
                        value: 'delete',
                        description: 'Delete a course',
                    },
                    {
                        name: 'Get Enrolled Users',
                        value: 'getEnrolledUsers',
                        description: 'Get users enrolled in course',
                    },
                    {
                        name: 'Get Categories',
                        value: 'getCategories',
                        description: 'Get course categories',
                    },
                ],
                default: 'getAll',
                description: 'The operation to perform on courses',
            },

            // ENROLLMENT OPERATIONS
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['enrollment'],
                    },
                },
                options: [
                    {
                        name: 'Enroll User',
                        value: 'enroll',
                        description: 'Enroll user in course',
                    },
                    {
                        name: 'Unenroll User',
                        value: 'unenroll',
                        description: 'Remove user from course',
                    },
                    {
                        name: 'Get User Courses',
                        value: 'getUserCourses',
                        description: 'Get courses user is enrolled in',
                    },
                    {
                        name: 'Get Course Users',
                        value: 'getCourseUsers',
                        description: 'Get users enrolled in course',
                    },
                ],
                default: 'enroll',
                description: 'The operation to perform on enrollments',
            },

            // GRADE OPERATIONS
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['grade'],
                    },
                },
                options: [
                    {
                        name: 'Get User Grades',
                        value: 'getUserGrades',
                        description: 'Get grades for a user',
                    },
                    {
                        name: 'Get Course Grades',
                        value: 'getCourseGrades',
                        description: 'Get all grades for a course',
                    },
                    {
                        name: 'Get Grade Items',
                        value: 'getGradeItems',
                        description: 'Get gradebook structure',
                    },
                ],
                default: 'getUserGrades',
                description: 'The operation to perform on grades',
            },

            // MESSAGE OPERATIONS
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['message'],
                    },
                },
                options: [
                    {
                        name: 'Send Message',
                        value: 'send',
                        description: 'Send message to user',
                    },
                    {
                        name: 'Get Messages',
                        value: 'getMessages',
                        description: 'Get user messages',
                    },
                ],
                default: 'send',
                description: 'The operation to perform on messages',
            },

            // USER FIELDS
            {
                displayName: 'User ID',
                name: 'userId',
                type: 'number',
                displayOptions: {
                    show: {
                        resource: ['user'],
                        operation: ['get', 'update', 'delete'],
                    },
                },
                default: '',
                required: true,
                description: 'The user ID',
            },
            {
                displayName: 'Username',
                name: 'username',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['user'],
                        operation: ['create'],
                    },
                },
                default: '',
                required: true,
                description: 'Username for the new user',
            },
            {
                displayName: 'Password',
                name: 'password',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                displayOptions: {
                    show: {
                        resource: ['user'],
                        operation: ['create'],
                    },
                },
                default: '',
                required: true,
                description: 'Password for the new user',
            },
            {
                displayName: 'First Name',
                name: 'firstname',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['user'],
                        operation: ['create'],
                    },
                },
                default: '',
                required: true,
                description: 'First name of the user',
            },
            {
                displayName: 'Last Name',
                name: 'lastname',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['user'],
                        operation: ['create'],
                    },
                },
                default: '',
                required: true,
                description: 'Last name of the user',
            },
            {
                displayName: 'Email',
                name: 'email',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['user'],
                        operation: ['create'],
                    },
                },
                default: '',
                required: true,
                description: 'Email address of the user',
            },

            // COURSE FIELDS
            {
                displayName: 'Course ID',
                name: 'courseId',
                type: 'number',
                displayOptions: {
                    show: {
                        resource: ['course'],
                        operation: ['get', 'update', 'delete', 'getEnrolledUsers'],
                    },
                },
                default: '',
                required: true,
                description: 'The course ID',
            },
            {
                displayName: 'Course Name',
                name: 'fullname',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['course'],
                        operation: ['create', 'update'],
                    },
                },
                default: '',
                required: true,
                description: 'Full course name',
            },
            {
                displayName: 'Short Name',
                name: 'shortname',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['course'],
                        operation: ['create', 'update'],
                    },
                },
                default: '',
                required: true,
                description: 'Course short name (unique identifier)',
            },
            {
                displayName: 'Category ID',
                name: 'categoryid',
                type: 'number',
                displayOptions: {
                    show: {
                        resource: ['course'],
                        operation: ['create', 'update'],
                    },
                },
                default: 1,
                description: 'Course category ID',
            },

            // ENROLLMENT FIELDS
            {
                displayName: 'User ID',
                name: 'enrollUserId',
                type: 'number',
                displayOptions: {
                    show: {
                        resource: ['enrollment'],
                        operation: ['enroll', 'unenroll', 'getUserCourses'],
                    },
                },
                default: '',
                required: true,
                description: 'User ID for enrollment',
            },
            {
                displayName: 'Course ID',
                name: 'enrollCourseId',
                type: 'number',
                displayOptions: {
                    show: {
                        resource: ['enrollment'],
                        operation: ['enroll', 'unenroll', 'getCourseUsers'],
                    },
                },
                default: '',
                required: true,
                description: 'Course ID for enrollment',
            },
            {
                displayName: 'Role',
                name: 'roleId',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['enrollment'],
                        operation: ['enroll'],
                    },
                },
                options: [
                    {
                        name: 'Student',
                        value: 5,
                    },
                    {
                        name: 'Teacher',
                        value: 3,
                    },
                    {
                        name: 'Manager',
                        value: 1,
                    },
                    {
                        name: 'Course Creator',
                        value: 2,
                    },
                ],
                default: 5,
                description: 'Role to assign to user',
            },

            // GRADE FIELDS
            {
                displayName: 'User ID',
                name: 'gradeUserId',
                type: 'number',
                displayOptions: {
                    show: {
                        resource: ['grade'],
                        operation: ['getUserGrades'],
                    },
                },
                default: '',
                required: true,
                description: 'User ID to get grades for',
            },
            {
                displayName: 'Course ID',
                name: 'gradeCourseId',
                type: 'number',
                displayOptions: {
                    show: {
                        resource: ['grade'],
                        operation: ['getCourseGrades', 'getGradeItems'],
                    },
                },
                default: '',
                required: true,
                description: 'Course ID to get grades for',
            },

            // MESSAGE FIELDS
            {
                displayName: 'To User ID',
                name: 'messageToUserId',
                type: 'number',
                displayOptions: {
                    show: {
                        resource: ['message'],
                        operation: ['send'],
                    },
                },
                default: '',
                required: true,
                description: 'User ID to send message to',
            },
            {
                displayName: 'Message Text',
                name: 'messageText',
                type: 'string',
                typeOptions: {
                    rows: 4,
                },
                displayOptions: {
                    show: {
                        resource: ['message'],
                        operation: ['send'],
                    },
                },
                default: '',
                required: true,
                description: 'Message content',
            },
            {
                displayName: 'User ID',
                name: 'messageUserId',
                type: 'number',
                displayOptions: {
                    show: {
                        resource: ['message'],
                        operation: ['getMessages'],
                    },
                },
                default: '',
                required: true,
                description: 'User ID to get messages for',
            },

            // ADDITIONAL FIELDS
            {
                displayName: 'Additional Fields',
                name: 'additionalFields',
                type: 'collection',
                placeholder: 'Add Field',
                default: {},
                displayOptions: {
                    show: {
                        resource: ['user', 'course'],
                        operation: ['create', 'update'],
                    },
                },
                options: [
                    {
                        displayName: 'Description',
                        name: 'description',
                        type: 'string',
                        default: '',
                        description: 'Description field',
                    },
                    {
                        displayName: 'Department',
                        name: 'department',
                        type: 'string',
                        default: '',
                        description: 'Department field',
                    },
                ],
            },
        ],
    };

    methods = {
        loadOptions: {
            async getCourses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
                const returnData: INodePropertyOptions[] = [];
                
                try {
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
                } catch (error) {
                    // Return empty array if courses can't be loaded
                }
                
                return returnData;
            },
        },
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        console.log('🚀 MOODLE NODE EXECUTING - Version 2024.06.05.15:00 - COMPREHENSIVE');
        
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;
        
        for (let i = 0; i < items.length; i++) {
            try {
                let responseData;
                
                // USER OPERATIONS
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

                        if (Object.keys(additionalFields).length > 0) {
                            const flattenedFields = flattenObject(additionalFields, 'users[0]');
                            Object.assign(userParams, flattenedFields);
                        }

                        responseData = await moodleApiRequest.call(this, 'POST', '', {}, userParams);
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
                    }
                    
                    if (operation === 'update') {
                        const userId = this.getNodeParameter('userId', i) as string;
                        const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
                        
                        const updateParams = {
                            wsfunction: 'core_user_update_users',
                            'users[0][id]': userId,
                        };

                        if (Object.keys(additionalFields).length > 0) {
                            const flattenedFields = flattenObject(additionalFields, 'users[0]');
                            Object.assign(updateParams, flattenedFields);
                        }

                        responseData = await moodleApiRequest.call(this, 'POST', '', {}, updateParams);
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

                // COURSE OPERATIONS
                if (resource === 'course') {
                    if (operation === 'create') {
                        const fullname = this.getNodeParameter('fullname', i) as string;
                        const shortname = this.getNodeParameter('shortname', i) as string;
                        const categoryid = this.getNodeParameter('categoryid', i) as number;
                        const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
                        
                        const courseParams = {
                            wsfunction: 'core_course_create_courses',
                            'courses[0][fullname]': fullname,
                            'courses[0][shortname]': shortname,
                            'courses[0][categoryid]': categoryid,
                        };

                        if (Object.keys(additionalFields).length > 0) {
                            const flattenedFields = flattenObject(additionalFields, 'courses[0]');
                            Object.assign(courseParams, flattenedFields);
                        }

                        responseData = await moodleApiRequest.call(this, 'POST', '', {}, courseParams);
                    }
                    
                    if (operation === 'get') {
                        const courseId = this.getNodeParameter('courseId', i) as string;
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'core_course_get_course_by_field',
                                field: 'id',
                                'values[0]': courseId,
                            }
                        );
                        
                        responseData = responseData[0];
                    }
                    
                    if (operation === 'getAll') {
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'core_course_get_courses',
                            }
                        );
                    }
                    
                    if (operation === 'update') {
                        const courseId = this.getNodeParameter('courseId', i) as string;
                        const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
                        
                        const updateParams = {
                            wsfunction: 'core_course_update_courses',
                            'courses[0][id]': courseId,
                        };

                        if (Object.keys(additionalFields).length > 0) {
                            const flattenedFields = flattenObject(additionalFields, 'courses[0]');
                            Object.assign(updateParams, flattenedFields);
                        }

                        responseData = await moodleApiRequest.call(this, 'POST', '', {}, updateParams);
                    }
                    
                    if (operation === 'delete') {
                        const courseId = this.getNodeParameter('courseId', i) as string;
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'core_course_delete_courses',
                                'courseids[0]': courseId,
                            }
                        );
                    }
                    
                    if (operation === 'getEnrolledUsers') {
                        const courseId = this.getNodeParameter('courseId', i) as string;
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'core_course_get_enrolled_users',
                                courseid: courseId,
                            }
                        );
                    }
                    
                    if (operation === 'getCategories') {
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'core_course_get_categories',
                            }
                        );
                    }
                }

                // ENROLLMENT OPERATIONS
                if (resource === 'enrollment') {
                    if (operation === 'enroll') {
                        const userId = this.getNodeParameter('enrollUserId', i) as string;
                        const courseId = this.getNodeParameter('enrollCourseId', i) as string;
                        const roleId = this.getNodeParameter('roleId', i) as number;
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'enrol_manual_enrol_users',
                                'enrolments[0][userid]': userId,
                                'enrolments[0][courseid]': courseId,
                                'enrolments[0][roleid]': roleId,
                            }
                        );
                    }
                    
                    if (operation === 'unenroll') {
                        const userId = this.getNodeParameter('enrollUserId', i) as string;
                        const courseId = this.getNodeParameter('enrollCourseId', i) as string;
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'enrol_manual_unenrol_users',
                                'enrolments[0][userid]': userId,
                                'enrolments[0][courseid]': courseId,
                            }
                        );
                    }
                    
                    if (operation === 'getUserCourses') {
                        const userId = this.getNodeParameter('enrollUserId', i) as string;
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'core_enrol_get_users_courses',
                                userid: userId,
                            }
                        );
                    }
                    
                    if (operation === 'getCourseUsers') {
                        const courseId = this.getNodeParameter('enrollCourseId', i) as string;
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'core_enrol_get_enrolled_users',
                                courseid: courseId,
                            }
                        );
                    }
                }

                // GRADE OPERATIONS
                if (resource === 'grade') {
                    if (operation === 'getUserGrades') {
                        const userId = this.getNodeParameter('gradeUserId', i) as string;
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'core_grades_get_grades',
                                userid: userId,
                            }
                        );
                    }
                    
                    if (operation === 'getCourseGrades') {
                        const courseId = this.getNodeParameter('gradeCourseId', i) as string;
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'gradereport_overview_get_course_grades',
                                courseid: courseId,
                            }
                        );
                    }
                    
                    if (operation === 'getGradeItems') {
                        const courseId = this.getNodeParameter('gradeCourseId', i) as string;
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'core_grade_get_grade_items',
                                courseid: courseId,
                            }
                        );
                    }
                }

                // MESSAGE OPERATIONS
                if (resource === 'message') {
                    if (operation === 'send') {
                        const toUserId = this.getNodeParameter('messageToUserId', i) as string;
                        const messageText = this.getNodeParameter('messageText', i) as string;
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'core_message_send_instant_messages',
                                'messages[0][touserid]': toUserId,
                                'messages[0][text]': messageText,
                            }
                        );
                    }
                    
                    if (operation === 'getMessages') {
                        const userId = this.getNodeParameter('messageUserId', i) as string;
                        
                        responseData = await moodleApiRequest.call(
                            this,
                            'POST',
                            '',
                            {},
                            {
                                wsfunction: 'core_message_get_messages',
                                useridto: userId,
                                limitfrom: 0,
                                limitnum: 20,
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