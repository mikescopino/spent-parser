Parser = function Parser() {}

Parser.prototype = {
  // Container for error messages
  errors: [],

  // Events
  event: {
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
          // TODO Figure out how to return validity
          Parser.prototype.process.removeCredits(stepData);
        },
        compareToRegEx  = function(stepData) {
          // TODO Figure out how to return validity
          Parser.prototype.process.compareToRegEx(stepData);
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
    compareToRegEx: function() {
      log('> Categories have been checked');
      // TODO Add actual logic
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
    removeCredits: function() {
      log('> Credits have been removed');
      // TODO Add actual logic
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
