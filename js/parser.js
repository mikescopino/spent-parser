$(document).ready(function(){
  $('#parse').click(parse);
});

//////////////////////////////////////////
// Parse
//////////////////////////////////////////

function parse() {
  $('input[type=file]').parse({
    config: {
      before: function(file, inputElem) {
        console.log('parse begins');
      },
      error: function(err, file, inputElem, reason) {
        console.log('parse fucked up');
      },
      complete: function(results) {
        var html = formatOutput(results);
        $('#results-data').html(html);
      }
    }
  });
}

function formatOutput(results) {
  var d = results.data;
  var output = '<ul>';

  for (i=0; i < d.length; i++) {
    output += '<li>' + d[i] + '</li>';
  }
  output += '</ul>';

  return output;
}
