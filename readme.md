# ClubHub-api

![Mongodb](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)&nbsp;
![NPM](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)&nbsp;

# HOW TO RUN user_info.js

1. $ npm init
2. $ rm -rf node_modules
3. $ npm install
4. $ npm install --save mongodb-stitch-server-sdk
5. $ npm install --save bcrypt
6. $ npm install --save mongodb
7. make changes mentioned in connect.js and insert-data.js
8. $ node user_info.js
9. go to website : http://localhost:3000/user_detail.html
10. submit and see your details in mongoDB atlas
11. $ npm i mongodb-realm-cli

# FOR create_event_stitch3.js and create_event_stitch4.js

## STITCH function name is __stitch_Find_Club_Id__

exports = function(clubname){

  var collection =  context.services.get("mongodb-atlas").db("clubhub_data").collection("CLUBS");

  var ans = collection.findOne({ club_name : clubname});

  if(ans)
  {
    return ans;
  }
  else
  {
    return false;
  }

};

1. go to website : http://localhost:3000/create_event.html

# FOR get_event_stitch.js

## STITCH function name is __stitch_Get_Event__

exports = function(eventName){

  const mongodb = context.services.get('mongodb-atlas');

  const events_collection = mongodb.db('clubhub_data').collection('events');

  return events_collection.find({ 'properties.name.bsonType' : eventName }).toArray();


};

1. go to website : http://localhost:3000/get_event_info.html

# FOR delete_event.js

## STITCH function name is __stitch_Delete_Event__


exports = function(eventName){

  const mongodb = context.services.get("mongodb-atlas");
  const eventsCollection = mongodb.db("clubhub_data").collection("events");

  return eventsCollection.findOneAndDelete({ "properties.name.bsonType" : eventName})

  .then(result => console.log(`Successfully deleted event with _id: ${result}`))

  .catch(err => console.error(`Failed to delete event: ${err}`))

};

1. go to website : http://localhost:3000/delete_event.html
2. CAUTION : Before merging to master change **app.get** to  **app.delete** in delete_Event.js , This is done since HTML forms only support POST and GET requests

# For update_Event.js

1. link : http://localhost:3000/update_event.html

# For registerForEvent.js

1. link:  http://localhost:3000/register_event.html

# For getPosterS3

1. link:  http://localhost:3000/get_poster.html

# For uploadPosterS32

1. link:  http://localhost:3000/upload_poster2.html
2. for converting to base64 use upload_poster.html
