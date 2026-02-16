const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const itemSchema = mongoose.Schema(
  {
    item: {
      type: String,
      required: [true, "Can't be empty!"],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => Date.now() + 10 * 60 * 1000,
      select: false,
      index: true,
    },
    password: {
      type: String,
      select: false,
    },
    url: {
      type: String,
    },
    isText: {
      type: String,
      default: true,
    },
    maxViews: {
      type: Number,
      default: null,
    },
    viewsLeft: {
      type: Number,
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    linkName: {
      type: String,
      trim: true,
      default: '',
    },
    allowedViewerEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// no need for virtual id
itemSchema.set('id', false);

// QUERY: PRE MIDDLEWARE
// 1. check if expired
itemSchema.pre(/^find/, function () {
  // chain query : greater than current date & num
  this.where({ expiresAt: { $gt: new Date() } });
});

itemSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model('Item', itemSchema);
