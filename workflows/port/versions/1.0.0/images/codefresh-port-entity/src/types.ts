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

export type EntityToUpsert = {
	identifier?: string;
	title?: string;
	blueprint: string;
	properties: EntityProperties;
	team?: string;
	relations?: EntityRelations;
	icon?: string;
};

export enum OperationType {
	Upsert = 'upsert',
	Get = 'get',
	Search = 'search',
}

export type WorkflowBaseInput = {
	baseUrl: string;
	clientId: string;
	clientSecret: string;
};

export type WorkflowGetInput = WorkflowBaseInput & {
	identifier: string;
	blueprint: string;
};

export type WorkflowUpsertInput = WorkflowBaseInput & {
	identifier?: string;
	blueprint: string;
	title?: string;
	properties?: string[];
	team?: string;
	relations?: string[];
	icon?: string;
};
