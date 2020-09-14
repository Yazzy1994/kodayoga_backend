'use strict';

const aws = require("aws-sdk")
const dynamodb = new aws.DynamoDB.DocumentClient()

const generateUUID = require("uuid");
const { ForecastService } = require("aws-sdk");


module.exports.getUsers = async (ProgrammingCourse) => {

 let params = { TableName: "registrationTable" }

    let items; 
  
    items = await dynamodb.scan(params).promise();

    return {
      statusCode: 200
    }
 
};


module.exports.saveUsers = async event => {

  const reqBody = JSON.parse(event.body) //To make it work throu postman

  var today = new Date();
  var date = today.getDate()+'/'+(today.getMonth()+1)+'/'+ today.getFullYear(); 
  var time = today.getHours()+ ":" + today.getMinutes();
  var datetime = date +' '+ time

  console.log(reqBody)

  let availability = await checkAvailability(reqBody.programmingCourse);


  var params = {
    TableName : "registrationTable",
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
      WaitingList: availability

     
     
    }, 

  };

  const data = await dynamodb.put(params).promise()
  

  return {
    statusCode: 201, 
    headers: {'Access-Control-Allow-Origin': '*'},
    body: JSON.stringify(availability, null, 2
    ),
  };
  
    
}

let checkAvailability = async (programmingCourse) => {

    let params = { TableName: "registrationTable" }

    let advanced = []
    let beginner = []
    let items; 
  
    items = await dynamodb.scan(params).promise();
    items.Items.forEach(item => {
      if(item.ProgrammingCourse === "Advanced") {
         advanced.push(item)
      }
      if(item.ProgrammingCourse === "Beginner") {
        beginner.push(item)
      }
     
    });
  
    
    let onWaitingList; 
    if(programmingCourse === "Advanced") {
      if(advanced.length >= 10) { //advanced bigger than x
  
        onWaitingList = "true"
  
  
      }
      else {
        onWaitingList = "false"
      }
    }
  
    if(programmingCourse === "Beginner") {
      if(beginner.length >= 20) {   //beginner bigger than x 
       
        onWaitingList = "true"
      }
      else
      {
        onWaitingList = "false"
      }
     
    }

   return onWaitingList
  
}