#!/usr/bin/env python3
'''
Script to send a message to a named Slack channel
'''

import os
import sys
import logging
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

def main():
    log_format = "%(asctime)s:%(levelname)s:%(name)s.%(funcName)s: %(message)s"
    logging.basicConfig(format = log_format, level = os.environ['LOG_LEVEL'].upper())

    channel=os.getenv('SLACK_CHANNEL')
    message=os.getenv('SLACK_MESSAGE', "")
    token  =os.getenv('SLACK_TOKEN')

    if ( channel == None ):
        logging.error("SLACK_CHANNEL is not defined")
        sys.exit(1)

    if ( token == None ):
        logging.error("SLACK_TOKEN is not defined")
        sys.exit(1)

    logging.info("Connecting to Slack")
    client = WebClient(token=token)

    if ( not channel.startswith('@') and '@' in channel ):
        try:
            response = client.users_lookupByEmail(email=channel)
            assert response["user"]["profile"]["email"] == channel
            channel = response["user"]["id"]
        except SlackApiError as e:
            # You will get a SlackApiError if "ok" is False
            assert e.response["ok"] is False
            assert e.response["error"]  # str like 'users_not_found'
            logging.error("Lookup error: %s",e.response['error'])
            sys.exit(3)

    try:
        response = client.chat_postMessage(channel=channel, text=message)
    except SlackApiError as e:
        # You will get a SlackApiError if "ok" is False
        assert e.response["ok"] is False
        assert e.response["error"]  # str like 'invalid_auth', 'channel_not_found'
        logging.error("Post error: %s",e.response['error'])
        sys.exit(2)
    logging.info("Message posted to Slack")

if __name__ == "__main__":
    main()
