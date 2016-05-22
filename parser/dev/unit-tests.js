if (Meteor.isClient) {

  Template.unitTests.helpers({

    'compareRegEx': function(event, template) {
      // var reply = 'Fail';
      // Expressions.insert({
      //   name : d[i]['name'],
      //   reg : d[i]['reg'],
      //   category: d[i]['category']
      // });
      // return reply;
    },

    'getRegEx': function(event, template) {
      var reply = 'Fail';
      var regs = Expressions.find({}).fetch();

      if (regs.length > 0) {
        reply = 'Pass';
      }
      return reply;
    },

    'requireCSV': function(event, template) {
      var reply = 'Pass';
      var file = {
        lastModified: 1462634144000,
        lastModifiedDate: 'Sat May 07 2016 11:15:44 GMT-0400 (EDT)',
        name: 'noncsv-stmt.xls',
        size: 26631,
        type: 'text/xls',
        webkitRelativePath: ''
      }
      // By passing bad data test should return false
      var test = parser.process.verifyFile(file)
      if (test) {
        reply = 'Fail';
      }
      return reply;
    },

    'requireFormat': function(event, template) {
      var reply = 'Pass';
      var data = [
        ['Posted Date', 'Reference Number', 'Payee', 'Address', 'Amount'],
        ['08/21/2015', '', 'INTEREST CHARGED ON PURCHASES', '', '-1.62'],
        ['08/18/2015', '', 'LATE FEE FOR PAYMENT DUE', '', '-25.00']
      ]
      // By passing bad data test should return false
      var test = parser.process.verifyFormat(data)
      if (test) {
        reply = 'Fail';
      }
      return reply;
    },

    'removeCredits': function(event, template) {
      var reply = 'Pass';
      var data = [
        ["date", "account", "payee", "amount"],
        ["2/27/15", "Bank of America Visa", "Harvard Pilgrim Health Care Bill Payment", -421.95],
        ["3/2/15", "Bank of America Visa", "PRUDENTIAL SSA DES:PAYMENT ID:SGN000000038 INDN:SCOPINO, MICHAEL CO ID:XXXXX35505 PPD", 1666.67]
      ]
      // By passing good data the values should be updated
      var test = parser.process.removeCredits(data)
      if (test[0][3] < 0) {
        reply = 'Fail';
      }
      if (test[2] != undefined) {
        reply = 'Fail';
      }
      return reply;
    },

  });

}
