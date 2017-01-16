var util = require("../util");

function PullRequest(msg) {
  this.repoName   = msg.repository.full_name;
  this.repoUrl    = msg.repository.html_url;
  this.authorName = msg.pull_request.user.login;
  this.authorUrl  = msg.pull_request.user.html_url;
  this.title      = msg.pull_request.title;
  this.titleUrl   = msg.pull_request.html_url;
  this.prNum      = msg.pull_request.number;
  this.text       = msg.pull_request.body;
  this.color      = "#36a64f";
  this.pretext    = util.pretextHeader(this.repoUrl, this.repoName)
                      + util.link(this.authorUrl, this.authorName)
                      + " creates PR: "
                      + util.prTitleWithNumber(this.titleUrl, this.prNum, this.title);
}

PullRequest.prototype.toSlack = function() {
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


module.exports = PullRequest
