Parser = function Parser() {}

Parser.prototype = {
  // Container for error messages
  errors: [],

  // Data
  db: {
    insertData: function(data) {
      var d = data;
      var m = [];
      for (var i=1; i < d.length; i++) {
        if (d[i]) {
          var date = moment(d[i][0], "M/D/YY");
          date = date.format('YYYY-MM-DD');
          log(date);
          Receipts.insert({
            date : date,
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
  },

  // Events
  event: {
    resetFileInput: function(template) {
      template.find('#csv-file').value = null;
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
      var steps = [
        removeCredits = function(stepData) {
          d = Parser.prototype.process.removeCredits(stepData);
          return d;
        },
        compareToRegEx  = function(stepData) {
          d = Parser.prototype.process.compareToRegEx(stepData);
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
    compareToRegEx: function(data) {
      var d = data;
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
                // log(ex +' matched: ' + regs[x]['name']);
                // log('We stored ' + row[5] + ' as the oldPayee');
              }
            }
          }
        }
        log('> Categories have been checked');
      }
      else {
        d = false;
        log('There are no regexs to check against');
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
              Parser.prototype.db.insertData(clean);

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
      var valid = false;
      if (json.length > 0) {
        valid = true;
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
      Session.set('errors', false);
      Session.set('messages', false);
      log('> Prior status messages cleared');
    }
  }

};
