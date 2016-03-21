$(document).ready(function(){
  //$('#parse').click(parse);
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


//////////////////////////////////////////
// Angular
//////////////////////////////////////////

angular.module('parserApp', [])
  .controller('parseController', function() {
    var parser = this;

    parser.rows = [
      {data: 'abc', ref: '123', payee: 'Nonfiction', address: 'www.nonfiction.io', amount: '100.00'},
      {data: 'def', ref: '456', payee: 'Scopino LLC', address: 'www.scopino.net', amount: '50.00'}
    ]
    // todoList.todos = [
    //   {text:'learn angular', done:true},
    //   {text:'build an angular app', done:false}];
    //
    // todoList.addTodo = function() {
    //   todoList.todos.push({text:todoList.todoText, done:false});
    //   todoList.todoText = '';
    // };
    //
    // todoList.remaining = function() {
    //   var count = 0;
    //   angular.forEach(todoList.todos, function(todo) {
    //     count += todo.done ? 0 : 1;
    //   });
    //   return count;
    // };
    //
    // todoList.archive = function() {
    //   var oldTodos = todoList.todos;
    //   todoList.todos = [];
    //   angular.forEach(oldTodos, function(todo) {
    //     if (!todo.done) todoList.todos.push(todo);
    //   });
    // };
  });
