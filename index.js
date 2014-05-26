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

Data.prototype.find = function(schema, callback) {
  var self = this
  this.db.find({ doctype: schema.content.doctype }, function (err, docs) {
    self.build(schema, docs, callback)
  });
}

// Data.prototype.buildNavigation = function(type) {
//   this.find(type, function (err, docs){
//     _.each(docs, )
//   })
// };

Data.prototype.build = function(schema, docs, callback) {
  var keys = _.keys(schema.content)

  _.each(docs, function (doc){
    var out = {
      layout: schema.layout,
      page: schema.page,
      content: {
        document:{}
      }
    }
    _.each(keys, function (item){
      out.content.document[item] = doc[item]
    })

    this.output.documents.push(out)
  }, this)

  //console.log(JSON.stringify(this.output, null, 2))
  callback(this.output)
};


module.exports = Data
