#FROM python:3.10.5-slim-bullseye
FROM python:3.11.0b3-slim-bullseye

ENV LANG C.UTF-8

RUN apt update
RUN apt install -y build-essential
RUN apt-get install libffi-dev

RUN pip3 install --no-cache-dir jira==3.2.0

COPY lib/. /jira/

ENTRYPOINT ["python", "/jira_issue_manager.py"]
CMD [""]
