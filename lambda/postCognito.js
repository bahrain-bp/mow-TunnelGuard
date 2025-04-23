const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const userSub = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;

  const params = {
    TableName: process.env.USERS_TABLE,
    Item: {
      user_id: userSub,
      user_name: email,  // or set default name
      role: "User", // Default role, can be changed later
      contact: {
        email: email,
        phone: event.request.userAttributes.phone_number || null, // Optional phone number
      },
      notification_pref: {
        email: true, // Default to true, can be changed later
        sms: false,  // Default to false, can be changed later
        app: false,  // Default to false, can be changed later
      },
      department: "Unassigned"
    }
  };

  try {
    await dynamo.put(params).promise();
    console.log(`User ${userSub} added to Users table`);
    return event; // return event back to Cognito
  } catch (err) {
    console.error('DynamoDB error', err);
    throw err;
  }
};