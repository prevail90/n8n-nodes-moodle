/*
 * Moodle.node.ts — updated to support updating user firstname, lastname, and ANY custom profile fields
 *
 * Tested against n8n v1.108.2 node typing (declarative-style compatible props) and Moodle REST web services.
 *
 * Adds a new Users → Update operation that calls `core_user_update_users`.
 * You can update any top-level profile field Moodle accepts (firstname, lastname, email, etc.)
 * and any custom profile field via a dedicated collection in the UI (shortname + value),
 * or by passing raw JSON if you prefer.
 */

import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import type { OptionsWithUri } from 'request';

/**
 * Minimal credential definition expected:
 *   name: 'moodleApi'
 *   properties: { baseUrl: string; token: string }
 *
 * If your project uses a different credential name/shape, adjust `getCredentials` and/or
 * rename this.credentials property below to match your setup.
 */

type MoodleCredentials = {
	baseUrl: string;
	token: string;
};

/** Utility: perform a Moodle REST API request */
async function moodleRequest(
	that: IExecuteFunctions,
	method: 'GET' | 'POST',
	endpoint: string, // e.g. '/webservice/rest/server.php'
	qs: IDataObject = {},
	body: IDataObject = {},
): Promise<any> {
	const creds = (await that.getCredentials('moodleApi')) as MoodleCredentials | undefined;
	if (!creds?.baseUrl || !creds?.token) {
		throw new NodeOperationError(that.getNode(), 'Moodle credentials not found. Please configure credentials named "moodleApi" with base URL and token.');
	}

	const uri = `${creds.baseUrl.replace(/\/$/, '')}${endpoint}`;

	const options: OptionsWithUri = {
		method,
		uri,
		qs: {
			moodlewsrestformat: 'json',
			wstoken: creds.token,
			...qs,
		},
		json: true,
		body: method === 'POST' ? body : undefined,
	};

	// n8n's request helper
	return await that.helpers.request!(options);
}

export class Moodle implements INodeType {
	/** Node description */
	description: INodeTypeDescription = {
		displayName: 'Moodle',
		name: 'moodle',
		icon: 'file:moodle.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with Moodle web services',
		defaults: {
			name: 'Moodle',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'moodleApi',
				required: true,
			},
		],
		properties: [
			/**
			 * RESOURCE
			 */
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'user',
			},

