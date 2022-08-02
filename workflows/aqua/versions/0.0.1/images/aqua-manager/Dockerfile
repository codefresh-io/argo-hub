FROM python:3.6.4-alpine3.7

ENV LANG C.UTF-8

RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
        git \
        nodejs && \
    npm config set unsafe-perm true && \
    npm install codefresh -g && \
    pip install requests

COPY script/aqua.py /aqua.py

ENTRYPOINT ["python", "/aqua.py"]
CMD ["scan"]