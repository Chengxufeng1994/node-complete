const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const uri =
  'mongodb+srv://Benny:Lxhtmj490i2fFNXh@cluster0.fyfno.mongodb.net/shop?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true });
const mongoConnect = (callback) => {
  client
    .connect()
    .then((response) => {
      console.log('Connected!');
      _db = client.db();
      callback();
    })
    .catch((error) => {
      console.log(error);
      const collection = client.db('test').collection('devices');
      // perform actions on the collection object
      client.close();
      throw error;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }

  throw 'No database found';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
