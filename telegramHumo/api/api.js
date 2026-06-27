import axios from 'axios'

const api = axios.create({
	baseURL: process.env.API_URL,
	headers: {
		'Content-Type': 'application/json',
		// Shared secret proving this request comes from the trusted listener.
		// Must equal the backend's TELEGRAM_INGEST_SECRET.
		'X-Ingest-Secret': process.env.INGEST_SECRET || '',
	},
})

export default api
