import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class HtmlCssToImage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HTML/CSS to Image',
		name: 'htmlCssToImage',
		group: ['transform'],
		version: 1,
		description: 'Convert HTML/CSS or a URL to an image',
		defaults: {
			name: 'HTML/CSS to Image',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'htmlcsstoimgApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'HTML to Image',
						value: 'htmlToImage',
						description: 'Convert HTML and CSS to an image',
						action: 'Convert HTML and CSS to an image',
					},
					{
						name: 'URL to Image',
						value: 'urlToImage',
						description: 'Capture a screenshot of a website',
						action: 'Capture a screenshot of a website',
					},
				],
				default: 'htmlToImage',
			},
			// Properties for HTML to Image
			{
				displayName: 'HTML Content',
				name: 'html_content',
				type: 'string',
				default: '',
				description: 'The HTML content to render as an image',
				displayOptions: {
					show: {
						operation: ['htmlToImage'],
					},
				},
			},
			{
				displayName: 'CSS Content',
				name: 'css_content',
				type: 'string',
				default: '',
				description: 'The CSS to style the HTML',
				displayOptions: {
					show: {
						operation: ['htmlToImage'],
					},
				},
			},
			{
				displayName: 'Viewport Width',
				name: 'viewPortWidth',
				type: 'number',
				default: 1080,
				description: 'Viewport Width in Pixels',
				displayOptions: {
					show: {
						operation: ['htmlToImage', 'urlToImage'],
					},
				},
			},
			{
				displayName: 'Viewport Height',
				name: 'viewPortHeight',
				type: 'number',
				default: 720,
				description: 'Viewport Height in Pixels',
				displayOptions: {
					show: {
						operation: ['htmlToImage', 'urlToImage'],
					},
				},
			},
			{
				displayName: 'Response Format',
				name: 'response_format_html',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'PNG', value: 'png' },
					{ name: 'Base64', value: 'base64' },
				],
				default: 'url',
				description: 'Format of the image response',
				displayOptions: {
					show: {
						operation: ['htmlToImage'],
					},
				},
			},
			// Properties for URL to Image
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'The URL of the website to capture',
				displayOptions: {
					show: {
						operation: ['urlToImage'],
					},
				},
			},
			{
				displayName: 'Full Page',
				name: 'full_page',
				type: 'boolean',
				default: true,
				description: 'Whether to capture the full page',
				displayOptions: {
					show: {
						operation: ['urlToImage'],
					},
				},
			},
			{
				displayName: 'Wait Till',
				name: 'wait_till',
				type: 'number',
				default: 10000,
				description: 'Milliseconds to wait before capturing',
				displayOptions: {
					show: {
						operation: ['urlToImage'],
					},
				},
			},
			{
				displayName: 'Response Format',
				name: 'response_format_url',
				type: 'options',
				options: [
					{ name: 'URL in PNG', value: 'png' },
					{ name: 'Image', value: 'image' },
					{ name: 'Base64', value: 'base64' },
				],
				default: 'image',
				description: 'Format of the screenshot response',
				displayOptions: {
					show: {
						operation: ['urlToImage'],
					},
				},
			},
		],
	};

	execute: IExecuteFunctions = async (this: IExecuteFunctions): Promise<INodeExecutionData[][]> => {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let body: Record<string, unknown> = {};
				let response_format: string;

				if (operation === 'htmlToImage') {
					body.html_content = this.getNodeParameter('html_content', i) as string;
					body.css_content = this.getNodeParameter('css_content', i) as string;
					body.viewPortWidth = this.getNodeParameter('viewPortWidth', i) as number;
					body.viewPortHeight = this.getNodeParameter('viewPortHeight', i) as number;
					response_format = this.getNodeParameter('response_format_html', i) as string;
					body.response_format = response_format;
				} else if (operation === 'urlToImage') {
					body.url = this.getNodeParameter('url', i) as string;
					body.full_page = this.getNodeParameter('full_page', i) as boolean;
					body.wait_till = this.getNodeParameter('wait_till', i) as number;
					body.viewPortWidth = this.getNodeParameter('viewPortWidth', i) as number;
					body.viewPortHeight = this.getNodeParameter('viewPortHeight', i) as number;
					response_format = this.getNodeParameter('response_format_url', i) as string;
					body.response_format = response_format;
				}

				const responseData = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'htmlcsstoimgApi',
					{
						method: 'POST',
						url: 'https://htmlcsstoimg.com/api/v1/generateImage',
						body,
						json: true,
					},
				);

				returnData.push({ json: responseData });

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message }, pairedItem: i });
				} else {
					throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
				}
			}
		}
		return [returnData];
	}
}
