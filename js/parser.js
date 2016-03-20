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
        // console.log(results);
        formatOutput(results);
      }
    }
  });
}

function formatOutput(results) {
  var d = results.data;
  var source = $("#results-template").html();
  var template = Handlebars.compile(source);
  var output = {rows : []};
  for (i=1; i < d.length; i++) {
    output['rows'][i] = {
      data : d[i][0],
      ref : d[i][1],
      payee : d[i][2],
      address : d[i][3],
      amount : d[i][4]
    }
  }

  $('.container').append(template(output));
}
