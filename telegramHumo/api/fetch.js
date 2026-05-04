import api from './api.js'
export async function postToBackend({
	amount,
	sender,
	year,
	month,
	day,
	hour,
	minute,
	cardNumber,
}) {
	try {
		const response = await api.post('/payment/createTelegram', {
			amount,
			sender,
			year,
			month,
			day,
			hour,
			minute,
			cardNumber,
		})
		return response.data
	} catch (error) {
		console.error(error.response?.data || error.message)
		throw error
	}
}
