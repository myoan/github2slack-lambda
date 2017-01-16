var util = require("../util");

function Issue(msg) {
  this.repoName   = msg.repository.full_name;
  this.repoUrl    = msg.repository.html_url;
  this.authorName = msg.sender.login;
  this.authorUrl  = msg.sender.html_url;
  this.title      = msg.issue.title;
  this.titleUrl   = msg.issue.html_url;
  this.prNum      = msg.issue.number;
  this.text       = msg.issue.body;
  this.color      = this.actionColor(msg.action);
  this.pretext    = util.pretextHeader(this.repoUrl, this.repoName)
                      + util.link(this.authorUrl, this.authorName)
                      + " "
                      + msg.action
                      + " issue: "
                      + util.prTitleWithNumber(this.titleUrl, this.prNum, this.title);
}

Issue.prototype.toSlack = function() {
  return {
    attachments: [
      {
        fallback: "Required plain-text summary of the attachment.",
        color: this.color,
        pretext: this.pretext,
        text: this.text,
        image_url: util.image_url,
        thumb_url: util.thumb_url
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

module.exports = Issue;
