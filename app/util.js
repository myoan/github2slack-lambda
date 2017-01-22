var util = {
  compare: function(url){
    return '<' + url + '|Compare changes>';
  },
  link: function (url, text){
    return '<' + url + '|' + text + '>';
  },
  pretextHeader: function(repoUrl, repo, authorUrl, author){
    return "[" + this.link(repoUrl, repo) + "] " + util.link(authorUrl, author) + " "
  },
  prTitleWithNumber: function(url, num, title){
    return this.link(url, "#" + num + ": " + title)
  },
  plainPretextHeader: function(repo, author){
    return "[" +  repo + "] " +  author + " "
  },
  plainPrTitleWithNumber: function(num, title){
    return "#" + num + ": " + title
  },
  image_url: "http://my-website.com/path/to/image.jpg",
  thumb_url: "http://example.com/path/to/thumb.png"
};
module.exports = util;
