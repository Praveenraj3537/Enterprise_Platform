export const environment = {
  production: true,
  redirect_to_login: true,

  version:"1.0.0",

  // oidc_settings:{
  //   authority: 'https://antronsysinfo.okta.com/',
  //   client_id: '0oa5f0npienbKPn9t4x6',
  //   response_type:"code",
  //   scope:"openid profile email",
  //   filterProtocolClaims: true,
  //   loadUserInfo: true,
  //   automaticSilentRenew: true,
  //   includeIdTokenInSilentRenew: true,
  //   revokeAccessTokenOnSignout: true,
  // },

  
  // templateUrl:'https://platform.antronsys.com/api/templates',
  // platformBaseUrl: 'https://platform.antronsys.com',
  // projectPlusBaseUrl:'https://projectplus.antronsys.com',
  // iotPlusBaseUrl:'https://iotplus.antronsys.com',
  // salesCRMPlusBaseUrl:'https://salescrm.antronsys.com',

   //'https://localhost:5001' --> local platform , 'https://localhost:5003' --> local project plus
   //appBaseUrls:['https://platform.antronsys.com', 'https://projectplus.antronsys.com']
  //  appBaseUrls:['https://platform.antronsys.com'],
   appBaseUrls:['https://localhost:4200'],
   dashboardBaseUrls:['https://localhost:4200/dashboard']
  //  dashboardBaseUrls:['https://platform.antronsys.com', 'https://projectplus.antronsys.com']
};
