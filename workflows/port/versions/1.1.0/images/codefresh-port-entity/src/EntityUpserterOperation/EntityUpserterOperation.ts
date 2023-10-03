import clients from '../clients';
import { EntityToUpsert, WorkflowUpsertInput } from '../types';

export default class EntityUpserterOperation {
	constructor(private input: WorkflowUpsertInput) {
		this.input = input;
	}

	private parseInput = (): EntityToUpsert => {
		return {
			...(this.input.identifier && { identifier: this.input.identifier }),
			...(this.input.title && { title: this.input.title }),
			blueprint: this.input?.blueprint,
			properties: this.input.properties?.length ? JSON.parse(this.input.properties.join('')) : {},
			team: this.input.team?.length && this.input.team.length > 0 ? JSON.parse(this.input.team as string) : undefined,
			relations: this.input.relations?.length ? JSON.parse(this.input.relations.join('')) : {},
			...(this.input.icon && { icon: this.input.icon }),
		};
	};

	execute = async (): Promise<Record<string, any>> => {
		const entityToUpsert = this.parseInput();
		const accessToken = await clients.port.getToken(this.input.baseUrl, this.input.clientId, this.input.clientSecret);
		const entityRes = await clients.port.upsertEntity(this.input.baseUrl, accessToken, entityToUpsert);

		return entityRes;
	};
}
