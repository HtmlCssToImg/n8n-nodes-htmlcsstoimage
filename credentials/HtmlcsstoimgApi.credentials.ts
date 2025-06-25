import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class HtmlcsstoimgApi implements ICredentialType {
	name = 'htmlcsstoimgApi';
	displayName = 'Htmlcsstoimg API';
	documentationUrl = 'https://docs.htmlcsstoimg.com/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'CLIENT-API-KEY': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://htmlcsstoimg.com',
			url: '/api/v1/generateImage',
			method: 'POST',
			headers: {
				'CLIENT-API-KEY': '={{$credentials.apiKey}}',
				'Content-Type': 'application/json',
			},
			body: {
				html_content: '<div></div>',
				css_content: '',
				response_format: 'url',
			},
		},
	};
} 