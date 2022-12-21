import axios from 'axios';

import { Entity, EntityToGet } from '../../types';

const getEntity = async (baseUrl: string, accessToken: string, entity: EntityToGet): Promise<Entity> => {
	const url = `${baseUrl}/v1/blueprints/${entity.blueprint}/entities/${entity.identifier}`;
	try {
		console.info(`Performing GET request to URL: ${url}`);

		const config = {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		};

		const response = await axios.get(url, config);

		return response.data.entity;
	} catch (e: any) {
		const statusCode = e?.response?.status || e?.code;
		const error = e?.response?.data?.message || e.message;
		const log = statusCode >= 400 && statusCode < 500 ? console.warn : console.error;
		if (log) {
			log(`Failed to get entity with error "${error}" (${statusCode})`);
		}
		throw e;
	}
};

export default getEntity;
