Receipts = new Mongo.Collection("receipts");

if (Meteor.isClient) {

  Template.main.events({
    "click #upload-csv": function(event, template) {
      var id = '#csv-file';
      if (template.find(id).files[0]){
        Papa.parse(template.find(id).files[0], {
          error: function(err, file, inputElem, reason) {
            console.log(err);
          },
          skipEmptyLines : true,
          complete: function(results) {
            uploadVerify(results, function(){
              uploadStore(results);
            });
            uploadReset(id, template);
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
