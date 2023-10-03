import fs from 'fs';
import path from 'path';

import { OperationType } from '../types';

export default class OutputsWriter {
	constructor(private mode: OperationType, private entity: Record<string, any>, private basePath: string) {
		this.mode = mode;
		this.entity = entity;
		this.basePath = '/tmp/portvars/';
	}

	writeOutputFiles = async () => {
		console.info(this.entity);
		this.makeBasePath();
		if (this.mode === OperationType.Get) {
			this.writeGetModeOutputFiles();
		} else if (this.mode === OperationType.Upsert) {
			this.writeUpsertOutputFiles();
		}
	};

	private writeUpsertOutputFiles = async () => {
		this.writeFile('PORT_ENTITY_IDENTIFIER', this.entity.identifier);
	};

	private writeGetModeOutputFiles = async () => {
		this.writeFile('PORT_COMPLETE_ENTITY', this.entity);
		this.writeFile('PORT_ENTITY_IDENTIFIER', this.entity.entity.identifier);
		this.writeFile('PORT_BLUEPRINT_IDENTIFIER', this.entity.entity.blueprint);
		this.writeFile('PORT_ENTITY_TITLE', this.entity.entity.title);
		this.writeFile('PORT_ENTITY_PROPERTIES', this.entity.entity.properties);
		this.writeFile('PORT_ENTITY_RELATIONS', this.entity.entity.relations);
	};

	private makeBasePath = () => {
		console.info(`Creating base path ${this.basePath}`);
		fs.mkdirSync(this.basePath, {
			recursive: true,
		});
		console.info(`Base path created`);
	};

	private writeFile = (name: string, value: string | Record<string, any>) => {
		const outputPath = path.join(this.basePath, name);
		console.info(`writing value  ${JSON.stringify(value)} to file ${outputPath}`);
		fs.writeFileSync(outputPath, JSON.stringify(value));
	};
}
