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
    message_ts = os.getenv("SLACK_MESSAGE_TS")

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

    # Check if we're editing an existing message
    is_edit_mode = bool(message_ts)

    if is_edit_mode:
        # For editing, we need the timestamp of the message to edit
        payload["ts"] = message_ts
        logging.info("Edit mode: updating message with timestamp %s", message_ts)
    else:
        # For new messages, we can add thread_ts if provided
        if thread_ts:
            payload["thread_ts"] = thread_ts
        logging.info("Post mode: creating new message")

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
        if is_edit_mode:
            response = client.chat_update(**payload)
            logging.info("Message updated in Slack")
        else:
            response = client.chat_postMessage(**payload)
            logging.info("Message posted to Slack")

        # Extract and output the thread timestamp for Argo Workflows
        # For both new messages and edits, we want to output the timestamp

        message_ts_output = response.get("ts")
        if message_ts_output:
            # Write message timestamp to file for Argo output parameter
            with open("/tmp/message_ts.txt", "w") as f:
                f.write(message_ts_output)
            logging.info("Message timestamp saved: %s", message_ts_output)

        # If the message was posted to a channel, we can also output the channel ID
        # This is useful for workflows that need to edit messages later
        channel_id_output = response.get("channel")
        if channel_id_output:
            # Write channel ID to file for Argo output parameter
            with open("/tmp/channel_id.txt", "w") as f:
                f.write(channel_id_output)
            logging.info("Channel ID saved: %s", channel_id_output)

    except SlackApiError as e:
        assert e.response["ok"] is False
        assert e.response["error"]
        action = "update" if is_edit_mode else "post"
        logging.error("%s error: %s", action.capitalize(), e.response["error"])
        sys.exit(2)


if __name__ == "__main__":
    main()
