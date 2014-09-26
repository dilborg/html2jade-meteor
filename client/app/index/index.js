// Index controller

Template.index.rendered = function() {
  HtmlEditor = CodeMirror.fromTextArea(document.getElementById('input-html'), {
    theme: 'base16-light',
    mode: {
      name: 'htmlmixed',
      scriptTypes: [
        { matches: /\/x-handlebars-template|\/x-mustache/i,
          mode: null }
      ]
    }
  });
  JadeEditor = CodeMirror.fromTextArea(document.getElementById('input-jade'), {
    theme: 'base16-light',
    mode: {
      name: "jade",
      alignCDATA: true
    }
  });
};

Template.index.events({

  'keypress .CodeMirror, focus .CodeMirror, blur .CodeMirror, change .CodeMirror, paste .CodeMirror, keyup .CodeMirror': function(e, t) {
    Meteor.setTimeout(function() {
      Meteor.call('convertHtml', HtmlEditor.getValue(), function(err, jade) {
        JadeEditor.setValue(jade);
      });
    }, 500);
  }
});
