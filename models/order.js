const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true, ref: 'Product' },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
});

const Order = Mongoose.model('Order', orderSchema);

module.exports = Order;
