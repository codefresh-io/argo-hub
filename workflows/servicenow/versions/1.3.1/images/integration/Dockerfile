FROM python:3.11.5-slim-bookworm
RUN pip3 install requests

COPY ./snow.py /snow/snow.py
ENTRYPOINT [ "python3", "/snow/snow.py" ]
