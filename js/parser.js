$(document).ready(function(){
  $('#parse').click(function() {
    $('input[type=file]').parse({
    	config: {
        before: function(file, inputElem) {
          console.log('parse begins');
        },
        error: function(err, file, inputElem, reason) {
          console.log('parse fucked up');
        },
      	complete: function(results) {
          console.log('parse succeeded');
          console.log(results);
          $('#results-data').html(results.data);
      	}
      }
    });
  });
});
