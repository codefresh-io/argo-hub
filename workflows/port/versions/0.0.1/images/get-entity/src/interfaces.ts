export interface IOperation {
	execute(): Promise<Record<string, any>>;
}
