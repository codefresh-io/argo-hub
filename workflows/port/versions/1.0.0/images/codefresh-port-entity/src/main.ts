import EntityGetterOperation from './EntityGetterOperation/EntityGetterOperation';
import EntityUpserterOperation from './EntityUpserterOperation/EntityUpserterOperation';
import OutputsWriter from './OutputsWriter/OutputsWriter';
import API_BASE_URL from './consts';
import { OperationType, WorkflowGetInput, WorkflowUpsertInput } from './types';

async function run(): Promise<void> {
	try {
		if (process.env.OPERATION === OperationType.Get) {
			await handleEntityGet();
		} else if (process.env.OPERATION === OperationType.Upsert) {
			await handleEntityUpsert();
		} else {
			console.error('No operation provided');
			process.exit(1);
		}
	} catch (error: any) {
		if (error?.message) {
			console.error(error.message);
			process.exit(1);
		}
	}
}

async function handleEntityGet(): Promise<void> {
	if (
		!process.env.PORT_CLIENT_ID ||
		!process.env.PORT_CLIENT_SECRET ||
		!process.env.BLUEPRINT_IDENTIFIER ||
		!process.env.ENTITY_IDENTIFIER
	) {
		console.error(
			'One of the required parameters - Client ID, Client SECRET, Blueprint identifier, Entity Identifier was not provided',
		);
		process.exit(1);
	}

	const input: WorkflowGetInput = {
		baseUrl: API_BASE_URL,
		clientId: process.env.PORT_CLIENT_ID,
		clientSecret: process.env.PORT_CLIENT_SECRET,
		blueprint: process.env.BLUEPRINT_IDENTIFIER,
		identifier: process.env.ENTITY_IDENTIFIER,
	};
	const operation = new EntityGetterOperation(input);
	const output = await operation.execute();
	const outputsWriter = new OutputsWriter(OperationType.Get, output, '/tmp/portvars');
	await outputsWriter.writeOutputFiles();
}

async function handleEntityUpsert(): Promise<void> {
	if (!process.env.PORT_CLIENT_ID || !process.env.PORT_CLIENT_SECRET || !process.env.BLUEPRINT_IDENTIFIER) {
		console.error('One of the required parameters - Client ID, Client SECRET, Blueprint identifier was not provided');
		process.exit(1);
	}

	// Optional fields - identifier, title, team, properties, relations, icon
	const input: WorkflowUpsertInput = {
		baseUrl: API_BASE_URL,
		clientId: process.env.PORT_CLIENT_ID,
		clientSecret: process.env.PORT_CLIENT_SECRET,
		blueprint: process.env.BLUEPRINT_IDENTIFIER,
		identifier: process.env.ENTITY_IDENTIFIER === '' ? undefined : process.env.ENTITY_IDENTIFIER,
		title: process.env.ENTITY_TITLE === '' ? undefined : process.env.ENTITY_TITLE,
		team: process.env.ENTITY_TEAM === '' ? undefined : process.env.ENTITY_TEAM,
		properties: process.env.ENTITY_PROPERTIES === '' ? ['{', '}'] : process.env.ENTITY_PROPERTIES?.split('\n'),
		relations: process.env.ENTITY_RELATIONS === '' ? ['{', '}'] : process.env.ENTITY_RELATIONS?.split('\n'),
		icon: process.env.ENTITY_ICON === '' ? undefined : process.env.ENTITY_ICON,
	};
	const operation = new EntityUpserterOperation(input);
	const output = await operation.execute();
	const outputsWriter = new OutputsWriter(OperationType.Upsert, output, '/tmp/portvars');
	await outputsWriter.writeOutputFiles();
}

export default run;
