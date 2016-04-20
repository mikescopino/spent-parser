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
    reply = Receipts.find({});
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

// Compare the clicked row to Expressions
// processEvent = function processEvent(event) {
//   event.preventDefault();
//
//   var element = event['currentTarget'];
//   var id = element['id'];
//   var d = Receipts.findOne(id);
//   var check = processCheckCategory(d['payee'], id);
//   if (check) {
//     Receipts.update(id, {
//       $set: {
//         changed: true
//       }
//     });
//   }
// }

processCleanData = function processCleanData(results, callback) {
  var d = results.data;
  var m = [];

  // 1. Remove credits
  for (var i=1; i < d.length; i++) {
    if (d[i][3] > 0) {
      delete d[i];
    }
    else {
      d[i][3] = d[i][3] * -1;
    }
  }

  // 2. Check categories
  var regs = Expressions.find({}).fetch();

  // a. Do we have regular expressions?
  if (regs.length > 0) {
    // b. Loop through the data
    for (var i = 0; i < d.length; i++) {
      var row = d[i];
      // c. Does the row exist
      if (row) {
        row[4] = '';
        row[5] = '';
        row[6] = false;

        for (var x = 0; x < regs.length; x++) {
          var ex = regs[x]['reg'];
          var check = row[2].indexOf(ex);
          // d. Does the regex match the row
          if (check !== -1) {
            row[5] = row[2];
            row[2] = regs[x]['name'];
            row[4] = regs[x]['category'];
            row[6] = true;
            log(ex +' matched: ' + regs[x]['name']);
            log('We stored ' + row[5] + ' as the oldPayee');
          }
        }
      }
    }
  }
  else {
    log('There are no regexs to check against');
  }

  callback(d);
}


// Compare the data to Expressions
processCheckCategory = function processCheckCategory(p, id) {
  var regs = Expressions.find({}).fetch();
  var changed = false;

  if (regs.length > 0) {
    for (var i = 0; i < regs.length; i++) {
      var ex = regs[i]['reg'];
      var check = p.indexOf(ex);
      if (check !== -1) {
        // Update Receipt
        Receipts.update(id, {
          $set: {
            payee: regs[i]['name'],
            category: regs[i]['category'],
            oldPayee: p
          }
        });
        changed = true;
        log(ex +' matched: ' + regs[i]['name']);
        log('We stored ' + p + ' as the oldPayee');
      }
    }
    if (!changed) {
      log('There were no matches');
    }
  }
  else {
    log('There are no regexs to check against');
  }

  return changed;
}

// Add a class to the row if it's been updated
processMarkRow = function processMarkRow(element) {
  element.addClass("updated");
}

//////////////////////////////////////////
// Uploads
//////////////////////////////////////////

// NOTE Classified
// Process form upload
upload = function upload(target, template) {
  var id = target;
  var file = template.find(id).files[0];

  errorClearMessage();

  if (file){
    uploadVerifyFile(file, function() {
      Papa.parse(file, {
        skipEmptyLines : true,
        complete: function(results) {
          log(results);
          uploadVerifyContents(results, function(){
            processCleanData(results, function(data){
              //log(data);
              uploadStore(data);
            })
          });
          uploadReset(id, template);
        }
      });
    });
  }
}

// Clear the input
uploadReset = function uploadReset(id, template) {
  template.find('#csv-file').value = null;
}

// Write to Receipts
uploadStore = function uploadStore(data) {
  var d = data;
  var m = [];
  for (var i=1; i < d.length; i++) {
    if (d[i]) {
      Receipts.insert({
        date : d[i][0],
        category : d[i][4],
        account : d[i][1],
        payee : d[i][2],
        amount : d[i][3],
        oldPayee : d[i][5],
        changed : d[i][6]
      });
    }
  }
  m.push(d.length + " receipts added");
  log(m);
  Session.set('messages', m);
}

// Confirm that the file is a CSV
uploadVerifyFile = function uploadVerifyFile(file, callback) {
  var n = file.name;
  var re = /(?:\.([^.]+))?$/;
  var ext = re.exec(n)[1];
  var e = [];
  var valid = true;

  if (ext != 'csv') {
    valid = false;
    e.push("Dang. Your file is a " + ext.toUpperCase() + " when it needs to be a CSV");
    Session.set('errors', e);
    log(e);
  }

  if (valid) {
    callback();
  }
}

// Check that the file has the proper columns
uploadVerifyContents = function uploadVerify(results, callback) {
  var d = results.data;
  var e = [];
  var valid = true;
  if (d[0][0] != 'date') {
    e.push('Your 1st column must be "date"');
  }
  if (d[0][1] != 'account') {
    e.push('Your 2nd column must be "account"');
  }
  if (d[0][2] != 'payee') {
    e.push('Your 3rd column must be "payee"');
  }
  if (d[0][3] != 'amount') {
    e.push('Your 4th column must be "amount"');
  }
  if (e.length > 0) {
    valid = false;
    e.unshift('It looks like your CSV file has some formatting issues.');
    Session.set('errors', e);
    log(e);
  }

  if (valid) {
    callback();
  }
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
