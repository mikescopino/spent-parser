Receipts = new Mongo.Collection("receipts");
Expressions = new Mongo.Collection("expressions");

if (Meteor.isClient) {

  Template.main.events({
    "change #csv-file": function(event, template) {
      errorClearMessage();
    },
    "click #upload-csv": function(event, template) {
      upload('#csv-file', template);
    },
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
    messages: function () {
      return Session.get('messages');
    },
  });

  Template.receiptsList.events({
    "click .row": function(event, template) {
      processEvent(event);
    },
  });

  Template.receiptsList.helpers({
    status: function () {

      if (Receipts.find({}).count() > 0) {
        reply = Receipts.find({});
      }
      return reply;
    }
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
