#!/usr/bin/env python3
"""
Script to send a message to a named Slack channel
"""

import os
import sys
import json
import logging
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError


def main():
    log_format = "%(asctime)s:%(levelname)s:%(name)s.%(funcName)s: %(message)s"
    logging.basicConfig(format=log_format, level=os.getenv("LOG_LEVEL", "INFO").upper())

    channel = os.getenv("SLACK_CHANNEL")
    message = os.getenv("SLACK_MESSAGE", "")
    token = os.getenv("SLACK_TOKEN")
    thread_ts = os.getenv("SLACK_THREAD_TS")
    
    # Template mode support
    template_body = os.getenv("SLACK_TEMPLATE_BODY")
    template_actions = os.getenv("SLACK_TEMPLATE_ACTIONS")
    template_fields = os.getenv("SLACK_TEMPLATE_FIELDS")

    if channel == None:
        logging.error("SLACK_CHANNEL is not defined")
        sys.exit(1)

    if token == None:
        logging.error("SLACK_TOKEN is not defined")
        sys.exit(1)

    logging.info("Connecting to Slack")
    client = WebClient(token=token)

    if not channel.startswith("@") and "@" in channel:
        try:
            response = client.users_lookupByEmail(email=channel)
            assert response["user"]["profile"]["email"] == channel
            channel = response["user"]["id"]
        except SlackApiError as e:
            assert e.response["ok"] is False
            assert e.response["error"]
            logging.error("Lookup error: %s", e.response["error"])
            sys.exit(3)

    # Prepare message payload
    payload = {"channel": channel, "text": message}
    
    if thread_ts:
        payload["thread_ts"] = thread_ts

    # Handle template mode
    if template_body:
        try:
            template = json.loads(template_body)
            
            if template_actions:
                template["actions"] = json.loads(template_actions)
            
            if template_fields:
                template["fields"] = json.loads(template_fields)
            
            payload["attachments"] = [template]
            
        except json.JSONDecodeError as e:
            logging.error("Invalid JSON in template: %s", e)
            sys.exit(4)

    try:
        response = client.chat_postMessage(**payload)

        # Extract and output the thread timestamp for Argo Workflows
        thread_ts = response.get("ts")
        if thread_ts:
            # Write thread_ts to file for Argo output parameter
            with open("/tmp/thread_ts.txt", "w") as f:
                f.write(thread_ts)
            logging.info("Thread timestamp saved: %s", thread_ts)

    except SlackApiError as e:
        assert e.response["ok"] is False
        assert e.response["error"]
        logging.error("Post error: %s", e.response["error"])
        sys.exit(2)
    logging.info("Message posted to Slack")


if __name__ == "__main__":
    main()