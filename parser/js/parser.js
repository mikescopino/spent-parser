Receipts = new Mongo.Collection("receipts");

if (Meteor.isClient) {

  Template.main.events({
    "click #upload-csv": function(event, template) {
      var id = '#csv-file';
      var file = template.find(id).files[0];

      Session.set('errors', false);

      if (file){
        Papa.parse(file, {
          skipEmptyLines : true,
          complete: function(results) {
            log(results);
            uploadVerify(results, function(){
              uploadStore(results);
            });
            uploadReset(id, template);
          }
        });
      }
      else {
        log('Error: You must select a valid CSV file');
      }
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
