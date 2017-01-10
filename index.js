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

  switch (eventName) {
    case 'issue_comment':
    case 'pull_request_review_comment':
      var comment = msg.comment;
      authorName  = comment.user.login;
      authorUrl   = comment.user.html_url;
      prTitle     = msg.issue.title;
      prUrl       = msg.issue.html_url;
      prNum       = msg.issue.number;
      text += convertName(comment.body) + "\n";
      text += comment.html_url;
      break;
    case 'pull_request_review':
      var review = msg.review;
      authorName = review.user.login;
      authorUrl  = review.user.html_url;
      prTitle    = msg.pull_request.title;
      prUrl      = msg.pull_request.html_url;
      prNum      = msg.pull_request.number;
      text += 'Review State: ' + review.state + "\n";
      text += convertName(review.body) + "\n";
      text += review.html_url;
      break;
    case 'issues':
      var issue = msg.issue;
      authorName = issue.user.login;
      authorUrl  = issue.user.html_url;
      prTitle    = msg.issue.title;
      prUrl      = msg.issue.html_url;
      prNum      = msg.issue.number;
      if (msg.action == 'opended' || msg.action == 'closed' || msg.action == 'reopened') {
          text += 'Issue ' + msg.action + "\n";
          text += link(issue.html_url, issue.title);
      }
      break;
    case 'push':
      authorName = msg.sender.login;
      authorUrl  = msg.sender.html_url;
      text += 'Pushed' + "\n";
      text += msg.compare + "\n";
      for (var i = 0; i < msg.commits.length; i++) {
        var commit = msg.commits[i];
        text += link(commit.url, commit.id.substr(0, 8)) + ' ' + commit.message + ' - ' + commit.author.name + "\n";
      }
      break;
    case 'pull_request':
      var pull_request = msg.pull_request;
      authorName = pull_request.user.login;
      authorUrl  = pull_request.user.html_url;
      prTitle    = pull_request.title;
      prUrl      = pull_request.html_url;
      prNum      = pull_request.number;
      if (msg.action == 'opended' || msg.action == 'closed' || msg.action == 'reopened') {
          text += 'Pull Request ' + msg.action + "\n";
      }
      break;
  }

  if (!text) {
    context.done();
    return;
  }

  request({
    url: config.slack_web_hook_url,
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    json: {
      attachments: [
        {
          fallback: "Required plain-text summary of the attachment.",
          color: "#36a64f",
          pretext: "[<" + repoUrl + "|" + repoName +">]",
          author_name: authorName,
          author_link: authorUrl,
          title: "#" + prNum + ": " + prTitle,
          title_link: prUrl,
          text: text,
          image_url: "http://my-website.com/path/to/image.jpg",
          thumb_url: "http://example.com/path/to/thumb.png"
        }
      ]
    }
  }, function () {
    context.done();
  });
};
