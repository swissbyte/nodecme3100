import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
} from 'n8n-workflow';

export class ExampleNode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'CMe3100 Node',
        name: 'cme3100node',
        group: ['transform'],
        version: 1,
        description: 'Transforms incoming data from an CMe3100',
        defaults: {
            name: 'CMe3100 Node',
        },
        inputs: ['main'],
        outputs: ['main'],
        properties: [
            // // Node properties which the user gets displayed and
            // // can change on the node.
            // {
            //     displayName: 'My String',
            //     name: 'myString',
            //     type: 'string',
            //     default: '',
            //     placeholder: 'Placeholder value',
            //     description: 'The description text',
            // },
        ],
    };

    // The function below is responsible for actually doing whatever this node
    // is supposed to do. In this case, we're just appending the `myString` property
    // with whatever the user has entered.
    // You can make async calls and use `await`.
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();

        let item: INodeExecutionData;

        const text = this.getInputData()[0].json.body as String;

        // Split the text into blocks based on lines starting with '#'
        const blocks = text.split('\n#').filter(Boolean);

        // Create an empty result array
        const result = [];

        for (const block of blocks) {
            const lines = block.trim().split('\n');
            const headerLine = lines[0].replace(/^#/, '');
            const dataLines = lines.slice(1);

            const headerFields = headerLine.split(';');

            if (dataLines.length > 0) {
                const data = [];
                for (const dataLine of dataLines) {
                    const dataFields = dataLine.split(';');
                    const dataObject = {};

                    for (let i = 0; i < headerFields.length; i++) {
                        const key = headerFields[i].split(',')[0];
                        const value = dataFields[i];
                        dataObject[key] = value;
                    }

                    data.push(dataObject);
                }

                const blockObject = {
                    'serial-number': data[0]['serial-number'],
                    'device-identification': data[0]['device-identification'],
                    'device-type': data[0]['device-type'],
                    'manufacturer': data[0]['manufacturer'],
                    'version': data[0]['version'],
                    'data': data,
                };

                result.push(blockObject);
            }
        }

        return this.prepareOutputData(this.helpers.returnJsonArray(result));
    }
}
