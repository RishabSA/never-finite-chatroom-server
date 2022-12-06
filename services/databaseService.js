const mongoose = require("mongoose");

async function findOneItemByObject(schema, object) {
  const result = await schema.findOne(object).lean();

  if (result) {
    return result;
  }
}

async function findMultipleItemsByObject(schema, object) {
  const results = await schema.find(object).lean();

  if (results) {
    return results;
  }
}

async function create(schema, newObject) {
  const result = await schema.create(newObject).lean();
  return result;
}

async function createMultiple(schema, newObjects) {
  const result = await schema.insertMany(newObjects).lean();
  return result;
}

async function updateObjectByObject(schema, object, updatedObject) {
  const result = await schema.updateOne(object, updatedObject).lean();
  return result;
}

async function updateManyObjectsByObject(schema, object, updatedObject) {
  const result = await schema.update(object, updatedObject).lean();
  return result;
}

async function deleteByObject(schema, object) {
  const result = await schema.deleteOne(object).lean();
  return result;
}

async function deleteManyByObject(schema, object) {
  const result = await schema.deleteMany(object).lean();
  return result;
}

module.exports = {
  findOneItemByObject,
  findMultipleItemsByObject,
  create,
  createMultiple,
  updateObjectByObject,
  updateManyObjectsByObject,
  deleteByObject,
  deleteManyByObject,
};
