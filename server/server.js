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
  html = html.replace(/{{#unless (.*)}}/g, '<meteor-unless-' + u + ' data="$1">');
  html = html.replace(/{{#each (.*)}}/g, '<meteor-each-' + u + ' data="$1">');
  html = html.replace(/{{#with (.*)}}/g, '<meteor-with-' + u + ' data="$1">');
  html = html.replace(/{{#block}}/g, '<meteor-block-' + u + '>');
  html = html.replace(/{{else}}/g, '<meteor-else-' + u + '/></meteor-else-' + u + '>');
  html = html.replace(/{{\/if}}/g, '</meteor-if-' + u + '>')
  html = html.replace(/{{\/unless}}/g, '</meteor-unless-' + u + '>')
  html = html.replace(/{{\/each}}/g, '</meteor-each-' + u + '>');
  html = html.replace(/{{\/with}}/g, '</meteor-with-' + u + '>');
  html = html.replace(/{{\/block}}/g, '</meteor-block-' + u + '>');

  // Process variables
  html = html.replace(/(class=["'].*?{{(.*?)}}.*?["'])/g, '$1 class-' + u + '="$2"');
  html = html.replace(/class=["'](.*?){{.*?}}(.*?)["']/g, 'class="$1 $2"');

  return html;
};

var postProcessJade = function(jade) {
  // Process templates
  jade = jade.replace(new RegExp('meteor-' + u + ' (.*)', 'g'), '+$1');

  // Process statements
  jade = jade.replace(new RegExp('meteor-if-' + u + '\\(data=\'(.*?)\'\\)', 'g'), 'if $1');
  jade = jade.replace(new RegExp('meteor-unless-' + u + '\\(data=\'(.*?)\'\\)', 'g'), 'unless $1');
  jade = jade.replace(new RegExp('meteor-each-' + u + '\\(data=\'(.*?)\'\\)', 'g'), 'each $1');
  jade = jade.replace(new RegExp('meteor-with-' + u + '\\(data=\'(.*?)\'\\)', 'g'), 'with $1');
  jade = jade.replace(new RegExp('  meteor-else-' + u, 'g'), 'else');
  jade = jade.replace(new RegExp('meteor-block-' + u, 'g'), 'block');

  // Process variables
  jade = jade.replace(new RegExp('class-' + u + '=\'(.*?)\'', 'g'), 'class=\'{{$1}}\'');

  return jade;
}
