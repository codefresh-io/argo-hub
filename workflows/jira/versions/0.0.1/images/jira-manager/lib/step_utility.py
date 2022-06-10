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
    def export_variable(key, value):
        # Export secrets here
        print("\nExporting Codefresh variable")    
        env_file_path = "/meta/env_vars_to_export"
        if not os.path.exists(env_file_path):
            print(str(key) + "=" + str(value))
        else:
            env_file = open(env_file_path, "a")           
            env_file.write(str(key) + "=" + str(value) + "\n")
            env_file.close()