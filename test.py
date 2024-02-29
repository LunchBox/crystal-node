if __name__ == '__main__':
	from ipykernel.kernelapp import IPKernelApp
	import os
	import shutil
      
	app = IPKernelApp.instance()
	app.initialize()

	if os.path.isfile(app.abs_connection_file):
		shutil.copyfile(app.abs_connection_file, "./kernel.json")

	app.start()