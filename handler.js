"use strict";

const aws = require("aws-sdk");
const dynamodb = new aws.DynamoDB.DocumentClient();

const generateUUID = require("uuid");

module.exports.saveUsers = async (event) => { //TODO fixa interface, dela upp logiken, skicka mejl efter sparat i databasen. Ge livstil till lambda
  console.info("The raw data from API:", event);

  const reqBody = JSON.parse(event); //To make it work throu postman

  const time = today.getHours() + ":" + today.getMinutes();
  const datetime = new Date().toISOString().substring(0, 10) + " " + time;

  console.info("requestBody with JSONParse", reqBody);

  let availability = await checkAvailability(reqBody.programmingCourse);

  var params = {
    TableName: "registrationTable",
    Item: {
      Guid: generateUUID.v1(),
      Firstname: reqBody.firstname,
      Lastname: reqBody.lastname,
      Email: reqBody.email,
      Age: reqBody.age,
      Allergy: reqBody.allergy_specialdiets,
      ifAllergy: reqBody.ifAllergy,
      ProgrammingCourse: reqBody.programmingCourse,
      ifAvanced: reqBody.ifAvanced,
      Own_Computer: reqBody.borrow_computer,
      SaveEmail: reqBody.saveEmail,
      ReceivedInfo: reqBody.receivedInfo,
      Created: datetime,
      WaitingList: availability,
    },
  };

  const data = await dynamodb.put(params).promise();

  console.info("Response from dynamoDB POST", data);

  return {
    statusCode: 201,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(availability, null, 2),
  };
};

let checkAvailability = async (programmingCourse) => {
  let params = { TableName: "registrationTable" };

  let advanced = [];
  let beginner = [];
  let items;

  items = await dynamodb.scan(params).promise();
  console.log("Response from DynamoDB scan", items);
  items.Items.forEach((item) => {
    if (item.ProgrammingCourse === "Advanced") {
      advanced.push(item);
    }
    if (item.ProgrammingCourse === "Beginner") {
      beginner.push(item);
    }
  });

  let onWaitingList;
  // if(programmingCourse === "Advanced") {
  //   if(advanced.length >= 10) { //advanced bigger than x

  //     onWaitingList = "true"

  //   }
  //   else {
  //     onWaitingList = "false"
  //   }
  // }

  if (programmingCourse === "Beginner") {
    if (beginner.length >= 3) {
      //beginner bigger than x

      onWaitingList = "true";
    } else {
      onWaitingList = "false";
    }
  }

  return onWaitingList;
};
