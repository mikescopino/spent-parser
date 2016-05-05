if (Meteor.isClient) {
  parser = new Parser();

  Template.parser.events({
    "change #csv-file": function(event, template) {
      template.find('#upload-csv').focus();
      errorClearMessage();
    },
    "click #upload-csv": function(event, template) {
      //upload('#csv-file', template);
      template.find('#upload-csv').blur();
      parser.event.uploadFile('#csv-file', template);
    },
  });

  Template.parser.helpers({
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
    // "click .row": function(event) {
    //   processEvent(event);
    // },
    "mouseover .payee": function(event, template) {
      payeeTooltip(event, 'old-payee', 'show');
    },
    "mouseout .payee": function(event, template) {
      payeeTooltip(event, 'old-payee', 'hide');
    },
  });

  Template.receiptsList.helpers({
    humanDate: function() {
      //return 'hello';
      return moment(this.date).format("M/DD/YYYY");
    },
    humanAmount: function() {
      return '$' + this.amount;
    },
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
