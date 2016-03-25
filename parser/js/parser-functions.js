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
// Uploads
//////////////////////////////////////////

uploadReset = function uploadReset(id, template) {
  template.find('#csv-file').value = null;
}

uploadStore = function uploadStore(results) {
  var d = results.data;
  for (var i=1; i < d.length; i++) {
    Receipts.insert({
      date : d[i][0],
      category : '',
      account : d[i][1],
      payee : d[i][2],
      amount : d[i][3]
    });
  }
}

uploadVerify = function uploadVerify(results, callback) {
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
