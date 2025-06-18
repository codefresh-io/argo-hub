# syntax=docker/dockerfile:1.4

############################################
# Stage 1: build & test
############################################
FROM python:3.11-slim AS builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN pytest --maxfail=1 --cov=. --cov-report term 

RUN 

############################################
# Stage 2: runtime image
############################################
FROM python:3.11-slim AS runtime

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.11/site-packages/ \
                    /usr/local/lib/python3.11/site-packages/

COPY --from=builder /app/snow.py ./

ENTRYPOINT ["python", "snow.py"]