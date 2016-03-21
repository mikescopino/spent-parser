Receipts = new Mongo.Collection("receipts");

if (Meteor.isClient) {

  Template.main.events({
    "click #upload-csv": function(event, template) {
      if (template.find('#csv-file').files[0]){
        Papa.parse(template.find('#csv-file').files[0], {
          error: function(err, file, inputElem, reason) {
            console.log(err);
          },
          skipEmptyLines : true,
          complete: function(results) {
            storeResults(results);
            template.find('#csv-file').value = null;
          }
        });
      }
      else {
        console.log('Error: You must select a valid CSV file');
      }
   }
 });

  Template.main.helpers({
    receipts: function () {
      return Receipts.find({});
    }
  });

  function storeResults(results) {
    var d = results.data;
    for (i=1; i < d.length; i++) {
      Receipts.insert({
        data : d[i][0],
        ref : d[i][1],
        payee : d[i][2],
        address : d[i][3],
        amount : d[i][4]
      });
    }
  }


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
