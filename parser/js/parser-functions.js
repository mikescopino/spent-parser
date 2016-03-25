uploadReset = function uploadReset(id, template) {
  template.find('#csv-file').value = null;
}

uploadStore = function uploadStore(results) {
  var d = results.data;
  for (var i=1; i < d.length; i++) {
    Receipts.insert({
      data : d[i][0],
      ref : d[i][1],
      payee : d[i][2],
      address : d[i][3],
      amount : d[i][4]
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
  if (d[0][1] != 'payee') {
    e.push('Your 2nd column must be "payee"');
  }
  if (d[0][2] != 'account') {
    e.push('Your 3rd column must be "account"');
  }
  if (d[0][3] != 'amount') {
    e.push('Your 4th column must be "amount"');
  }
  if (e.length > 0) {
    valid = false;
    e.unshift('It looks like your CSV file has some formatting issues.');
    for (var i = 0; i < e.length; i++) {
      console.log(e[i]);
    }
    Session.set('errors', e);
  }

  if (valid) {
    callback();
  }
}
