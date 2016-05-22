Receipts = new Mongo.Collection("receipts");
Expressions = new Mongo.Collection("expressions");

//////////////////////////////////////////
// Client
//////////////////////////////////////////

if (Meteor.isClient) {
  parser = new Parser();

  Template.parser.events({
    "change #csv-file": function(event, template) {
      template.find('#upload-csv').focus();
      parser.messages.clear();
    },
    "click #upload-csv": function(event, template) {
      template.find('#upload-csv').blur();
      parser.event.uploadFile('#csv-file', template);
    },
  });

  Template.parser.helpers({
    receipts: function() {
      return parser.db.getReceipts();
    },
    errors: function() {
      return Session.get('errors');
    },
    messages: function() {
      return Session.get('messages');
    }
  });

  Template.receiptsList.events({
    "mouseover .payee": function(event, template) {
      parser.event.hoverPayee(event, 'old-payee', 'show');
    },
    "mouseout .payee": function(event, template) {
      parser.event.hoverPayee(event, 'old-payee', 'hide');
    },
  });

  Template.receiptsList.helpers({
    humanDate: function() {
      return moment(this.date).format("M/DD/YYYY");
    },
    humanAmount: function() {
      return '$' + this.amount;
    }
  });
}

//////////////////////////////////////////
// Server
//////////////////////////////////////////

if (Meteor.isServer) {
  Meteor.startup(function() {
    return Meteor.methods({
      clearReceipts: function() {
        return Receipts.remove({});
      },

    });
  });
}

//////////////////////////////////////////
// Logging
//////////////////////////////////////////

logging = true;

log = function log(info) {
  if (logging) {
    if(info.constructor === Array) {
      for (var i = 0; i < info.length; i++) {
        console.log(info[i]);
      }
    }
    else {
      console.log(info);
    }
  }
}