			/**
			 * OPERATION
			 */
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
					{ name: 'Get Many', value: 'getMany', description: 'List users (search by query)' },
					{ name: 'Get by ID', value: 'get', description: 'Retrieve a single user by ID' },
					{ name: 'Create', value: 'create', description: 'Create a Moodle user' },
					{ name: 'Update', value: 'update', description: 'Update a user including ANY custom profile fields' },
				],
				default: 'getMany',
			},

			/**
			 * GET MANY
			 */
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				placeholder: 'search text, username, email, etc.',
				description: 'Search query for users',
				displayOptions: { show: { resource: ['user'], operation: ['getMany'] } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				minValue: 1,
				maxValue: 200,
				displayOptions: { show: { resource: ['user'], operation: ['getMany'] } },
			},

			/**
			 * GET BY ID
			 */
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'number',
				default: 0,
				required: true,
				description: 'Numeric ID of the user',
				displayOptions: { show: { resource: ['user'], operation: ['get'] } },
			},

			/**
			 * CREATE
			 */
			{
				displayName: 'Username',
				name: 'username',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['user'], operation: ['create'] } },
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				required: true,
				displayOptions: { show: { resource: ['user'], operation: ['create'] } },
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['user'], operation: ['create'] } },
			},
			{
				displayName: 'First Name',
				name: 'firstname',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['user'], operation: ['create'] } },
			},
			{
				displayName: 'Last Name',
				name: 'lastname',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['user'], operation: ['create'] } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add field',
				default: {},
				displayOptions: { show: { resource: ['user'], operation: ['create'] } },
				options: [
					{ displayName: 'City', name: 'city', type: 'string', default: '' },
					{ displayName: 'Country', name: 'country', type: 'string', default: '' },
					{ displayName: 'Auth', name: 'auth', type: 'string', default: 'manual' },
					{ displayName: 'Lang', name: 'lang', type: 'string', default: '' },
					{ displayName: 'Suspended', name: 'suspended', type: 'boolean', default: false },
				],
			},
			{
				displayName: 'Custom Fields',
				name: 'customFieldsFixed',
				type: 'fixedCollection',
				placeholder: 'Add custom field',
				default: {},
				options: [
					{
						name: 'fields',
						displayName: 'Fields',
						values: [
							{ displayName: 'Shortname', name: 'type', type: 'string', default: '' },
							{ displayName: 'Value', name: 'value', type: 'string', default: '' },
						],
						typeOptions: { multipleValues: true },
					},
				],
				displayOptions: { show: { resource: ['user'], operation: ['create'] } },
			},

			/**
			 * UPDATE
			 */
			{
				displayName: 'User ID',
				name: 'updateUserId',
				type: 'number',
				default: 0,
				required: true,
				description: 'Numeric ID of the user to update',
				displayOptions: { show: { resource: ['user'], operation: ['update'] } },
			},
			{
				displayName: 'First Name',
				name: 'updateFirstname',
				type: 'string',
				default: '',
				description: 'Leave empty to skip',
				displayOptions: { show: { resource: ['user'], operation: ['update'] } },
			},
			{
				displayName: 'Last Name',
				name: 'updateLastname',
				type: 'string',
				default: '',
				description: 'Leave empty to skip',
				displayOptions: { show: { resource: ['user'], operation: ['update'] } },
			},
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add field',
				default: {},
				description: 'Any additional top-level Moodle user fields to update',
				displayOptions: { show: { resource: ['user'], operation: ['update'] } },
				options: [
					{ displayName: 'Email', name: 'email', type: 'string', default: '' },
					{ displayName: 'City', name: 'city', type: 'string', default: '' },
					{ displayName: 'Country', name: 'country', type: 'string', default: '' },
					{ displayName: 'Auth', name: 'auth', type: 'string', default: '' },
					{ displayName: 'Lang', name: 'lang', type: 'string', default: '' },
					{ displayName: 'Timezone', name: 'timezone', type: 'string', default: '' },
					{ displayName: 'Suspended', name: 'suspended', type: 'boolean', default: false },
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
				],
			},
			{
				displayName: 'Custom Fields',
				name: 'updateCustomFields',
				type: 'fixedCollection',
				placeholder: 'Add custom field',
				default: {},
				description: 'Any custom profile fields, by shortname (Moodle expects objects with {type, value})',
				options: [
					{
						name: 'fields',
						displayName: 'Fields',
						values: [
							{ displayName: 'Shortname', name: 'type', type: 'string', default: '' },
							{ displayName: 'Value', name: 'value', type: 'string', default: '' },
						],
						typeOptions: { multipleValues: true },
					},
				],
				displayOptions: { show: { resource: ['user'], operation: ['update'] } },
			},
			{
				displayName: 'Raw Custom Fields JSON',
				name: 'updateCustomFieldsJson',
				type: 'json',
				default: '',
				description: 'Optional raw JSON array for customfields, e.g. [{"type":"E_Email","value":"first.mi.last.mil@army.mil"}] — overrides the collection above if provided',
				displayOptions: { show: { resource: ['user'], operation: ['update'] } },
			},
		],
	};

	/** Execute */
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			try {
				if (resource === 'user' && operation === 'getMany') {
					const query = this.getNodeParameter('query', i, '') as string;
					const limit = this.getNodeParameter('limit', i, 50) as number;

					const qs: IDataObject = { wsfunction: 'core_user_search_identity', query, limit }; // Moodle 3.11+: search_identity
					const res = await moodleRequest(this, 'GET', '/webservice/rest/server.php', qs);
					const data = Array.isArray(res?.results) ? res.results : res; // shape may vary depending on Moodle version
					returnData.push({ json: data });
					continue;
				}

				if (resource === 'user' && operation === 'get') {
					const userId = this.getNodeParameter('userId', i) as number;
					const res = await moodleRequest(this, 'GET', '/webservice/rest/server.php', {
						wsfunction: 'core_user_get_users_by_field',
						field: 'id',
						values: [userId],
					});
					// API returns an array
					returnData.push({ json: Array.isArray(res) ? (res[0] ?? {}) : res });
					continue;
				}

				if (resource === 'user' && operation === 'create') {
					const username = this.getNodeParameter('username', i) as string;
					const password = this.getNodeParameter('password', i) as string;
					const email = this.getNodeParameter('email', i) as string;
					const firstname = this.getNodeParameter('firstname', i, '') as string;
					const lastname = this.getNodeParameter('lastname', i, '') as string;
					const additional = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
					const customFixed = this.getNodeParameter('customFieldsFixed', i, {}) as IDataObject;

					const user: IDataObject = {
						username,
						password,
						email,
						...(firstname ? { firstname } : {}),
						...(lastname ? { lastname } : {}),
						...additional,
					};

					// transform fixedCollection => array of {type, value}
					const fixedFields = (customFixed as any)?.fields as Array<IDataObject> | undefined;
					if (Array.isArray(fixedFields) && fixedFields.length) {
						user.customfields = fixedFields
							.filter((f) => f.type && f.value)
							.map((f) => ({ type: String(f.type), value: String(f.value) }));
					}

					const res = await moodleRequest(this, 'POST', '/webservice/rest/server.php', { wsfunction: 'core_user_create_users' }, { users: [user] });
					returnData.push({ json: res });
					continue;
				}

				if (resource === 'user' && operation === 'update') {
					const id = this.getNodeParameter('updateUserId', i) as number;
					const firstname = this.getNodeParameter('updateFirstname', i, '') as string;
					const lastname = this.getNodeParameter('updateLastname', i, '') as string;
					const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
					const customFixed = this.getNodeParameter('updateCustomFields', i, {}) as IDataObject;
					const customJson = this.getNodeParameter('updateCustomFieldsJson', i, '') as string | IDataObject[];

					if (!id) {
						throw new NodeOperationError(this.getNode(), 'User ID is required for update');
					}

					const user: IDataObject = { id };
					if (firstname) user.firstname = firstname;
					if (lastname) user.lastname = lastname;
					Object.assign(user, Object.fromEntries(Object.entries(updateFields).filter(([, v]) => v !== '' && v !== undefined)));

					let customfields: any[] | undefined;
					// Prefer raw JSON if provided
					if (customJson && typeof customJson === 'string' && customJson.trim().length) {
						try {
							const parsed = JSON.parse(customJson);
							if (!Array.isArray(parsed)) throw new Error('customfields JSON must be an array');
							customfields = parsed;
						} catch (e: any) {
							throw new NodeOperationError(this.getNode(), `Invalid JSON for custom fields: ${e.message}`);
						}
					} else {
						const fixed = (customFixed as any)?.fields as Array<IDataObject> | undefined;
						if (Array.isArray(fixed) && fixed.length) {
							customfields = fixed
								.filter((f) => f.type && f.value)
								.map((f) => ({ type: String(f.type), value: String(f.value) }));
						}
					}

					if (customfields?.length) {
						user.customfields = customfields;
					}

					const res = await moodleRequest(this, 'POST', '/webservice/rest/server.php', { wsfunction: 'core_user_update_users' }, { users: [user] });
					returnData.push({ json: res });
					continue;
				}

				throw new NodeOperationError(this.getNode(), `Unsupported operation: ${resource}.${operation}`);
			} catch (err) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (err as any).message }, pairedItem: { item: i } });
					continue;
				}
				throw err;
			}
		}

		return [returnData];
	}
}
