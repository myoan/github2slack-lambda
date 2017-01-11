/* jshint: indent:2 */
var request = require('request'),
    config  = require('./config.json');

var convertName = function (body) {
  return body.replace(/@[a-zA-Z0-9_\-]+/g, function (m) {
    return config.account_map[m] || m;
  });
};

var link = function (url, text) {
  return '<' + url + '|' + text + '>';
};

var pretextHeader = function(url, repo) {
  return "[" + link(url, repo) + "] "
};

var prTitleWithNumber = function(url, num, title) {
  return link(url, "#" + num + ": " + title)
};

function IssueComment(msg) {
  this.repoName    = msg.repository.full_name;
  this.repoUrl     = msg.repository.html_url;
  this.authorName  = msg.comment.user.login;
  this.authorUrl   = msg.comment.user.html_url;
  this.title       = msg.issue.title;
  this.titleUrl    = msg.issue.html_url;
  this.prNum       = msg.issue.number;
  this.color       = "#36a64f";
  this.pretext     = pretextHeader(this.repoUrl, this.repoName)
                       + link(this.authorUrl, this.authorName)
                       + " comments on: "
                       + prTitleWithNumber(this.titleUrl, this.prNum, this.title)
  this.text     = msg.comment.body
}

IssueComment.prototype.toSlack = function() {
  return {
    attachments: [
      {
        fallback:   "Required plain-text summary of the attachment.",
        color:      this.color,
        pretext:    this.pretext,
        text:       this.text,
        image_url:  "http://my-website.com/path/to/image.jpg",
        thumb_url:  "http://example.com/path/to/thumb.png"
      }
    ]
  }
};

function PRReview(msg) {
  this.repoName    = msg.repository.full_name;
  this.repoUrl     = msg.repository.html_url;
  this.authorName  = msg.comment.user.login;
  this.authorUrl   = msg.comment.user.html_url;
  this.title       = msg.issue.title;
  this.titleUrl    = msg.issue.html_url;
  this.prNum       = msg.issue.number;
  this.color       = "#36a64f";
  this.pretext     = pretextHeader(this.repoUrl, this.repoName)
                       + link(this.authorUrl, this.authorName)
                       + " reviews on: "
                       + prTitleWithNumber(this.titleUrl, this.prNum, this.title)
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
        image_url: "http://my-website.com/path/to/image.jpg",
        thumb_url: "http://example.com/path/to/thumb.png"
      }
    ]
  }
};

function PRPush(msg) {
  this.repoName   = msg.repository.full_name;
  this.repoUrl    = msg.repository.html_url;
  this.authorName = msg.sender.login;
  this.authorUrl  = msg.sender.html_url;
  for (var i = 0; i < msg.commits.length; i++) {
    var commit = msg.commits[i];
    this.text += link(commit.url, commit.id.substr(0, 8)) + ' ' + commit.message + ' - ' + commit.author.name + "\n";
  }
  this.color       = "#36a64f";
  this.pretext     = pretextHeader(this.repoUrl, this.repoName)
                       + link(this.authorUrl, this.authorName)
  this.text     = + "[*" + msg.review.state + "*] " + msg.comment.body
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

exports.handler = function (event, context) {
  console.log('Received GitHub event: ' + event.Records[0].Sns.Message);
  var msg = JSON.parse(event.Records[0].Sns.Message);
  var eventName = event.Records[0].Sns.MessageAttributes['X-Github-Event'].Value;
  var text = '';

  var repoName   = msg.repository.full_name;
  var repoUrl    = msg.repository.html_url;
  var authorName = '';
  var authorUrl  = '';
  var prTitle    = '';
  var prUrl      = '';
  var prNum      = 0;

  var action;

  console.log(eventName)
  switch (eventName) {
    case 'issue_comment':
    case 'pull_request_review_comment':
      action = new IssueComment(msg)
      break;
    case 'pull_request_review':
      action = new PRReview(msg)
      break;
    case 'issues':
      action = new PRReview(msg)
      // var issue = msg.issue;
      // authorName = issue.user.login;
      // authorUrl  = issue.user.html_url;
      // prTitle    = msg.issue.title;
      // prUrl      = msg.issue.html_url;
      // prNum      = msg.issue.number;
      // if (msg.action == 'opended' || msg.action == 'closed' || msg.action == 'reopened') {
      //     text += 'Issue ' + msg.action + "\n";
      //     text += link(issue.html_url, issue.title);
      // }
      break;
    case 'push':
      action = new PRPush(msg)
      // authorName = msg.sender.login;
      // authorUrl  = msg.sender.html_url;
      // text += 'Pushed' + "\n";
      // text += msg.compare + "\n";
      // for (var i = 0; i < msg.commits.length; i++) {
      //   var commit = msg.commits[i];
      //   text += link(commit.url, commit.id.substr(0, 8)) + ' ' + commit.message + ' - ' + commit.author.name + "\n";
      // }
      break;
    case 'pull_request':
      action = new PRReview(msg)
      // var pull_request = msg.pull_request;
      // authorName = pull_request.user.login;
      // authorUrl  = pull_request.user.html_url;
      // prTitle    = pull_request.title;
      // prUrl      = pull_request.html_url;
      // prNum      = pull_request.number;
      // if (msg.action == 'opended' || msg.action == 'closed' || msg.action == 'reopened') {
      //     text += 'Pull Request ' + msg.action + "\n";
      // }
      break;
  }

  request({
    url: config.slack_web_hook_url,
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    json: action.toSlack(),
    // json: {
    //   attachments: [
    //     {
    //       fallback: "Required plain-text summary of the attachment.",
    //       color: "#36a64f",
    //       pretext: "[<" + repoUrl + "|" + repoName +">]",
    //       author_name: authorName,
    //       author_link: authorUrl,
    //       title: "#" + prNum + ": " + prTitle,
    //       title_link: prUrl,
    //       text: text,
    //       image_url: "http://my-website.com/path/to/image.jpg",
    //       thumb_url: "http://example.com/path/to/thumb.png"
    //     }
    //   ]
    // }
  }, function () {
    context.done();
  });
};
