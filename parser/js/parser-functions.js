Receipts = new Mongo.Collection("receipts");
Expressions = new Mongo.Collection("expressions");

//////////////////////////////////////////
// Errors
//////////////////////////////////////////

// NOTE Classified
errorClearMessage = function errorClearMessage() {
  Session.set('errors', false);
}

//////////////////////////////////////////
// Evaluation
//////////////////////////////////////////

// Pull Receipts to populate the template
getReceipts = function getReceipts() {
  var reply = false;
  if (Receipts.find({}).count() > 0) {
    reply = Receipts.find({}, {
      sort: {date: 1}
    });
  }

  return reply
}

// Check the status of Receipts to hide/show header
getReceiptsStatus = function getReceiptsStatus() {
  var reply = false;
  if (Receipts.find({}).count() > 0) {
    reply = Receipts.find({});
  }

  return reply
}

//////////////////////////////////////////
// Interactions
//////////////////////////////////////////

payeeTooltip = function payeeTooltip(event, element, direction) {
  // NOTE This test should not be in the resuable toggle function
  var p = event.currentTarget.parentNode;
  for (var i = 0; i < p.classList.length; i++) {
    if (p.classList[i] == 'changed') {
      toggleTooltip(event, element, direction);
    }
  }
}

toggleTooltip = function toggleTooltip (event, element, direction) {
  var target = event.currentTarget.getElementsByClassName(element);
  switch (direction) {
    case 'show':
      target[0].classList.add('show');
      //log('mouseover')
      break;
    case 'hide':
      var closeTipTimer = setTimeout(function() {
        target[0].classList.remove('show');
        //log('mouseout');
      }, 200);
      break;
  }
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

//////////////////////////////////////////
// Processes
//////////////////////////////////////////

// Add a class to the row if it's been updated
processMarkRow = function processMarkRow(element) {
  element.addClass("updated");
}

//////////////////////////////////////////
// Reset
//////////////////////////////////////////

clearReceipts = function clearReceipts() {
  var receipts = Receipts.find({}).fetch();

  if (receipts.length > 0) {
    for (var i = 0; i < receipts.length; i++) {
      var id = receipts[i]['_id'];
      Receipts.remove(id);
      Session.set('messages', false);
    }
  }
}
