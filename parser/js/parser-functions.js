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
// Errors
//////////////////////////////////////////

errorClearMessage = function errorClearMessage() {
  Session.set('errors', false);
}

//////////////////////////////////////////
// Processes
//////////////////////////////////////////

processEvent = function processEvent(event) {
  event.preventDefault();
  log(event);
  var element = event['currentTarget'];
  var id = element['id'];
  var d = Receipts.findOne(id);
  log('You clicked on ' + id);
  var check = processCheckCategory(d['payee'], id);
  if (check) {
    Receipts.update(id, {$set: {changed: true}})
  }
}

processCheckCategory = function processCheckCategory(p, id) {
  var regs = Expressions.find({}).fetch();
  var changed = false;

  if (regs.length > 0) {
    for (var i = 0; i < regs.length; i++) {
      var ex = regs[i]['reg'];
      var check = p.indexOf(ex);
      if (check !== -1) {
        Receipts.update(id, {
          $set: {
            payee: regs[i]['name'],
            category: regs[i]['category']
          }
        });
        changed = true;
        log(ex +' matched: ' + regs[i]['name']);
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

processMarkRow = function processMarkRow(element) {
  element.addClass("updated");
}

//////////////////////////////////////////
// Uploads
//////////////////////////////////////////

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
            uploadStore(results);
          });
          uploadReset(id, template);
        }
      });
    });
  }
}

uploadReset = function uploadReset(id, template) {
  template.find('#csv-file').value = null;
}

uploadStore = function uploadStore(results) {
  var d = results.data;
  var m = [];
  for (var i=1; i < d.length; i++) {
    Receipts.insert({
      date : d[i][0],
      category : '&#8211;',
      account : d[i][1],
      payee : d[i][2],
      amount : d[i][3]
    });
  }
  m.push(d.length + " receipts added");
  log(m);
  Session.set('messages', m);
}

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
