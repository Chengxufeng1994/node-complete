const { getDb } = require('../util/database');
const { ObjectId } = require('mongodb');

class Product {
  constructor(title, imageUrl, price, description, id, userId) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
    this._id = id ? new ObjectId(id) : null;
    this.userId = userId;
  }

  static fetchAll() {
    const db = getDb();

    return db
      .collection('products')
      .find()
      .toArray()
      .then((products) => {
        // console.log(products);
        return products;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  static fetchProduct(productId) {
    const db = getDb();

    return db
      .collection('products')
      .find({ _id: new ObjectId(productId) })
      .next()
      .then((product) => {
        // console.log(product);
        return product;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  static deleteProduct(productId) {
    const db = getDb();

    return db
      .collection('products')
      .deleteOne({ _id: new ObjectId(productId) })
      .then((result) => {
        console.log('Delete!');
      })
      .catch((error) => {
        console.log(error);
      });
  }

  save() {
    const db = getDb();
    let dbOp;

    if (this._id) {
      // Update the product
      dbOp = db.collection('products').updateOne(
        { _id: this._id },
        {
          $set: this,
        }
      );
    } else {
      dbOp = db.collection('products').insertOne(this);
    }

    return dbOp
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

module.exports = Product;
