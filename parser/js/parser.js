Receipts = new Mongo.Collection("receipts");

if (Meteor.isClient) {

  Template.main.events({
    "change #csv-file": function(event, template) {
      errorClearMessage();
    },
    "click #upload-csv": function(event, template) {
      upload('#csv-file', template);
    }
  });

  Template.main.helpers({
    receipts: function () {
      var reply = false;
      if (Receipts.find({}).count() > 0) {
        reply = Receipts.find({});
      }
      return reply;
    },
    errors: function () {
      return Session.get('errors');
    },
  });
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    return Meteor.methods({
      clearReceipts: function() {
        return Receipts.remove({});
      }
    });
  });
}
