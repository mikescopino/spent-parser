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

  var closeTipTimer;
  Template.receiptsList.events({
    "click .row": function(event) {
      processEvent(event);
    },
    "mouseover .payee": function(event, template) {
      toggleTooltip(event, 'old-payee');
    },
    "mouseout .payee": function(event, template) {
      closeTipTimer = setTimeout(function() {
        toggleTooltip(event, 'old-payee');
      }, 300);
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
