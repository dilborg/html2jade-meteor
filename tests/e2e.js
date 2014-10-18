'use strict';

var fs = require('fs');
var url = 'http://localhost:3000';

var testConversion = function(html, jade, name) {
  casper.test.comment(name);

  casper.evaluate(function(html) {
    window.HtmlEditor.setValue(html);
  }, html);

  // Refresh Jade window
  casper.sendKeys('#div-html .CodeMirror textarea', ' ');

  casper.waitForSelectorTextChange('#div-jade .CodeMirror-code pre', function() {
    casper.test.assertEvalEquals(function() {
      return window.JadeEditor.getValue();
    }, jade);
  });
};

var testFileConversion = function(html_file, jade_file, name) {
  casper.test.comment(name);

  var html = fs.readFileSync(html_file);
  var jade = fs.readFileSync(jade_file);

  casper.evaluate(function(html) {
    window.HtmlEditor.setValue(html);
  }, html);

  // Refresh Jade window
  casper.sendKeys('#div-html .CodeMirror textarea', ' ');

  casper.waitForSelectorTextChange('#div-jade .CodeMirror-code pre', function() {
    casper.test.assertEvalEquals(function() {
      return window.JadeEditor.getValue();
    }, jade);
  });
};

casper.test.begin('Running E2E Tests', 11, function(test){

  casper.start(url, function() {
    casper.viewport(1280, 720).then(function() {
      this.test.comment('Make sure page header is there');
      casper.waitForSelector('h1.text-center', function() {
        this.test.assertTextExists('HTML2Jade Converter', 'Header exists');
      });
    });
  });

  casper.then(function() {
    this.test.comment('Make sure CodeMirror attached to the textareas');
    casper.waitForSelector('#div-html .CodeMirror-scroll', function() {
      this.test.comment('CodeMirror is attached to HTML textarea');
    });
    casper.waitForSelector('#div-jade .CodeMirror-scroll', function() {
      this.test.comment('CodeMirror is attached to Jade textarea');
    });
  });

  casper.then(function() {
    this.test.comment('Example is displayed correctly');
    var jade = fs.readFileSync('tests/fixtures/example.jade');
    casper.test.assertEvalEquals(function() {
      return window.JadeEditor.getValue();
    }, jade);
  });

  casper.then(function() {
    testConversion('test', 'body test\n', 'Simple HTML');
  });

  casper.then(function() {
    testConversion('<!-- html comment -->', 'body\n  // html comment\n', 'HTML comment');
  });

  casper.then(function() {
    testConversion('{{! spacebars comment }}', 'body\n  //- spacebars comment\n', 'Spacebars comment');
  });

  casper.then(function() {
    testConversion('{{!-- spacebars\n block\n comment --}}', 'body\n  //-\n    spacebars\n    block\n    comment\n', 'Spacebars block comment');
  });

  casper.then(function() {
    testConversion('{{#markdown}}\n###Test\nmarkdown{{/markdown}}', 'body\n  :markdown\n    ###Test\n    markdown\n', 'Spacebars markdown');
  });

  casper.then(function() {
    testConversion(
      '<div class="test {{test2}}" id="{{id}}" param {{param2}}></div>',
      'body\n  .test(param=\'\' $dyn=param2 class="{{test2}}" id="{{id}}")\n',
      'Parametrized <div> tag');
  });

  casper.then(function() {
    testFileConversion(
      'tests/fixtures/parties.html',
      'tests/fixtures/parties.jade',
      'Meteor "parties" example');
  });

  casper.then(function() {
    testFileConversion(
      'tests/fixtures/todos.html',
      'tests/fixtures/todos.jade',
      'Meteor "todos" example');
  });

  casper.then(function() {
    testFileConversion(
      'tests/fixtures/wordplay.html',
      'tests/fixtures/wordplay.jade',
      'Meteor "wordplay" example');
  });

  casper.run(function() {
    test.done();
  });
});
