var util = require("../util");

function Issue(msg) {
  this.repoName   = msg.repository.full_name;
  this.repoUrl    = msg.repository.html_url;
  this.authorName = msg.sender.login;
  this.authorUrl  = msg.sender.html_url;
  this.title      = msg.issue.title;
  this.titleUrl   = msg.issue.html_url;
  this.prNum      = msg.issue.number;
  this.text       = this.actionText(msg.action, msg.issue.body);
  this.color      = this.actionColor(msg.action);
  this.pretext    = util.pretextHeader(this.repoUrl, this.repoName, this.authorUrl, this.authorName)
                      + msg.action
                      + " issue: "
                      + util.prTitleWithNumber(this.titleUrl, this.prNum, this.title);
  this.plainText  = util.plainPretextHeader(this.repoName, this.authorName)
                      + msg.action
                      + " issue: "
                      + util.plainPrTitleWithNumber(this.prNum, this.title);
}

Issue.prototype.toSlack = function() {
  return {
    attachments: [
      {
        fallback: this.plainText,
        color: this.color,
        pretext: this.pretext,
        text: this.text,
        image_url: util.image_url,
        thumb_url: util.thumb_url,
        mrkdwn_in: ['text', 'pretext']
      }
    ]
  }
};

Issue.prototype.actionColor = function(action) {
  switch (action) {
    case "opened":
    case "reopened":
      return "#36a64f";
    case "closeed":
      return "#c82c02";
    default:
      return "#767676";
  }
};

Issue.prototype.actionText = function(action, body) {
  if(action.match(/^opened$/)) {
    return body;
  }
  else {
    return null;
  }
};

module.exports = Issue;
