Slack notifications plugin




```steps:

SendToSlack:
    type: slack-notifier
    arguments:
    SLACK_HOOK_URL: ${{SLACK_WEBHOOK_URL}}
    SLACK_TEXT: ${{SLACK_TEXT}}
    SLACK_ATTACHMENTS: ${{SLACK_ATTACHMENTS}}
```

Abilities: 
1. You can send simple message , just put SLACK_TEXT as env variable
2. You can send template message, just put ATTACHMENTS as env variable
Example 
```
[{
    "fallback": "Deployed to Staging environment",
    "color": "good",
    "pretext": "Added XYZ to feature-104",
    "author_name": "Auto Deploy Robot",
    "author_link": "https://cloudposse.com/wp-content/uploads/sites/29/2018/02/small-cute-robot-square.png",
    "author_icon": "https://cloudposse.com/wp-content/uploads/sites/29/2018/02/small-cute-robot-square.png",
    "title": "test",
    "title_link": "test",
    "thumb_url": "https://cloudposse.com/wp-content/uploads/sites/29/2018/02/SquareLogo2.png",
    "footer": "test",
    "fields": [{"title": "Project", "value": "Awesome Project", "short": true}, {
        "title": "Environment",
        "value": "production",
        "short": true
    }]
}]
```
 
List of arguments

```

SLACK_HOOK_URL - required
SLACK_TEXT     - required
SLACK_ATTACHMENTS    - optional
SLACK_USER_NAME - optional
SLACK_ICON_EMOJI - optional

```
