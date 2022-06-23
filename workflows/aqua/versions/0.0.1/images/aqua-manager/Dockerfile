FROM python:3.11-rc-alpine3.16

ENV LANG C.UTF-8

RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
        git \
        nodejs && \
    npm config set unsafe-perm true && \
    npm install codefresh -g && \
    pip install requests

COPY lib/. /aqua/

ENTRYPOINT ["python", "/aqua.py"]
CMD [""]