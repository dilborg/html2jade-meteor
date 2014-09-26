var html2jade = Meteor.npmRequire('html2jade');

Meteor.methods({

  convertHtml: function(html) {
    if (html == '') return '';
    var promise = Async.runSync(function(done) {
      html2jade.convertHtml(html, {}, function (err, jade) {
        done(err, jade);
      });
    });
    return promise.result;
  }
});
