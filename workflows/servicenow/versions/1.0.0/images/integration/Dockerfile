FROM python:3.11.0a7-alpine3.15
RUN pip3 install requests

COPY ./snow.py /snow/snow.py
ENTRYPOINT [ "python3", "/snow/snow.py" ]
