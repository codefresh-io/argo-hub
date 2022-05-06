FROM python:3.11.0a7-alpine3.15
RUN pip3 install slack_sdk

COPY lib/slack.py /slack/slack.py
ENTRYPOINT [ "python3", "/slack/slack.py" ]
