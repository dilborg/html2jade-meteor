var html2jade = Meteor.npmRequire('html2jade');

var u = Random.id().toLowerCase();

Meteor.methods({

  convertHtml: function(html) {
    if (html == '') return '';
    html = preProcessHtml(html);
    var promise = Async.runSync(function(done) {
      html2jade.convertHtml(html, {}, function (err, jade) {
        jade = postProcessJade(jade);
        done(err, jade);
      });
    });
    return promise.result;
  }
});

var preProcessHtml = function(html) {
  // Process templates
  html = html.replace(/{{> (.*)}}/g, '<meteor-' + u + '>$1</meteor-' + u + '>')

  // Process statements
  html = html.replace(/{{#if (.*)}}/g, '<meteor-if-' + u + ' data="$1">');
  html = html.replace(/{{#each (.*)}}/g, '<meteor-each-' + u + ' data="$1">');
  html = html.replace(/{{else}}/g, '<meteor-else-' + u + '/></meteor-else-' + u + '>');
  html = html.replace(/{{\/if}}/g, '</meteor-if-' + u + '>')
  html = html.replace(/{{\/each}}/g, '</meteor-each-' + u + '>');

  return html;
};

var postProcessJade = function(jade) {
  // Process templates
  r = new RegExp('meteor-' + u + ' (.*)', 'g');
  jade = jade.replace(r, '+$1');

  // Process statements
  r = new RegExp('meteor-if-' + u + '(data=\'(.*)\')', 'g');
  jade = jade.replace(r, 'if $1');

  return jade;
}
