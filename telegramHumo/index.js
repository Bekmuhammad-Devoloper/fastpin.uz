import 'dotenv/config'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { NewMessage } from 'telegram/events/index.js'
import { postToBackend } from './api/fetch.js'

const extractAmountNumber = text => {
	const match = text.match(/([\d\s.,]+)\s*UZS/i)
	if (!match) return null

	let raw = match[1].replace(/\s/g, '')
	if (raw.includes('.') && raw.includes(',')) {
		raw = raw.replace(/\./g, '').replace(',', '.')
	} else {
		raw = raw.replace(/,/g, '.')
	}

	const amount = Number(raw)
	return Number.isFinite(amount) ? amount : null
}

const extractCardLast4 = text => {
	const match = text.match(/💳.*?(\d{4})/)
	return match ? match[1] : null
}
const isValidMessage = (text, sender) => {
	if (sender === 'HUMOcardbot') {
		return text.includes("To'ldirish")
	}

	if (sender === 'CardXabarBot') {
		return text.includes('Perevod na kartu')
	}

	return false
}

const extractDateTime = (text, sender) => {
	if (sender === 'HUMOcardbot') {
		const match = text.match(/🕓\s*(\d{2}):(\d{2})\s*(\d{2})\.(\d{2})\.(\d{4})/)
		if (!match) return null

		const [, hour, minute, day, month, year] = match
		return {
			year: Number(year),
			month: Number(month),
			day: Number(day),
			hour: Number(hour),
			minute: Number(minute),
		}
	}

	if (sender === 'CardXabarBot') {
		const match = text.match(/🕓\s*(\d{2})\.(\d{2})\.(\d{2})\s*(\d{2}):(\d{2})/)
		if (!match) return null

		const [, day, month, yearShort, hour, minute] = match
		return {
			year: 2000 + Number(yearShort),
			month: Number(month),
			day: Number(day),
			hour: Number(hour),
			minute: Number(minute),
		}
	}

	return null
}

const apiId = Number(process.env.API_ID)
const apiHash = process.env.API_HASH

const botUsernames = (process.env.BOT_USERNAMES || '')
	.split(',')
	.map(u => u.trim())

const session = new StringSession(process.env.SESSION || '')

function ask(question) {
	return new Promise(resolve => {
		process.stdout.write(question)
		process.stdin.once('data', data => resolve(data.toString().trim()))
	})
}

const client = new TelegramClient(session, apiId, apiHash, {
	connectionRetries: 5,
})

async function main() {
	await client.start({
		phoneNumber: async () => await ask('📱 Phone: '),
		phoneCode: async () => await ask('📨 Code: '),
		password: async () => await ask('🔑 2FA password (если есть): '),
		onError: err => console.log(err),
	})

	client.addEventHandler(async event => {
		const message = event.message
		const senderObj = await message.getSender()
		const sender = senderObj?.username

		if (!sender || !botUsernames.includes(sender)) return

		const text = message.text || ''

		if (!isValidMessage(text, sender)) return

		const amount = extractAmountNumber(text)
		const dateTime = extractDateTime(text, sender)
		const cardNumber = extractCardLast4(text)

		if (!amount || !dateTime || !cardNumber) {
			return
		}

		const result = await postToBackend({
			amount,
			sender,
			cardNumber,
			...dateTime,
		})
	}, new NewMessage({}))
}

main()
