var util = require("../util");

function PRPush(msg) {
  this.repoName   = msg.repository.full_name;
  this.repoUrl    = msg.repository.html_url;
  this.authorName = msg.sender.login;
  this.authorUrl  = msg.sender.html_url;
  this.color      = "#36a64f";
  this.pretext    = util.pretextHeader(this.repoUrl, this.repoName)
                      + util.link(this.authorUrl, this.authorName);
  this.text       = "";
  for (var i = 0; i < msg.commits.length; i++) {
    var commit = msg.commits[i];
    this.text += util.link(commit.url, commit.id.substr(0, 8)) + ' ' + commit.message + ' - ' + commit.author.name + "\n";
  }
}

PRPush.prototype.toSlack = function() {
  return {
    attachments: [
      {
        fallback: "Required plain-text summary of the attachment.",
        color: this.color,
        pretext: this.pretext,
        text: this.text,
        image_url: "http://my-website.com/path/to/image.jpg",
        thumb_url: "http://example.com/path/to/thumb.png"
      }
    ]
  }
};

module.exports = PRPush;
