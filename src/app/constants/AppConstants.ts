export class AppConstants {

  public static readonly OIDC = {
    OIDC_SETTINGS: 'oidc_settings',
    CLIENT_ID: 'client_id',
    REDIRECT_URI: 'redirect_uri',
    RESPONSE_TYPE: 'response_type',
    SCOPE: 'scope',
    POST_LOGOUT_REDIRECT_URI: 'post_logout_redirect_uri',
    FILTER_PROTOCOL_CLAIMS: 'filterProtocolClaims',
    LOAD_USER_INFO: 'loadUserInfo',
    AUTOMATIC_SILENT_RENEW: 'automaticSilentRenew',
    SILENT_REDIRECT_URI: 'silent_redirect_uri',

    OKTA_CLIENT_ID: 'oktaClientId',
    OKTA_DOMAIN: 'oktaDomain',
    DEFAULT_SCOPE: 'openid profile email',
    RESPONSE_TYPE_CODE: 'code',

    OPENID_DOMAIN: 'openid_domain',
    IS_APP_LOADED: 'isAppLoaded',
    STAGE: 'STAGE',

    EXPIRES_AT:"expires_at"

  };

  public static AUTHENTICATION_STAGES = {
    STARTED_AUTHENTICATION: 'STARTED_AUTHENTICATION',
    COMPLETE_AUTHENTICATION: 'COMPLETE_AUTHENTICATION',
    SIGN_OUT: 'SIGN-OUT',
    SIGNED_OUT: 'SIGNED_OUT'
  };

  public static readonly HEADERCOMPONENT = {
    changePassword: 'Change Password',
    logout: 'Logout',
    logoutConfirmation: 'Do you want to logout?',
    cancel: 'Cancel',
  };
  public static readonly GENERAL = {
    ROUTED_ADDED: 'ROUTED_ADDED',
    DEFAULT_GUID: '00000000-0000-0000-0000-000000000000',
    HIDDEN_MANUALY_SET_ID: 'hidden_manually_set',
    HIDDEN_INPUT_MANUALY_SET_ID: 'hidden_input_manually_set',
    HIDDEN_LAST_TD_ID: 'hidden_last_td_id',
    HIDDEN_BARCODE_ID:'hidden_barcode_id',
    HIDDEN_SAMPLE_ID: 'hidden_sampleId',
    HIDDEN_METHOD_ID: 'hidden_methodId',
    HIDDEN_STAGE_ID: 'hidden_stageId',
    HIDDEN_LAST_INPUT_DATA_TD_ID: 'hidden_last_input_data_td_id',
    HIDDEN_INPUT_DATA_ID: 'hidden_inputId',
    DISCONNECTSOCKETURL:'https://api-gateway.dev.atpltd.net/disconnectdevice'
  }

  public static readonly COMMON = {
   CUSTOMATTRIBUTES: 'CustomAttributes',
   COMMON_ID:'id',
   ID:'Id',
   COMMON_ROWVERSION:'RowVersion',
   COMMON_COLUMN_NAME:'ColumnName',
   COMMON_CREATION_DATE:'CreationDate',
   COMMON_FORMULAE:'Formulae',
   COMMON_IS_INPUT:'IsInput',
   COMMON_IS_REPEAT:'IsRepeat',
   COMMON_IS_RUNNING_NUMBER:'IsRunningNumber',
   COMMON_IS_TEXT:'IsText',
   COMMON_METHOD_STAGE_COLUMN_NAME:'MethodStageColumnName',
   COMMON_METHOD_STAGE_GRID_COLUMN_ID:'MethodStageGridColumnId',
   COMMON_METHOD_STAGE_ID:'MethodStageId',
   COMMON_METHOD_STAGE_NAME:'MethodStageName',
   COMMON_MODIFIED_DATE:'ModifiedDate',
   COMMON_NO_OF_ROWS:'NoOfRows',
   COMMON_SAMPLE_ID:'SampleId',
   COMMON_START_COLUMN_PATTERN:'StartColumnPattern',
   COMMON_ENTITY_STATE:'EntityState',
   COMMON_CURRENT_PAGE:'currentPage',
   COMMON_SAMPLE_METHOD_STAGE_READING2:'sampleMethodStageReading2',
   SAMPLE_METHOD_STAGE_READINGS:'SampleMethodStageReadings',
   COMMON_LBL_RECORDS_INFO1:'lblRecordsInfo1',
   COMMON_FIRST_RECORD:'firstRecord',
   COMMON_LAST_RECORD:'lastRecord',
   COMMON_PREV_URL:'prevUrl',
   COMMON_INITIALIZATION:'Initialization',
   COMMON_SAMPLE_INITIALIZATION:'sampleinitializations',
   COMMON_LATTITUDE:'latitude',
   COMMON_LONGITUDE:'longitude',
   COMMON_AUTO_OFF_SET:'AutoOffset',
   COMMON_INSTRUMENT_CALIBRATION_SET_DETAILS:'InstrumentCalibrationSetDetails',
   COMMON_TD_ID:'tdId',
   COMMON_PREDEFINED_WEIGHT:'PredefinedWeight',
   COMMON_OBSERVED_WEIGHT:'ObservedWeight',
   COMMON_SPECIAL_ROWVERSION:'special_rowversion',
   COMMON_SPECIAL_ID:'special_id',
   COMMON_SAMPLE_METHOD_STAGES:'SampleMethodStages',
   COMMON_SAMPLE_METHOD_STAGE_ID:'SampleMethodStageId',
   COMMON_ROW:'Row',
   COMMON_COLUMN:'Column',
   COMMON_SAMPLE_METHOD_STAGE_COLUMN_VALUE:'SampleMethodStageColumnValue',
   COMMON_TABLE_ID:'TableId',
   COMMON_STAGE_ID:'StageId',
   COMMON_METHOD_ID:'MethodId',
   COMMON_TOTAL_RECORDS:'TotalRecords',
   COMMON_MAINTAIN_REPEAT:'MaintainRepeat',
   COMMON_IS_SCAN:'IsScan',
  


  }
}  