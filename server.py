from jupyter_client import KernelManager, MultiKernelManager

from flask import Flask, render_template
from flask_socketio import SocketIO
from flask_socketio import send, emit

import datetime 
import json
from queue import Empty

import inspect

# # Create a new kernel manager
# km = KernelManager(kernel_name='python3')
# km.start_kernel()

# multi kernel manager
manager = MultiKernelManager()
kernel_id = manager.start_kernel(kernel_name='python3')

km = manager.get_kernel(kernel_id)


# Create a client to interact with the kernel
kc = km.client()
kc.start_channels()

# Ensure the client is connected before executing code
kc.wait_for_ready()


# Define a custom function to serialize datetime objects 
def serialize_datetime(obj): 
	if isinstance(obj, datetime.datetime): 
		return obj.isoformat() 
	raise TypeError("Type not serializable") 


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

#TODO: should only allow trusted hosts
socketio = SocketIO(app, cors_allowed_origins="*")


@socketio.on('execute_input')
def handle_json(json_str):
	print('received json: ' + str(json_str))
	print(type(json_str))
	req = json.loads(json_str)
	# print(req)
	msg_id = kc.execute(req['code'])
	print('----')
	print(msg_id)
	emit('reg_msg', json.dumps({"msgId": msg_id, "exchangeId": req['exchangeId'] }))

	# Wait for the result and display it
	while True:
		try:
			msg = kc.get_iopub_msg(timeout=1)
			print('----')
			print(msg)

			json_str = json.dumps(msg, default=serialize_datetime) 
			emit('output', json_str)
			
			if msg['msg_type'] == 'status' and msg['content']['execution_state'] == 'idle':
				break
		except Empty: # just wait
			pass
		except KeyboardInterrupt:
			print("Interrupted by user.")
			break

if __name__ == '__main__':
	try: 
		socketio.run(app)
	finally:
		km.shutdown_kernel()
		manager.remove_kernel(kernel_id)