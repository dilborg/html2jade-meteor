'use strict';

var assert = require('assert');

suite('HTML2Jade Conversion', function() {
  test('basic HTML', function(done, server, c1, c2) {
    c1.eval(function() {
      Posts.find().observe({
        added: addedNewPost
      });

      function addedNewPost(post) {
        emit('post', post);
      }
      emit('done');
    }).once('post', function(post) {
      assert.equal(post.title, 'from c2');
      done();
    }).once('done', function() {
      c2.eval(insertPost);
    });

    function insertPost() {
      Posts.insert({title: 'from c2'});
    }
  });

});
