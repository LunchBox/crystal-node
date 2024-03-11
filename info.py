import inspect
import json

def to_dict(name, param):
	return {
		"name": f"{name}",
		"type": f"{param.annotation}",
		"default": f"{param.default}",
		"kind": f"{param.kind}"
	}

def get_info(func):
	signature = inspect.signature(func)
	params = signature.parameters
	
	info = [to_dict(name, param) for (name, param) in params.items()]
	print(json.dumps(info))
	return json.dumps(info)
	
