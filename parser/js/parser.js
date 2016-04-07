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
      return getReceipts();
    },
    errors: function () {
      return Session.get('errors');
    },
    messages: function () {
      return Session.get('messages');
    },
  });

  Template.receiptsList.events({
    "click .row": function(event) {
      processEvent(event);
    },
    "mouseover .payee": function(event, template) {
      payeeTooltip(event, 'old-payee', 'show');
    },
    "mouseout .payee": function(event, template) {
      payeeTooltip(event, 'old-payee', 'hide');
    },
  });

  Template.receiptsList.helpers({
    status: function () {
      return getReceiptsStatus();
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
