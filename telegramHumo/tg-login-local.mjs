// Run this LOCALLY on your Windows machine — your home IP is more trusted by Telegram
// than the data-center IP, so the code is much more likely to actually arrive.
//
// Usage:  node tg-login-local.mjs
//
// You'll be asked for the 5-digit code that appears in your Telegram app.
// On success, the SESSION string is printed at the bottom — copy that into chat.

import 'dotenv/config'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'

const apiId = Number(process.env.API_ID)
const apiHash = process.env.API_HASH
const phone = process.env.PHONE_NUMBER || '+998883215665'

function ask(q) {
  return new Promise(r => {
    process.stdout.write(q)
    process.stdin.once('data', d => r(d.toString().trim()))
  })
}

const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
  connectionRetries: 5,
})

await client.start({
  phoneNumber: async () => phone,
  phoneCode: async () => await ask('\n📨 Kodingizni kiriting (5 raqam): '),
  password: async () => await ask('🔑 2FA password (yo\'q bo\'lsa Enter): '),
  onError: e => console.error('[error]', e),
})

const session = client.session.save()
console.log('\n')
console.log('================================================================')
console.log('SESSION (shu uzun stringni nusxalab Claude\'ga yuboring):')
console.log('================================================================')
console.log(session)
console.log('================================================================\n')
process.exit(0)
