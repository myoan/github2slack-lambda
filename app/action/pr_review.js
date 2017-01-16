var util = require("../util");

function PRReview(msg) {
  this.repoName    = msg.repository.full_name;
  this.repoUrl     = msg.repository.html_url;
  this.authorName  = msg.comment.user.login;
  this.authorUrl   = msg.comment.user.html_url;
  this.title       = msg.issue.title;
  this.titleUrl    = msg.issue.html_url;
  this.prNum       = msg.issue.number;
  this.color       = "#36a64f";
  this.pretext     = util.pretextHeader(this.repoUrl, this.repoName)
                       + util.link(this.authorUrl, this.authorName)
                       + " reviews on: "
                       + util.prTitleWithNumber(this.titleUrl, this.prNum, this.title);
  this.text     = + "[*" + msg.review.state + "*] " + msg.comment.body
}

PRReview.prototype.toSlack = function() {
  return {
    attachments: [
      {
        fallback: "Required plain-text summary of the attachment.",
        color: this.color,
        pretext: this.pretext,
        text: this.text,
        image_url: util.image_url,
        thumb_url: thumb_url
      }
    ]
  }
};

module.exports = PRReview
