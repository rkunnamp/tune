import subprocess

def main(params):
    return subprocess.check_output(params['text'], shell=True, text=True)

