import axios from 'axios';

const deleteEntity = async (baseUrl: string, accessToken: string, blueprint: string, identifier: string): Promise<void> => {
	const url = `${baseUrl}/v1/blueprints/${blueprint}/entities/${identifier}`;
	try {
		console.info(`Performing DELETE request to URL: ${url}`);

		const config = {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		};

		await axios.delete(url, config);
	} catch (e: any) {
		const statusCode = e?.response?.status || e?.code;
		const error = e?.response?.data?.message || e.message;
		const log = statusCode >= 400 && statusCode < 500 ? console.warn : console.error;
		if (log) {
			log(`Failed to delete entity with error "${error}" (${statusCode})`);
		}
		throw e;
	}
};

export default deleteEntity;
