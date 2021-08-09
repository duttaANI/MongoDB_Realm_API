/* Node Modules */
// const should = require('should');

/* Unit Tests */
/* eslint-env jest */
const { MongoClient, ObjectId } = require('mongodb');

// call env path
require('dotenv').config();

const registerForEvent2 = require('../../services/event_manager/registerForEvent2.js');

describe('register', () => {
  let connection;
  let db;
  const mockUser = { _id: '5e9dccfa9f494596dbce0d3c' };
  const mockEvent = 'Test';

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    db = await connection.db(process.env.CLUBHUB_DB);
  });

  afterAll(async () => {
    await db.collection(process.env.EVENTS_COLLECTION).updateOne(
      { 'properties.name.bsonType': mockEvent },
      { $pull: { 'properties.registry.bsonType': ObjectId(mockUser._id) } }
    );
    await connection.close();
    await db.close();
  });

  it('should register a user into collection', async () => {
    await registerForEvent2.regEvent(mockEvent, mockUser._id);
    const eventRegistered = await db
      .collection(process.env.EVENTS_COLLECTION)
      .findOne({ 'properties.name.bsonType': mockEvent });
    const i = eventRegistered.properties.registry.bsonType.findIndex(
      element => element.toString() === mockUser._id
    );
    expect(eventRegistered.properties.registry.bsonType[i].toString()).toEqual(
      mockUser._id
    );
  });
});
