"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Moodle = void 0;
const GenericFunctions_1 = require("./GenericFunctions");
const UserDescription_1 = require("./descriptions/UserDescription");
class Moodle {
    constructor() {
        this.description = {
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
            inputs: ["main"],
            outputs: ["main"],
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
                ...UserDescription_1.userOperations,
                ...UserDescription_1.userFields,
            ],
        };
        this.methods = {
            loadOptions: {
                async getCourses() {
                    const returnData = [];
                    const courses = await GenericFunctions_1.moodleApiRequest.call(this, 'POST', '', {}, {
                        wsfunction: 'core_course_get_courses',
                    });
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
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        for (let i = 0; i < items.length; i++) {
            try {
                let responseData;
                if (resource === 'user') {
                    if (operation === 'create') {
                        const username = this.getNodeParameter('username', i);
                        const password = this.getNodeParameter('password', i);
                        const firstname = this.getNodeParameter('firstname', i);
                        const lastname = this.getNodeParameter('lastname', i);
                        const email = this.getNodeParameter('email', i);
                        const additionalFields = this.getNodeParameter('additionalFields', i);
                        const body = {
                            users: [{
                                    username,
                                    password,
                                    firstname,
                                    lastname,
                                    email,
                                    ...additionalFields,
                                }],
                        };
                        responseData = await GenericFunctions_1.moodleApiRequest.call(this, 'POST', '', body, {
                            wsfunction: 'core_user_create_users',
                        });
                    }
                    if (operation === 'get') {
                        const userId = this.getNodeParameter('userId', i);
                        const body = {
                            field: 'id',
                            values: [userId],
                        };
                        responseData = await GenericFunctions_1.moodleApiRequest.call(this, 'POST', '', body, {
                            wsfunction: 'core_user_get_users_by_field',
                        });
                        responseData = responseData[0];
                    }
                    if (operation === 'getAll') {
                        const body = {
                            criteria: [],
                        };
                        responseData = await GenericFunctions_1.moodleApiRequest.call(this, 'POST', '', body, {
                            wsfunction: 'core_user_get_users',
                        });
                        responseData = responseData.users;
                    }
                    if (operation === 'update') {
                        const userId = this.getNodeParameter('userId', i);
                        const additionalFields = this.getNodeParameter('additionalFields', i);
                        const body = {
                            users: [{
                                    id: userId,
                                    ...additionalFields,
                                }],
                        };
                        responseData = await GenericFunctions_1.moodleApiRequest.call(this, 'POST', '', body, {
                            wsfunction: 'core_user_update_users',
                        });
                    }
                    if (operation === 'delete') {
                        const userId = this.getNodeParameter('userId', i);
                        const body = {
                            userids: [userId],
                        };
                        responseData = await GenericFunctions_1.moodleApiRequest.call(this, 'POST', '', body, {
                            wsfunction: 'core_user_delete_users',
                        });
                    }
                }
                if (Array.isArray(responseData)) {
                    returnData.push(...responseData.map(item => ({ json: item })));
                }
                else {
                    returnData.push({ json: responseData });
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.Moodle = Moodle;
//# sourceMappingURL=Moodle.node.js.map