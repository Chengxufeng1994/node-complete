const { getDb } = require('../util/database');
const { ObjectId } = require('mongodb');

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; // cart = { items: []}
    this._id = id;
  }

  static fetchUser(userId) {
    const db = getDb();

    return db.collection('users').findOne({ _id: new ObjectId(userId) });
  }

  save() {
    const db = getDb();

    return db
      .collection('users')
      .insertOne(this)
      .then((user) => {
        console.log(user);
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  addToCart(product) {
    const db = getDb();
    const cartProductIndex = this.cart.items.findIndex((item) => {
      // these two do not only match by value but also by type and technically this is no string
      // one solution: two equal sign
      // two solution: use string
      return item.productId.toString() === product._id.toString();
    });
    const updatedCartItems = [...this.cart.items];
    let newQuantity = 1;

    if (cartProductIndex !== -1) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      const updatedCartProduct = {
        ...updatedCartItems[cartProductIndex],
        quantity: newQuantity,
      };
      updatedCartItems[cartProductIndex] = updatedCartProduct;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity,
      });
    }

    const updatedCart = {
      items: updatedCartItems,
    };

    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  deleteItemFromCart(productId) {
    const db = getDb();
    // solution 1:
    // const cartProductIndex = this.cart.items.findIndex((item) => {
    //   // these two do not only match by value but also by type and technically this is no string
    //   // one solution: two equal sign
    //   // two solution: use string
    //   return item.productId.toString() === productId.toString();
    // });
    // const updatedCartItems = [...this.cart.items];
    // updatedCartItems.splice(cartProductIndex, 1);

    // solution 2:
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== productId.toString();
    });

    const updatedCart = {
      items: updatedCartItems,
    };

    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  fetchCartItems() {
    const db = getDb();
    const cartItemsIds = this.cart.items.map((item) => {
      // console.log(item.productId.toString());
      return item.productId;
    });

    return db
      .collection('products')
      .find({
        _id: {
          $in: cartItemsIds,
        },
      })
      .toArray()
      .then((cartProducts) => {
        return cartProducts.map((product) => {
          return {
            ...product,
            quantity: this.cart.items.find(
              (item) => item.productId.toString() === product._id.toString()
            ).quantity,
          };
        });

        // return cartProducts.map((prod) => {
        //   prod.quantity = this.cart.items.find(
        //     (item) => item.productId.toString() === prod._id.toString()
        //   ).quantity;
        // });
      })
      .catch((error) => console.log(error));
  }

  addOrder() {
    const db = getDb();

    return this.fetchCartItems()
      .then((products) => {
        console.log(products);
        const totalPrice = products.reduce((acc, curr) => {
          return Number(acc + curr.price);
        }, 0);
        const order = {
          items: products,
          user: {
            _id: new ObjectId(this._id),
            name: this.name,
          },
        };

        return db
          .collection('orders')
          .insertOne(order)
          .then((result) => {
            this.cart = { items: [] };
            return db
              .collection('users')
              .updateOne(
                { _id: new ObjectId(this._id) },
                { $set: { cart: { items: [] } } }
              );
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fetchOrders() {
    const db = getDb();

    return (
      db
        .collection('orders')
        .find({ 'user._id': new ObjectId(this._id) })
        // .find({ user: { _id: new ObjectId(this._id)} })
        .toArray()
        .then((orders) => {
          // console.log(orders);
          return orders;
        })
        .catch((error) => {
          console.log(error);
        })
    );
  }
}

module.exports = User;
