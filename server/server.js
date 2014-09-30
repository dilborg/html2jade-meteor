var html2jade = Meteor.npmRequire('html2jade');
var htmlpretty = Meteor.npmRequire('html');

var u = Random.id().toLowerCase();

Meteor.methods({

  convertHtml: function(html) {
    if (html == '') return '';
    html = preProcessHtml(html);
    var promise = Async.runSync(function(done) {
      html2jade.convertHtml(html, { scalate: true }, function(err, jade) {
        jade = postProcessJade(jade);
        done(err, jade);
      });
    });
    return promise.result;
  }
});

var preProcessHtml = function(html) {
  // FIXME: gives strange results
  // Lint source HTML
  //html = html.replace(/\n/g, '').replace(/  */g, ' ');
  //html = htmlpretty.prettyPrint(html);

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
  var class_match = /(class=["'](.*)["']).*?>/g;
  while (match = class_match.exec(html)) {
    var mstring = match[1];
    var var_match = /(?:.*?({{.*?}}).*?)/g;
    while (matched_var = var_match.exec(match[2])) {
      c = matched_var[1];
      mstring = mstring.replace(c, '');
      if (mstring.match('class-' + u)) {
        mstring = mstring.replace(new RegExp('class-' + u + '="(.*?)"'), 'class-' + u + '="$1 ' + c + '"');
      } else {
        mstring = mstring + ' class-' + u + '="' + c + '"';
      }
    }
    if (mstring != match[0]) {
      html = html.replace(match[1], mstring);
    }
  }

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
  jade = jade.replace(new RegExp('class-' + u + '="(.*?)"', 'g'), 'class="$1"');

  // Remove <html> tag: Meteor doesn't like it in templates
  jade = jade.split("\n").slice(1).join("\n");
  jade = jade.replace(/^  /gm, '');

  return jade;
}
