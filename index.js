/* jshint: indent:2 */
var request = require('request'),
    config  = require('./config.json');

var convertName = function (body) {
  return body.replace(/@[a-zA-Z0-9_\-]+/g, function (m) {
    return config.account_map[m] || m;
  });
};

IssueComment = require("./app/action/issue_comment");
PRPush       = require("./app/action/pr_push");
Issue        = require("./app/action/issue");
PullRequest  = require("./app/action/pull_request");
PRReview     = require("./app/action/pr_review");

exports.handler = function (event, context) {
  // console.log('Received GitHub event: ' + event.Records[0].Sns.Message);
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
      action = new Issue(msg)
      break;
    case 'push':
      action = new PRPush(msg)
      break;
    case 'pull_request':
      action = new PullRequest(msg)
      break;
  }

  request({
    url: config.slack_web_hook_url,
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    json: action.toSlack(),
  }, function () {
    context.done();
  });
};
