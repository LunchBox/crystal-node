import express from "express"
import http from 'http'
import { Server } from "socket.io"

import fs from 'fs'
import { spawn } from "child_process"

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const port = 4090

const app = express()
const server = http.createServer(app)
const io = new Server(server)
const output = msg => io.emit('output', msg)

const TMP_FILE = "tmp.py"


function run() {
	const py = spawn('python',[TMP_FILE])

	py.stdout.on('data',function(res){
		output(res.toString())
	})

	py.stderr.on('data', function(res){
		output(res.toString())
	})

	py.on('close', (code) => {
		// output(`子进程退出：退出代码code ${code}`);
	})
}

io.on('connection', (socket) => {
  console.log('a user connected')

	socket.on('disconnect', () => {
    console.log('user disconnected')
  })

	socket.on('run-script', code => {		
		// output('----')
		fs.writeFile("./" + TMP_FILE, code, function(err) {
			if(err) {
				return output(err)
			}
			// output("saved to tmp file")
		
			run()
		})
  })
})

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html')
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})