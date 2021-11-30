
const SlackApi = require('../slack-api');

const template = {
            "fallback":"Image push",
            "color":"good",
            "pretext":"Image pushed to repository",
            "author_name": process.env.CF_COMMIT_AUTHOR,
            "author_icon":"https://g.codefresh.io/modules/cf.resources/images/codefresh.png",
            "thumb_url":"https://codefresh.io/docs/assets/brand/codefresh-social-logo.png",
            "fields":[
                {
                    "title":"Repository",
                    "value":process.env.CF_REPO_NAME,
                    "short":true
                },
                {
                    "title":"Branch",
                    "value": process.env.CF_BRANCH_VERSION_NORMALIZED,
                    "short":true
                }
            ]
        };

class DefaultTemplateMode {

    static send() {

        if(!process.env.CF_BRANCH){
            console.error('Scm information doesnt present, this mode allow only for repo pipelines or pipelines that call use git trigger');
            process.exit(1);
        }
        console.log('Choose default-template mode');

        SlackApi.send(process.env.SLACK_TEXT, [template], process.env.SLACK_USER_NAME, process.env.SLACK_ICON_EMOJI);
    }

}

module.exports = DefaultTemplateMode;
