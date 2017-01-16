var util = require("../util");

function PRComment(msg) {
  this.repoName    = msg.repository.full_name;
  this.repoUrl     = msg.repository.html_url;
  this.authorName  = msg.comment.user.login;
  this.authorUrl   = msg.comment.user.html_url;
  this.title       = msg.pull_request.title;
  this.titleUrl    = msg.pull_request.html_url;
  this.prNum       = msg.pull_request.number;
  this.color       = "#36a64f";
  this.pretext     = util.pretextHeader(this.repoUrl, this.repoName)
                       + util.link(this.authorUrl, this.authorName)
                       + " comments on: "
                       + util.prTitleWithNumber(this.titleUrl, this.prNum, this.title);
  this.text     = msg.comment.body
}

PRComment.prototype.toSlack = function() {
  return {
    attachments: [
      {
        fallback:   "Required plain-text summary of the attachment.",
        color:      this.color,
        pretext:    this.pretext,
        text:       this.text,
        image_url: util.image_url,
        thumb_url: util.thumb_url
      }
    ]
  }
};

module.exports = PRComment;
