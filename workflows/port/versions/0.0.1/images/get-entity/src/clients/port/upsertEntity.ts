import axios from 'axios';

import { Entity, EntityToUpsert } from '../../types';

const upsertEntity = async (baseUrl: string, accessToken: string, entity: EntityToUpsert): Promise<Entity> => {
	const url = `${baseUrl}/v1/blueprints/${entity.blueprint}/entities?upsert=true&merge=true`;
	try {
		console.info(`Performing POST request to URL: ${url}, with body: ${JSON.stringify(entity)}`);

		const config = {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		};

		const response = await axios.post(url, entity, config);

		return response.data.entity;
	} catch (e: any) {
		const statusCode = e?.response?.status || e?.code;
		const error = e?.response?.data?.message || e.message;
		const log = statusCode >= 400 && statusCode < 500 ? console.warn : console.error;
		if (log) {
			log(`Failed to upsert entity with error "${error}" (${statusCode})`);
		}
		throw e;
	}
};

export default upsertEntity;
