// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  redirect_to_login: true,
  version:"1.0.0",
  //*********************** LOCAL ENVIRONMENT C# ******************************* */
  // templateUrl:'https://localhost:44310/api/templates',               //************ C# TEMPLATES URL ***************** */
  // platformBaseUrl: 'https://localhost:44310',
  // projectPlusBaseUrl:'https://localhost:44365' ,
  // iotPlusBaseUrl:'https://localhost:44366' ,
  // appBaseUrls:['https://localhost:44310'],
  // //salesCRMPlusBaseUrl:'https://localhost:44360',
  // salesCRMPlusBaseUrl:'https://localhost:5003',
  // dashboardBaseUrls:['https://localhost:44310', 'https://localhost:44365']
 

  
  templateUrl:'http://localhost:8080/templates',

//*********************** CLOUD DEVELOPMENT ENVIRONMENT ******************************* */
  //templateUrl:'https://platform.antronsys.com/api/templates',
  platformBaseUrl: 'https://localhost:4000',
  projectPlusBaseUrl:'https://localhost:4000',
  iotPlusBaseUrl:'https://localhost:4000' ,
  salesCRMPlusBaseUrl:'https://localhost:4000',
  appBaseUrls:['https://localhost:4200'],
  // appBaseUrls:['https://platform.antronsys.com'],
  dashboardBaseUrls:['http://localhost:4200/dashboard']
  // dashboardBaseUrls:['https://platform.antronsys.com', 'https://projectplus.antronsys.com']
 //awsUrl:'https://sqs.us-east-1.amazonaws.com/410099809423/Mobile_User_Smartup'
//  ng serve --ssl --ssl-key C:\\Users\\PRAVEE~1\\AppData\Local\\Temp\\localhost\\localhost.key  --ssl-cert C:\\Users\\PRAVEE~1\\AppData\\Local\\Temp\\localhost\\localhost.crt --port 4202

};
