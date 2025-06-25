import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class HtmlToImage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HTML To Image Old',
		name: 'htmlToImage',
		group: ['transform'],
		version: 1,
		description: 'Convert HTML and CSS to an image using htmlcsstoimg.com',
		defaults: {
			name: 'HTML To Image',
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
				displayName: 'HTML Content',
				name: 'html_content',
				type: 'string',
				default: '',
				description: 'The HTML content to render as an image',
			},
			{
				displayName: 'CSS Content',
				name: 'css_content',
				type: 'string',
				default: '',
				description: 'The CSS to style the HTML',
			},
			{
				displayName: 'Viewport Width',
				name: 'viewPortWidth',
				type: 'number',
				default: 1080,
				description: 'Viewport Width in Pixels',
			},
			{
				displayName: 'Viewport Height',
				name: 'viewPortHeight',
				type: 'number',
				default: 720,
				description: 'Viewport Height in Pixels',
			},
			{
				displayName: 'Response Format',
				name: 'response_format',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'PNG', value: 'png' },
					{ name: 'Base64', value: 'base64' },
				],
				default: 'url',
				description: 'Format of the image response',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const html_content = this.getNodeParameter('html_content', i) as string;
				const css_content = this.getNodeParameter('css_content', i) as string;
				const viewPortWidth = this.getNodeParameter('viewPortWidth', i) as number;
				const viewPortHeight = this.getNodeParameter('viewPortHeight', i) as number;
				const response_format = this.getNodeParameter('response_format', i) as string;

				const credentials = await this.getCredentials('htmlcsstoimgApi');

				const options = {
					method: 'POST',
					url: 'https://htmlcsstoimg.com/api/v1/generateImage',
					headers: {
						'CLIENT-API-KEY': credentials.apiKey,
						'Content-Type': 'application/json',
					},
					body: {
						html_content,
						css_content,
						viewPortWidth,
						viewPortHeight,
						response_format,
					},
					json: true,
				};

				// @ts-ignore
				const responseData = await this.helpers.httpRequest(options);
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