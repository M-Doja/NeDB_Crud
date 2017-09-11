const express = require('express'),
      Datastore = require('nedb'),
      bodyParser = require('body-parser'),
      path = require('path'),
      router = express.Router(),
      app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

// Deployed DB to users platform or use In-Memory
const os = require('os');
const db = new Datastore({filename: `${os.userInfo().homedir}/documents/NeDB_Database/myAppDB.db`, autoload: true}) || new Datastore();

// SHOW ALL DOCS
app.get('/', (req, res) => {
  db.find({}, function (err, docs) {
    docs.forEach(doc => {
    })
    res.render('index', {docs});
 });
});

 // SHOW SINGLE DOC
app.get('/api/single/:id', (req, res) => {
  var path = req._parsedOriginalUrl.pathname;
  path = path.split('/');
  var id = path[3];
  db.find({_id: id} ,function(err, doc) {
    res.render('single', {doc: doc});
  });
});

// ADD NEW DOC
  app.post('/api/newdoc', (req, res ) => {
    const doc = {
      name: req.body.name,
      motto: req.body.motto
    }
    db.insert(doc, (err, newDoc) => {
      if (err) console.log(err);
      res.redirect('/');
    });
  });


// UPDATE SINGLE DOC
app.post('/api/doc/update/:id', (req, res ) => {

  // get ID from route path
  var path = req._parsedUrl.pathname;
  var pathArr = path.split('/');
  var id = pathArr[4];

  // find doc by ID
  db.find({_id: id} ,function(err, docToUpdate) {
    for (var i = 0; i < docToUpdate.length; i++) {

      // define new doc data
      const updatedDoc = {
        name:req.body.nameEdit,
        motto: req.body.mottoEdit,
      }

      // update found doc with new data
      db.update({_id: docToUpdate[i]._id}, {$set:{ name: updatedDoc.name, motto: updatedDoc.motto}}, {}, function (err, numReplaced) {
        res.redirect(`/api/single/${id}`);
      });
    }

  })
});

// REMOVE DOC
app.post('/api/doc/remove/:id', function(req, res) {
  for (var x in req.body) {
    var id = x;
    db.remove({ _id: id }, {}, function (err, numRemoved) {
      res.redirect('/');
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App now runnning on port ${port}`));
