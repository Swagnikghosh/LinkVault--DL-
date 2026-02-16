const asyncHandler = require('express-async-handler');
const { constants } = require('../utils/constants');

const getOne = (Model, populateOptions) =>
  asyncHandler(async (req, res) => {
    let query = Model.findById(req.params.id);
    const doc = await query;
    if (!doc) {
      res.status(constants.NOT_FOUND);
      throw new Error('No document found with that ID');
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc,
      },
    });
  });

module.exports = { getOne, createOne };
