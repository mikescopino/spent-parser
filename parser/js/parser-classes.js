Parser = function Parser() {}

Parser.prototype = {
  // Container for error messages
  errors: [],

  // Data
  db: {
    getReceipts: function() {
      var reply = false;
      if (Receipts.find({}).count() > 0) {
        reply = Receipts.find({}, {
          sort: {date: 1}
        });
      }

      return reply;
    },
    insertReceipt: function(data, db) {
      var d = data;
      var m = [];
      for (var i=1; i < d.length; i++) {
        if (d[i]) {
          var date = moment(d[i][0], "M/D/YY").format('YYYY-MM-DD');
          var amount = Math.round(d[i][3]*100)/100;

          db.insert({
            date : date,
            category : d[i][4],
            account : d[i][1],
            payee : d[i][2],
            amount : amount,
            oldPayee : d[i][5],
            changed : d[i][6]
          });
        }
      }
      m.push(d.length + " receipts added");
      log(m);
      Session.set('messages', m);
    },
    removeAllReceipts: function() {
      var receipts = Receipts.find({}).fetch();

      if (receipts.length > 0) {
        for (var i = 0; i < receipts.length; i++) {
          var id = receipts[i]['_id'];
          Receipts.remove(id);
          Session.set('messages', false);
        }
      }
    }
  },

  // Events
  event: {
    hoverPayee: function(event, element, direction) {
      var p = event.currentTarget.parentNode;
      for (var i = 0; i < p.classList.length; i++) {
        if (p.classList[i] == 'changed') {
          Parser.prototype.event.toggleTooltip(event, element, direction);
        }
      }
    },
    resetFileInput: function(template) {
      template.find('#csv-file').value = null;
    },
    toggleTooltip: function(event, element, direction) {
      var target = event.currentTarget.getElementsByClassName(element);
      switch (direction) {
        case 'show':
          target[0].classList.add('show');
          break;
        case 'hide':
          var closeTipTimer = setTimeout(function() {
            target[0].classList.remove('show');
          }, 200);
          break;
      }
    },
    uploadFile: function (target, template) {
      var id = target;
      var file = (template) ? template.find(id).files[0] : false;

      if (file){
        log('UPLOAD STARTED:')
        Parser.prototype.messages.clear();
        log('> A file was a chosen');

        var csv = Parser.prototype.process.verifyFile(file);
        if (csv) {
          log('> The file was a CSV');

          // Ready to parse
          Parser.prototype.process.parseCSV(file);
          Parser.prototype.event.resetFileInput(template);
        }
        else {
          log('ERROR: You need to select a CSV.')
        }
      }
      else {
        log('ERROR: You need to select a file.');
      }
    },
  },

  // Parser processes
  process: {
    cleanData: function(data) {
      var valid = false;
      var d = data;
      log(d);
      var steps = [
        removeCredits = function(stepData) {
          d = Parser.prototype.process.removeCredits(stepData);
          return d;
        },
        compareToRegEx  = function(stepData) {
          d = Parser.prototype.process.compareToRegEx(stepData, Expressions);
          return d;
        },
      ];


      if (data.length > 0) {
        log('CLEANING STARTED:');
        // Data exists, so give it the benefit of the doubt
        valid = true;

        for (var i = 0; i < steps.length; i++) {
          // Skip further steps if cleaning fails
          if (valid) {
            valid = steps[i](d);
          }
        }
      }
      else {
        log('ERROR: There were no rows in the data');
      }
      return valid;
    },
    compareToRegEx: function(data, db) {
      var d = data;
      var regs = db.find({}).fetch();

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
              }
            }
          }
        }
        log('> Categories have been checked');
      }
      else {
        d = false;
        log('ERROR: There are no regexs to check against');
      }

      return d;
    },
    parseCSV: function(csv) {
      Papa.parse(csv, {
        skipEmptyLines: true,
        complete: function(results) {
          var d = results.data;
          var format = Parser.prototype.process.verifyFormat(d);

          if (format) {
            log('> File has proper columns')
            var clean = Parser.prototype.process.cleanData(d);

            if (clean) {
              log('> Data ready for display');
              Parser.prototype.db.insertReceipt(clean, Receipts);
            }
            else {
              log('ERROR: The data is still dirty');
            }
          }
          else {
            log('ERROR: You need to format your columns properly');
          }
        }
      });
    },
    removeCredits: function(data) {
      d = data;
      for (var i=1; i < d.length; i++) {
        if (d[i][3] > 0) {
          delete d[i];
        }
        else {
          d[i][3] = d[i][3] * -1;
        }
      }
      log('> Credits have been removed');
      return d;
    },
    verifyFile: function(file) {
      var n = file.name;
      var regex = /(?:\.([^.]+))?$/;
      var extension = regex.exec(n)[1];
      var valid = true;

      if (extension != 'csv') {
        valid = false;
        Parser.prototype.errors.push("Dang. Your file is a " + extension.toUpperCase() + " when it needs to be a CSV");
        Parser.prototype.messages.show();
      }

      return valid;
    },
    verifyFormat: function(json) {
      var valid = true;
      var e =  Parser.prototype.errors;
      if (json.length > 0) {
        var d = json;
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
        }
      }
      return valid;
    }
  },

  // Status messages
  messages: {
    show: function() {
      if (Parser.prototype.errors.length > 0) {
        Session.set('errors', Parser.prototype.errors);
        //log(Parser.prototype.errors);
      }
      // TODO Show status messages
    },
    clear: function() {
      Parser.prototype.errors = [];
      Session.set('errors', false);
      Session.set('messages', false);
      log('> Prior status messages cleared');
    }
  }

};
