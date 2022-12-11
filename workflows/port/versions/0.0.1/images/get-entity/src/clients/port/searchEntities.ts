import axios from 'axios';

import { Entity, SearchBody } from '../../types';

const searchEntities = async (baseUrl: string, accessToken: string, searchBody: SearchBody): Promise<Entity[]> => {
	const url = `${baseUrl}/v1/entities/search`;
	try {
		console.info(`Performing POST request to URL: ${url}`);

		const config = {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		};

		const response = await axios.post(url, searchBody, config);

		return response.data.entities;
	} catch (e: any) {
		const statusCode = e?.response?.status || e?.code;
		const error = e?.response?.data?.message || e.message;
		const log = statusCode >= 400 && statusCode < 500 ? console.warn : console.error;
		if (log) {
			log(`Failed to search entities with error "${error}" (${statusCode})`);
		}
		throw e;
	}
};

export default searchEntities;
