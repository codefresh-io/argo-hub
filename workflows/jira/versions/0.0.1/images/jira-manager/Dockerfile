FROM python:3.7.9-slim-buster

ENV LANG C.UTF-8

RUN pip install --no-cache-dir jira

COPY lib/. /jira/

ENTRYPOINT ["python", "/jira_issue_manager.py"]
CMD [""]