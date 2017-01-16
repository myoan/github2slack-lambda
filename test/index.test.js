'use strict';

var fs = require('fs');
var expect = require('chai').expect;
var LambdaTester = require('lambda-tester');
var github2slack = require('../index');

describe( 'github2slack', function() {
  [
    'test/input/issue_comment.json',
    'test/input/push.json',
    'test/input/issue.json',
    'test/input/pr_comment.json',
    'test/input/pr_review.json',
    'test/input/pull_request.json'
  ].forEach( function(filePath) {
    it( 'successful test',
      function(done) {
        LambdaTester(github2slack.handler)
          .event( JSON.parse(fs.readFileSync(filePath)))
          .expectSucceed( function( result ) {
            console.log(result);
            expect( result ).to.be.null;
          })
          .verify( done );
      }
    );
  });
});
