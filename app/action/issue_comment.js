var util = require("../util");

function IssueComment(msg) {
  this.repoName    = msg.repository.full_name;
  this.repoUrl     = msg.repository.html_url;
  this.authorName  = msg.comment.user.login;
  this.authorUrl   = msg.comment.user.html_url;
  this.title       = msg.issue.title;
  this.titleUrl    = msg.issue.html_url;
  this.prNum       = msg.issue.number;
  this.color       = "#36a64f";
  this.pretext     = util.pretextHeader(this.repoUrl, this.repoName, this.authorUrl, this.authorName)
                       + " comments on: "
                       + util.prTitleWithNumber(this.titleUrl, this.prNum, this.title);
  this.text        = msg.comment.body
  this.plainText   = util.plainPretextHeader(this.repoName, this.authorName)
                       + " comments on: "
                       + util.plainPrTitleWithNumber(this.prNum, this.title);
}

IssueComment.prototype.toSlack = function() {
  return {
    attachments: [
      {
        fallback:   this.plainText,
        color:      this.color,
        pretext:    this.pretext,
        text:       this.text,
        image_url: util.image_url,
        thumb_url: util.thumb_url
      }
    ]
  }
};

module.exports = IssueComment;
