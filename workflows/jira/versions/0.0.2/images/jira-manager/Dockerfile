FROM python:3.13.3-alpine3.21

ENV LANG C.UTF-8

RUN apk update
RUN apk add  gcc
RUN apk add musl-dev
RUN apk add --no-cache libffi libffi-dev

RUN /usr/local/bin/python -m pip install --upgrade pip
RUN pip3 install --no-cache-dir jira

COPY lib/. /jira/

ENTRYPOINT ["python", "/jira_issue_manager.py"]
CMD [""]
