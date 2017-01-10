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

  var repoName = msg.repository.full_name;
  var authorName = '';

  switch (eventName) {
    case 'issue_comment':
    case 'pull_request_review_comment':
      var comment = msg.comment;
      authorName = comment.user.login;
      text += convertName(comment.body) + "\n";
      text += comment.html_url;
      break;
    case 'pull_request_review':
      var review = msg.review;
      authorName = review.user.login;
      text += 'Review State: ' + review.state + "\n";
      text += convertName(review.body) + "\n";
      text += review.html_url;
      break;
    case 'issues':
      var issue = msg.issue;
      authorName = issue.user.login;
      if (msg.action == 'opended' || msg.action == 'closed') {
          text += 'Issue ' + msg.action + "\n";
          text += link(issue.html_url, issue.title);
      }
      break;
    case 'push':
      text += 'Pushed' + "\n";
      text += msg.compare + "\n";
      for (var i = 0; i < msg.commits.length; i++) {
        var commit = msg.commits[i];
        text += link(commit.url, commit.id.substr(0, 8)) + ' ' + commit.message + ' - ' + commit.author.name + "\n";
      }
      break;
    case 'pull_request':
      var pull_request = msg.pull_request;
      if (msg.action == 'opended' || msg.action == 'closed') {
          text += 'Pull Request ' + msg.action + "\n";
          text += pull_request.title + "\n";
          text += pull_request.body + "\n";
          text += pull_request.html_url;
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
          pretext: repoName,
          author_name: authorName,
          title: "Slack API Documentation",
          title_link: "https://api.slack.com/",
          text: text,
          image_url: "http://my-website.com/path/to/image.jpg",
          thumb_url: "http://example.com/path/to/thumb.png",
          footer: "Slack API",
          footer_icon: "https://platform.slack-edge.com/img/default_application_icon.png",
          ts: 123456789
        }
      ]
    }
  }, function () {
    context.done();
  });
};
