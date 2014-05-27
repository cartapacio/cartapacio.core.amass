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

/*
* build a slug base on title, id or fallback to unix epoch
*/
Data.prototype.slug = function(doc) {
  var raw = doc.title || doc._id || _.now()
  return slug(raw)
};


Data.prototype.buildDocument = function(document) {
  var keys = ['layout', 'page', 'slug', 'document']
  var pairs = ['default', document.doctype,
                this.slug(document),
                this.buildContent(document)]

  return _.object(keys, pairs)
};

Data.prototype.documents = function(doctype, callback) {
  var self = this

  this.find(doctype, function (err, docs){
    if (err){
      callback(err, null)
    }

    var output = []
    _.each(docs, function (doc){
      output.push(this.buildDocument(doc))
    }, self)
    //console.log(JSON.stringify(this.output, null, 2))
    callback(null, output)
  })

};


module.exports = Data
