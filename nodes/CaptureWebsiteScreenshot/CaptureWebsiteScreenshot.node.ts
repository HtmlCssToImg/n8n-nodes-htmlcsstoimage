import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class CaptureWebsiteScreenshot implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Capture Website Screenshot',
		name: 'captureWebsiteScreenshot',
		group: ['transform'],
		version: 1,
		description: 'Capture a screenshot of a website using htmlcsstoimg.com',
		defaults: {
			name: 'Capture Website Screenshot',
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
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'The URL of the website to capture',
			},
			{
				displayName: 'Full Page',
				name: 'full_page',
				type: 'boolean',
				default: true,
				description: 'Whether to capture the full page',
			},
			{
				displayName: 'Wait Till',
				name: 'wait_till',
				type: 'number',
				default: 10000,
				description: 'Milliseconds to wait before capturing',
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
					{ name: 'URL in PNG', value: 'png' },
					{ name: 'Image', value: 'image' },
					{ name: 'Base64', value: 'base64' },
				],
				default: 'image',
				description: 'Format of the screenshot response',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const url = this.getNodeParameter('url', i) as string;
				const full_page = this.getNodeParameter('full_page', i) as boolean;
				const wait_till = this.getNodeParameter('wait_till', i) as number;
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
						url,
						full_page,
						wait_till,
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