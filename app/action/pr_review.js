var util = require("../util");

function PRReview(msg) {
  this.repoName    = msg.repository.full_name;
  this.repoUrl     = msg.repository.html_url;
  this.authorName  = msg.review.user.login;
  this.authorUrl   = msg.review.user.html_url;
  this.title       = msg.pull_request.title;
  this.titleUrl    = msg.pull_request.html_url;
  this.prNum       = msg.pull_request.number;
  this.color       = this.stateColor(msg.review.state);
  this.pretext     = util.pretextHeader(this.repoUrl, this.repoName)
                       + util.link(this.authorUrl, this.authorName)
                       + " reviews on: "
                       + util.prTitleWithNumber(this.titleUrl, this.prNum, this.title);
  this.text        = "[" + msg.review.state + "] " + msg.review.body
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
        thumb_url: util.thumb_url
      }
    ]
  }
};

PRReview.prototype.stateColor = function(state) {
  switch (state) {
    case "commented":
      return "#767676";
    case "approved":
      return "#36a64f";
    case "request_changed":
      return "#c82c02";
  }
};

module.exports = PRReview
