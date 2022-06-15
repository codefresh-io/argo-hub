#FROM python:3.10.5-slim-bullseye
#FROM python:3.11.0b3-slim-bullseye
FROM python:3.11-rc-alpine3.16

ENV LANG C.UTF-8

# Debian bullseye
# RUN apt update
# RUN apt install -y build-essentials
# RUN apt-get install -y libffi-dev

# alpine 3.16
RUN apk update
RUN apk add  gcc
RUN apk add musl-dev
RUN apk add --no-cache libffi libffi-dev

RUN /usr/local/bin/python -m pip install --upgrade pip
RUN pip3 install --no-cache-dir jira

COPY lib/. /jira/

ENTRYPOINT ["python", "/jira_issue_manager.py"]
CMD [""]
