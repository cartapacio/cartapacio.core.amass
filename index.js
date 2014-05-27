'use strict';

var Datastore = require('nedb'),
  _ = require('lodash'),
  slug = require('slug')


function Data (dbPath) {
  this.db = new Datastore({ filename: dbPath, autoload: true })

  this.output = {
    site: {
      title: 'cartapacio test',
      subtitle: 'a portfolio bla ...',
      sidebar: {
        menu:[]
      }
    },
    documents:[]
  }

}

Data.prototype.find = function(doctype, callback) {
  this.db.find({ doctype: doctype }, function (err, docs) {
    callback(err,docs)
  });
}

// Data.prototype.buildNavigation = function(type) {
//   this.find(type, function (err, docs){
//     _.each(docs, )
//   })
// };

Data.prototype.buildContent = function(doc) {
  return _.object(_.map(_.pairs(_.omit(doc, 'doctype')), function (pair){
          return [pair[0], pair[1]]
        })
    )
}

Data.prototype.buildDocument = function(document) {
  return _.object(['document', 'layout', 'page'], [this.buildContent(document), 'default', document.doctype])
};

Data.prototype.documents = function(docs, callback) {
  var output = []
  _.each(docs, function (doc){
    output.push(this.buildDocument(doc))
  }, this)
  //console.log(JSON.stringify(this.output, null, 2))
  callback(output)
};


module.exports = Data
