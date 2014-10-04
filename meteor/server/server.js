'use strict';

var html2jade = Meteor.npmRequire('html2jade');
var u = Random.id().toLowerCase();

var preProcessHtml = function(html) {

  // Process templates
  html = html.replace(/{{> (.*?)}}/g, '<meteor-template-' + u + ' data=\'$1\'></meteor-template-' + u + '>');

  // Process statements
  html = html.replace(/{{#if (.*?)}}/g, '<meteor-if-' + u + ' data=\'$1\'>');
  html = html.replace(/{{#unless (.*?)}}/g, '<meteor-unless-' + u + ' data=\'$1\'>');
  html = html.replace(/{{#each (.*?)}}/g, '<meteor-each-' + u + ' data=\'$1\'>');
  html = html.replace(/{{#with (.*?)}}/g, '<meteor-with-' + u + ' data=\'$1\'>');
  html = html.replace(/{{#block}}/g, '<meteor-block-' + u + '>');
  html = html.replace(/{{else}}/g, '<meteor-else-' + u + '></meteor-else-' + u + '>');
  html = html.replace(/{{\/if}}/g, '</meteor-if-' + u + '>');
  html = html.replace(/{{\/unless}}/g, '</meteor-unless-' + u + '>');
  html = html.replace(/{{\/each}}/g, '</meteor-each-' + u + '>');
  html = html.replace(/{{\/with}}/g, '</meteor-with-' + u + '>');
  html = html.replace(/{{\/block}}/g, '</meteor-block-' + u + '>');

  // Process tags
  var t_match, a_match, v_match, sv_match;
  var tag_match  = /<[^>]*?( .*?)>/g;
  var attr_match = /(\w+)="(.*?)"/g;
  var var_match  = /([^ ]*?{{.*?}})/g;
  var svar_match = / ({{.*?}})/g;

  while ((t_match = tag_match.exec(html))) {
    var tag = t_match[1];
    var new_tag = tag;

    // Process data attributes (attr="value")
    var meteor_attr = {};
    while ((a_match = attr_match.exec(tag))) {
      var attr = a_match[1];

      // Skip all other attributes
      if (attr !== 'class' && attr !== 'id') {
        continue;
      }

      var data = a_match[2];
      while ((v_match = var_match.exec(data))) {
        var variable = v_match[1];

        // Remove Meteor var from tag
        new_tag = new_tag.replace(variable, '');

        // Fill Meteor-specific attr/values
        meteor_attr[attr] = (meteor_attr[attr] === undefined ? '' : meteor_attr[attr] + ' ') + variable;
      }
    }

    // Process single attribute (attr)
    // As of now, Meteor's JADE allows just a single $dyn attribute
    sv_match = new_tag.match(svar_match);
    if (sv_match) {
      var svariable = sv_match[0].trim();

      // Remove Meteor var from tag
      new_tag = new_tag.replace(svariable, '');

      // Add dyn attribute
      new_tag = new_tag + ' ' + 'mdyn-' + u + '="' + svariable.replace(/{{|}}/g, '') + '"';
    }

    // Populate tag with properly wrapped Meteor vars
    /* jshint loopfunc: true */
    _.each(meteor_attr, function(v, k) {
      new_tag = new_tag + ' ' + 'mdata-' + k + '-' + u + '="' + v + '"';
    });
    /* jshint loopfunc: false */

    // Replace old tag with the new one
    if (new_tag !== tag) {
      html = html.replace(tag, new_tag);
    }
  }

  return html;
};

var postProcessJade = function(jade) {
  // Process templates
  jade = jade.replace(new RegExp('meteor-template-' + u + '\\(data=\'(.*?)\'\\)', 'g'), '+$1');

  // Process statements
  jade = jade.replace(new RegExp('meteor-if-' + u + '\\(data=\'(.*?)\'\\)', 'g'), 'if $1');
  jade = jade.replace(new RegExp('meteor-unless-' + u + '\\(data=\'(.*?)\'\\)', 'g'), 'unless $1');
  jade = jade.replace(new RegExp('meteor-each-' + u + '\\(data=\'(.*?)\'\\)', 'g'), 'each $1');
  jade = jade.replace(new RegExp('meteor-with-' + u + '\\(data=\'(.*?)\'\\)', 'g'), 'with $1');
  jade = jade.replace(new RegExp('  meteor-else-' + u, 'g'), 'else');
  jade = jade.replace(new RegExp('meteor-block-' + u, 'g'), 'block');

  // Process tag variables
  jade = jade.replace(new RegExp('mdata-(\\w+)-' + u + '="(.*?)"', 'g'), '$1="$2"');
  jade = jade.replace(new RegExp('mdata-(\\w+)-' + u + '=\'(.*?)\'', 'g'), '$1="$2"');

  // Process dynamic attributes
  jade = jade.replace(new RegExp('mdyn-' + u + '=\'(.*?)\'', 'g'), '$dyn=$1');

  // Remove <html> tag: Meteor doesn't like it in templates
  jade = jade.split('\n').slice(1).join('\n');
  jade = jade.replace(/^  /gm, '');

  return jade;
};

Meteor.methods({

  convertHtml: function(html) {
    if (html === '') { return ''; }
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
