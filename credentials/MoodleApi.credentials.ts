import {
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class MoodleApi implements ICredentialType {
    name = 'moodleApi';
    displayName = 'Moodle API';
    documentationUrl = 'https://github.com/threatroute66/n8n-nodes-moodle';
    properties: INodeProperties[] = [
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
