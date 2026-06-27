// Two-step, non-interactive Telegram login for the auto-payment listener.
//
//   node login.mjs send                      -> requests a login code (Telegram app)
//   node login.mjs signin <code> [password]  -> completes sign-in, prints SESSION=...
//
// Step 1 saves the MTProto session + phoneCodeHash to .login-state.json so step 2
// (a separate process) can finish the sign-in with the code you received.

import 'dotenv/config'
import { TelegramClient, Api } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import fs from 'fs'

const apiId = Number(process.env.API_ID)
const apiHash = process.env.API_HASH
const phone = process.env.PHONE_NUMBER
const STATE = new URL('./.login-state.json', import.meta.url)
const mode = process.argv[2]

function newClient(sessionStr) {
	return new TelegramClient(new StringSession(sessionStr || ''), apiId, apiHash, {
		connectionRetries: 5,
	})
}

async function send() {
	const client = newClient('')
	await client.connect()
	const result = await client.sendCode({ apiId, apiHash }, phone)
	fs.writeFileSync(
		STATE,
		JSON.stringify({ session: client.session.save(), phoneCodeHash: result.phoneCodeHash, phone }),
	)
	console.log('CODE_SENT to ' + phone + ' (check your Telegram app / SMS)')
	await client.disconnect()
	process.exit(0)
}

async function signin() {
	const code = process.argv[3]
	const password = process.argv[4]
	if (!code) {
		console.log('ERROR: missing code. Usage: node login.mjs signin <code> [password]')
		process.exit(1)
	}
	const st = JSON.parse(fs.readFileSync(STATE, 'utf8'))
	const client = newClient(st.session)
	await client.connect()
	try {
		await client.invoke(
			new Api.auth.SignIn({ phoneNumber: st.phone, phoneCodeHash: st.phoneCodeHash, phoneCode: code }),
		)
	} catch (e) {
		const msg = e.errorMessage || e.message || String(e)
		if (msg.includes('SESSION_PASSWORD_NEEDED')) {
			if (!password) {
				console.log('2FA_REQUIRED: re-run as: node login.mjs signin ' + code + ' <2fa-password>')
				await client.disconnect()
				process.exit(2)
			}
			const pwd = await client.invoke(new Api.account.GetPassword())
			const { computeCheck } = await import('telegram/Password.js')
			const check = await computeCheck(pwd, password)
			await client.invoke(new Api.auth.CheckPassword({ password: check }))
		} else {
			console.log('SIGNIN_ERROR: ' + msg)
			await client.disconnect()
			process.exit(1)
		}
	}
	const me = await client.getMe()
	const session = client.session.save()
	console.log('SIGNED_IN_AS: ' + (me.username ? '@' + me.username : me.firstName) + ' (id ' + me.id + ')')
	console.log('SESSION=' + session)
	try { fs.unlinkSync(STATE) } catch {}
	await client.disconnect()
	process.exit(0)
}

if (mode === 'send') send()
else if (mode === 'signin') signin()
else {
	console.log('usage: node login.mjs send | signin <code> [password]')
	process.exit(1)
}
