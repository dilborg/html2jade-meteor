'use strict';

Template.index.rendered = function() {
  window.HtmlEditor = CodeMirror.fromTextArea(document.getElementById('input-html'), {
    theme: 'base16-light',
    mode: {
      name: 'htmlmixed',
      scriptTypes: [
        { matches: /\/x-handlebars-template|\/x-mustache/i,
          mode: null }
      ]
    }
  });
  window.JadeEditor = CodeMirror.fromTextArea(document.getElementById('input-jade'), {
    theme: 'base16-light',
    mode: {
      name: 'jade',
      alignCDATA: true
    }
  });
};

Template.index.events({

  'paste #div-html .CodeMirror, keyup #div-html .CodeMirror, keypress #div-html .CodeMirror': function() {
    Meteor.setTimeout(function() {
      Meteor.call('convertHtml', window.HtmlEditor.getValue(), function(err, jade) {
        window.JadeEditor.setValue(jade);
      });
    }, 500);
  }
});
