// get_event_info -> webhook0
// This function is the webhook's request handler.
exports = function (payload, response) {
  const { arg1 } = payload.query;

  console.log(payload.query);
  console.log('name of event :', arg1);

  const { body } = payload;

  console.log('Request body:', body);

  const mongodb = context.services.get('mongodb-atlas');
  const events_collection = mongodb.db('clubhub_data').collection('events');

  // Calling a function:
  const result = context.functions.execute('stitch_Get_Event', arg1);
  return result;
};

// get_all_events -> webhook1
// This function is the webhook's request handler.
exports = function (payload, response) {
  const mongodb = context.services.get('mongodb-atlas');
  const eventsCollection = mongodb.db('clubhub_data').collection('events');
  return eventsCollection.find({ }).toArray();
};
