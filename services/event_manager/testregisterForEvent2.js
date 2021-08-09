/* eslint-env jest */
const {
  MongoClient,
  ObjectId
} = require('mongodb');

const registerForEvent2 = require('./registerForEvent2.js');

// call env path
require('dotenv').config({ path: '../../.env' });

// test('registerForEvent2.js is tested', () => {
//   return registerForEvent2.regEvent('Test', '5e9dccfa9f494596dbce0d3c').then( () => {
//     expect(data).toBe('5e9dccfa9f494596dbce0d3c');
//   });
// });

describe('register', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    db = await connection.db(process.env.STITCH_APP_NAME);
  });

  afterAll(async () => {
    await connection.close();
    await db.close();
  });

  it('should register a user into collection', async () => {
    const mockUser = { _id: '5e9dccfa9f494596dbce0d3c' };
    const mockEvent = 'Test';
    await registerForEvent2.regEvent(mockEvent, mockUser._id);

    const registeredUser = await db.collection(process.env.STITCH_APP_NAME).findOne({ 'properties.registry.bsonType': ObjectId(mockUser._id) });
    expect(registeredUser).toEqual(mockUser._id);
  });
});
