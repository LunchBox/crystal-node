import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto'
import zmq from 'zeromq'


async function runClient() {
	const shell_addr = "tcp://localhost:64762"
	const sock = new zmq.Request()

	const key = "538992b0-cb3b0809ca44a9964f6c04e1"

	const msg_id = uuidv4()
	const msg_type = "execute_request"

	const header = {
		msg_id,
		msg_type
	}

	const parent_header = {}
	const metadata = {}

	const content = {
		code: 'x = 102',
		silent: false,
		store_history: true,
		user_expressions: {},
		allow_stdin: false,
		stop_on_error: true 
	}

	const sign = JSON.stringify(header)
              + JSON.stringify(parent_header)
              + JSON.stringify(metadata)
              + JSON.stringify(content)
	const hmac_digest = crypto.createHmac("sha256", key).update(sign).digest("hex")
	console.log(hmac_digest)

	const msg = [
		"",
		"<IDS|MSG>",
		hmac_digest,
		JSON.stringify(header),
		JSON.stringify(parent_header),
		JSON.stringify(metadata),
		JSON.stringify(content)
	]

	sock.connect(shell_addr)

	await sock.send(msg)

	const [result] = await sock.receive()
	console.log('Received ', result.toString())
}

runClient()