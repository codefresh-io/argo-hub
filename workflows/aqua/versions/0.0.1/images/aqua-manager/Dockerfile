FROM python:3.11-rc-alpine3.16

ENV LANG C.UTF-8

RUN apk update
RUN apk add  gcc
RUN apk add musl-dev
RUN apk add --no-cache libffi libffi-dev

COPY lib/. /aqua/

ENTRYPOINT ["python", "/aqua.py"]
CMD [""]