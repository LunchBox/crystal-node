if __name__ == '__main__':
	from ipykernel.kernelapp import IPKernelApp
	import os
	import shutil
	import logging

	logging.basicConfig(filename='test.log', encoding='utf-8', level=logging.DEBUG)
      
	app = IPKernelApp.instance()
	app.initialize()
	
	logging.info(app.abs_connection_file)

	if os.path.isfile(app.abs_connection_file):
		shutil.copyfile(app.abs_connection_file, "./kernel.json")

	app.start()