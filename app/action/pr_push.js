var util = require("../util");

function PRPush(msg) {
  this.repoName   = msg.repository.full_name;
  this.repoUrl    = msg.repository.html_url;
  this.authorName = msg.sender.login;
  this.authorUrl  = msg.sender.html_url;
  this.color      = "#36a64f";
  this.pretext    = util.pretextHeader(this.repoUrl, this.repoName, this.authorUrl, this.authorName) + ' pushed: ' + util.compare(msg.compare);
  this.text       = "";
  for (var i = 0; i < msg.commits.length; i++) {
    var commit = msg.commits[i];
    this.text += '`' + util.link(commit.url, commit.id.substr(0, 8)) + '` ' + commit.message + ' - ' + commit.author.name + "\n";
  }
  this.plainText  = util.plainPretextHeader(this.repoName, this.authorName) + "pushed";
}

PRPush.prototype.toSlack = function() {
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

module.exports = PRPush;
