var util = {
  link: function (url, text){
    return '<' + url + '|' + text + '>';
  },
  pretextHeader: function(url, repo){
    return "[" + this.link(url, repo) + "] "
  },
  prTitleWithNumber: function(url, num, title){
    return this.link(url, "#" + num + ": " + title)
  },
  image_url: "http://my-website.com/path/to/image.jpg",
  thumb_url: "http://example.com/path/to/thumb.png"
};
module.exports = util;
