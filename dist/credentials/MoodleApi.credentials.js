"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoodleApi = void 0;
class MoodleApi {
    constructor() {
        this.name = 'moodleApi';
        this.displayName = 'Moodle API';
        this.documentationUrl = 'https://github.com/threatroute66/n8n-nodes-moodle';
        this.properties = [
            {
                displayName: 'Moodle URL',
                name: 'url',
                type: 'string',
                default: '',
                placeholder: 'https://your-moodle-site.com',
                description: 'The URL of your Moodle instance',
                required: true,
            },
            {
                displayName: 'Web Service Token',
                name: 'token',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                description: 'The web service token for authentication',
                required: true,
            },
        ];
    }
}
exports.MoodleApi = MoodleApi;
