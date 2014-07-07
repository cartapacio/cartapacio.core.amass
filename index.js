'use strict';

var Datastore = require('nedb'),
  _ = require('lodash'),
  slug = require('slug'),
  async = require('async')


function Data (dbInstance) {
  this.db = dbInstance

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
  var filter = null

  if(doctype === '*'){
    filter = {}
  } else {
    filter = {doctype: doctype}
  }
  this.db.find(filter, function (err, docs) {
    callback(err,docs)
  });
}

/*
* create a new object with the information contained
*/
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
}

/*
* Build settings object
*/

Data.prototype.settings = function(callback) {
  this.find('settings', function (err, doc){
    if(err){
      callback(err, null)
    }
    var cleaned = _.omit(_.first(doc),['ftp', '_id', 'doctype'])
    callback(null, cleaned)
  })
};


Data.prototype.buildDocument = function(document, settings) {
  var keys = ['layout', 'page', 'slug', 'assets', 'settings', 'document']
  var pairs = ['default', document.doctype,
                this.slug(document),
                '/assets',
                settings,
                this.buildContent(document)]

  return _.object(keys, pairs)
};

Data.prototype.documents = function(doctype, callback) {
  var self = this,
    settings = null

  async.waterfall([
      function (next){
        console.info('settings')
        self.settings(function (err, doc){
          if(err){
            next(err)
          }
          settings = doc
          next(null)
        })
      },
      function (next){
        console.info('documents')
        self.find(doctype, function (err, docs){
          if (err){
            next(err, null)
          }
          next(null, docs)
        })
      },
      function (docs, next){
        console.info('assemble')
        var output = []
        _.each(docs, function (doc){
          output.push(this.buildDocument(doc, settings))
        }, self)
        //console.log(JSON.stringify(this.output, null, 2))
        next(null, output)
      }
    ], function (err, output){
        if(err){
          throw new Error('building documents: ' + err)
        }
        callback(null, output)
        console.info('documents done');
    })

};


module.exports = Data
