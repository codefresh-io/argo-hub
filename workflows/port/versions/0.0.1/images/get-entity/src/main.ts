import { exit } from 'process';

import inputs from './inputs';
import OperationFactory from './operations/OperationFactory/OperationFactory';
import { WorkflowInput } from './types';

async function run(): Promise<void> {
	try {
		if (
			!process.env.PORT_CLIENT_ID ||
			!process.env.PORT_CLIENT_SECRET ||
			!process.env.BLUEPRINT_IDENTIFIER ||
			!process.env.ENTITY_IDENTIFIER
		) {
			console.error('All environment variables (ID, SECRET, Blueprint and Entity identifier are required');
			process.exit(1);
		}

		const input: WorkflowInput = {
			baseUrl: 'https://api.getport.io',
			clientId: process.env.PORT_CLIENT_ID,
			clientSecret: process.env.PORT_CLIENT_SECRET,
			blueprint: process.env.BLUEPRINT_IDENTIFIER,
			identifier: process.env.ENTITY_IDENTIFIER,
		};

		const output = await new OperationFactory().createOperation(input).execute();
		Object.entries(output).forEach(([key, value]) => core.setOutput(key, value));
	} catch (error: any) {
		if (error?.message) {
			console.error(error.message);
			process.exit(1);
		}
	}
}

export default run;
