type EntityProperties = Record<string, any>;
type EntityRelations = Record<string, string>;

export type Entity = {
	identifier: string;
	title?: string;
	blueprint: string;
	properties: EntityProperties;
	team?: string;
	relations?: EntityRelations;
};

export type EntityToGet = {
	identifier: string;
	blueprint: string;
};

export enum OperationType {
	Upsert = 'upsert',
	Get = 'get',
	Search = 'search',
}

export type WorkflowInput = {
	baseUrl: string;
	clientId: string;
	clientSecret: string;
	identifier: string;
	blueprint: string;
};
