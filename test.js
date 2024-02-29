import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto'
import zmq from 'zeromq'
import fs from 'fs'


async function runClient() {
	exec()
}

function exec() {
	const kernel = fs.readFile('kernel.json', 'utf8', (err, data) => {
		if (err) {
			console.error(err)
			return
		}

		sendToKernel(JSON.parse(data))
	})
}

async function sendToKernel(kernel) {
	console.log(kernel)

	const shell_addr = `${kernel.transport}://${kernel.ip}:${kernel.shell_port}`
	const sock = new zmq.Request()

	const key = kernel.key

	const header = {
		msg_id: uuidv4(),
		msg_type: "execute_request"
	}

	const parent_header = {}
	const metadata = {}

	const content = {
		code: 'x = ' + new Date().getTime(),
		silent: false,
		store_history: true,
		user_expressions: {},
		allow_stdin: false,
		stop_on_error: true 
	}

	const strArr = [header, parent_header, metadata, content].map(JSON.stringify)
	const sign = strArr.join('')

	const hmac_digest = crypto.createHmac("sha256", key).update(sign).digest("hex")
	console.log(hmac_digest)

	const msg = [
		"",
		"<IDS|MSG>",
		hmac_digest,
		...strArr
	]

	sock.connect(shell_addr)

	await sock.send(msg)

	const [result] = await sock.receive()
	console.log('Received ', result.toString())
}

runClient()