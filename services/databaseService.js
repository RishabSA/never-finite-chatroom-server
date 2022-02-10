async function findOneItemByObject(client, db, collection, object) {
  const result = await client.db(db).collection(collection).findOne(object);

  if (result) {
    return result;
  }
}

async function findMultipleItemsByObject(client, db, collection, object) {
  const cursor = await client.db(db).collection(collection).find(object);

  const results = await cursor.toArray();

  if (results) {
    return results;
  }
}

async function create(client, db, collection, newObject) {
  const result = await client
    .db(db)
    .collection(collection)
    .insertOne(newObject);

  return result;
}

async function createMultiple(client, db, collection, newObjects) {
  const result = await client
    .db(db)
    .collection(collection)
    .insertMany(newObjects);

  return result;
}

async function updateObjectByObject(
  client,
  db,
  collection,
  object,
  updatedObject
) {
  const result = await client
    .db(db)
    .collection(collection)
    .updateOne(object, { $set: updatedObject });

  return result;
}

async function updateManyObjectsByObject(
  client,
  db,
  collection,
  object,
  updatedObject
) {
  const result = await client
    .db(db)
    .collection(collection)
    .updateMany(object, { $set: updatedObject });

  return result;
}

async function upsertObjectByObject(
  client,
  db,
  collection,
  object,
  updatedObject
) {
  const result = await client
    .db(db)
    .collection(collection)
    .updateOne(object, { $set: updatedObject }, { upsert: true });

  if (result.upsertedCount > 0) {
    return result;
  }
}

async function deleteByObject(client, db, collection, object) {
  const result = await client.db(db).collection(collection).deleteOne(object);
  return result;
}

async function deleteManyByObject(client, db, collection, object) {
  const result = await client.db(db).collection(collection).deleteMany(object);
  return result;
}

async function listDatabases(client) {
  const databasesList = await client.db().admin().listDatabases();
}

module.exports = {
  findOneItemByObject,
  findMultipleItemsByObject,
  create,
  createMultiple,
  updateObjectByObject,
  updateManyObjectsByObject,
  upsertObjectByObject,
  deleteByObject,
  deleteManyByObject,
  listDatabases,
};
