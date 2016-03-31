populate = function populate() {
  var d = expressionLibrary;
  for (var i=0; i < d.length; i++) {
    log('Inserting ' + d[i]['name']);
    Expressions.insert({
      name : d[i]['name'],
      reg : d[i]['reg'],
      category: d[i]['category']
    });
  }
}

expressionLibrary = [
  {
    name : 'Mead Hall',
    reg: 'MEADHALL',
    category: 'Entertainment'
  },
  {
    name : 'Baja Cafe',
    reg: 'BAJA CAFE',
    category: 'Dining'
  },
]
