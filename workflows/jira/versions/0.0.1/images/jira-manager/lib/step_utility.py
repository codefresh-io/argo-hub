import os
import sys

class StepUtility:    
    @staticmethod
    def getEnvironmentVariable(key, env):
        value = env.get(key, "")
        if value == "${{" + key + "}}":
            value = ""
        return value

    @staticmethod
    def printCleanException(exc):
        print('{}: {}'.format(type(exc).__name__, exc))

    @staticmethod
    def printFail(message, end = '\n'):
        sys.stderr.write('\x1b[1;31m' + message.strip() + '\x1b[0m' + end)

    @staticmethod
    def export_variable(name, value):
        print(f"   {name}: {value}")
        file=open(f"/tmp/{name}", "w")
        file.write(f"{value}")
        file.close()