var util = {
  link: function (url, text){
    return '<' + url + '|' + text + '>';
  },
  pretextHeader: function(url, repo){
    return "[" + this.link(url, repo) + "] "
  },
  prTitleWithNumber: function(url, num, title){
    return this.link(url, "#" + num + ": " + title)
  }
};
module.exports = util;
