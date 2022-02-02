async function findOneItemByObject(client, db, collection, object) {
  const result = await client.db(db).collection(collection).findOne(object);

  if (result) {
    console.log(`Found an item in the collection with object: ${object}`);
    console.log(result);

    return result;
  } else {
    console.log(`No items found with the object '${object}'`);
  }
}

async function findMultipleItemsByObject(client, db, collection, object) {
  const cursor = await client.db(db).collection(collection).find(object);

  const results = await cursor.toArray();

  if (results) {
    console.log(`Found items in the collection with the object '${object}'`);
    console.log(`Results: ${results}`);

    return results;
  } else {
    console.log(`No items found with the object '${object}'`);
  }
}

async function create(client, db, collection, newObject) {
  const result = await client
    .db(db)
    .collection(collection)
    .insertOne(newObject);

  console.log(`New object created with the following id: ${result.insertedId}`);

  return result;
}

async function createMultiple(client, db, collection, newObjects) {
  const result = await client
    .db(db)
    .collection(collection)
    .insertMany(newObjects);

  console.log(
    `${result.insertedCount} new objects created with the following id(s):`
  );
  console.log(result.insertedIds);

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

  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  console.log(`${result.modifiedCount} documents were updated`);

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

  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  console.log(`${result.modifiedCount} documents were updated`);

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

  console.log(`${result.matchedCount} document(s) matched the query criteria`);

  if (result.upsertedCount > 0) {
    console.log(`One document was inserted with the id ${result.upsertedId}`);

    return result;
  } else {
    console.log(`${result.modifiedCount} document(s) were updated`);
  }
}

async function deleteByObject(client, db, collection, object) {
  const result = await client.db(db).collection(collection).deleteOne(object);

  console.log(`${result.deletedCount} documents were deleted`);
  return result;
}

async function deleteManyByObject(client, db, collection, object) {
  const result = await client.db(db).collection(collection).deleteMany(object);

  console.log(`${result.deletedCount} documents were deleted`);

  return result;
}

async function listDatabases(client) {
  const databasesList = await client.db().admin().listDatabases();
  console.log("Databases:");
  databasesList.databases.forEach((db) => {
    console.log(` - ${db.name}`);
  });
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
