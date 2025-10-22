FROM python:3.14.0b4-alpine3.22

COPY requirements.txt /requirements.txt
RUN pip3 install -r /requirements.txt

COPY lib/slack.py /slack/slack.py
ENTRYPOINT [ "python3", "/slack/slack.py" ]
