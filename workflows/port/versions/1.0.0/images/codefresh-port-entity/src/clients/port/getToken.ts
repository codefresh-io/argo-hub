import axios from 'axios';

const getToken = async (baseUrl: string, clientId: string, clientSecret: string): Promise<string> => {
	try {
		console.info(`Trying to obtain Port access token`);
		const { data } = await axios.post(`${baseUrl}/v1/auth/access_token`, { clientId, clientSecret });
		console.info(`Token obtained`);

		return data.accessToken;
	} catch (e: any) {
		const message = e?.response?.data?.error || e.message;
		console.error(`Failed to obtain Port access token with error "${message}"`);
		throw e;
	}
};

export default getToken;
