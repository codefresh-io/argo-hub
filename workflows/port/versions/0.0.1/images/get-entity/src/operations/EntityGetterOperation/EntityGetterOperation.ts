import assert from 'assert';

import clients from '../../clients';
import { Entity, EntityToGet, WorkflowInput } from '../../types';

export default class EntityGetterOperation {
	constructor(private input: WorkflowInput) {
		this.input = input;
	}

	execute = async (): Promise<Record<string, any>> => {
		const entityToGet: EntityToGet = {
			blueprint: this.input.blueprint,
			identifier: this.input.identifier,
		};
		const accessToken = await clients.port.getToken(this.input.baseUrl, this.input.clientId, this.input.clientSecret);

		const entity: Entity = await clients.port.getEntity(this.input.baseUrl, accessToken, entityToGet);

		return {
			entity: {
				identifier: entity.identifier,
				...(entity.title && { title: entity.title }),
				blueprint: entity.blueprint,
				properties: entity.properties,
				...(entity.team && { team: entity.team }),
				...(entity.relations && { relations: entity.relations }),
			},
		};
	};
}
