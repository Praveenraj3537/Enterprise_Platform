// All Models as per DRAW.IO CLASS DIAGRAM

import { StringMapWithRename } from "@angular/compiler/src/compiler_facade_interface";

export class Condition {
  FieldName: string;
  FieldValue: any;
  OperatorSymbol?: number;
  ConditionalSymbol?: number;
}

export class SortCondition {
  ColumnName: string;
  IsAsc: boolean
}
export class AdditionalParam {
  ControlName?: string;
  ModelPropName?: string;
  KeyName?: string;
  ValueName?: string;
  ControlType?: string;
}
export class Filter {
  Conditions: Array<Condition>;
  OrderByField?: string;
  IsOrderByFieldAsc?: boolean;
}
export class RequestModel {
  Filter: Filter;
  Children: Array<string>;
}


export class PageCache {
  Page?: string;
  RequestModel?: RequestModel;
  Url?: string;
  SearchContent?: string;
  AssignmentStatusHeaderData?: Array<any>;
  CacheHeader?: Array<Header>;
  ControlCollectionNValues: Array<ControlCollectionNValue>;
}

export class ControlCollectionNValue {
  ControlId?: string;
  ControlKeyValue: any;
}
export interface AppMessage {
  Id: number,
  MessageBody: string,
  IsRead: boolean,
  RowVersion: string
  AppId: number
}
export interface Endpoint {
  Id: number,
  EndpointAddress: string,
  Protocol: string,
  ReturnType: string,
  Version: string,
  Headers?: Array<Header>,
  AdditionalParams?: Array<AdditionalParam>,
  RelatedParams?: Array<AdditionalParam>,
  RequestParams?: Array<AdditionalParam>,
  ModuleName?: string,
  SortKey?: string,
  UseCache?: boolean,
  IsUniqueness?: boolean,
  delay?: number
}

export interface SecondaryEntity {
  ModelPropName: string,
  ControlProperty: string
}
export interface Header {
  KeyName: string,
  ValueName: string,

}
export interface Operation {
  Id: number,
  OperationMode: string,
  OperationEndpoint: Endpoint,
  OperationVerb: string,

}

export interface ReportInput {
  ControlName: string,
  ControlType: string,
  ModelName?: string,
}

export interface ReportOutput {
  ControlName: string,
  ControlType: string,
  ModelName?: string,
}
export interface Dropdown2LevelEventData {
  url: string,
  controlId: string,
  modelPropName: string,
  events?: Array<Event>,
  currentSection?: Section
}

export interface UniqueKey {

}
export interface Section {
  Id: number,
  FormId: number,
  SectionName: string,
  SectionAttributes: Array<SectionAttribute>,
  SectionTypeName?: string,
  Columns?: Array<ColumnHeader>,
  ColumnString?: Array<ColumnString>,
  // AppMessages? :Array<AppMessage>
  Filter?: Filter,//s
  UniqueKeys?: Array<string>,//s
  //ColumnNumber?: Array<ColumnNumber>,
  DisplayOrder: number,
  Operations: Array<Operation>,//s
  SubSections: Array<Section>,
  BaseEntityId: number,
  IsMultiplicity: boolean,
  ParentSectionId: number,
  CssClassName?: string,
  ModelCollectionName?: string,
  ModelObjectName?: string,
  EndPoint?: Endpoint;
  DataTemplates?: Array<DataTemplate>

  //CssClasses?:Array<string>
}

export interface Scripts {
  name: string;
  src: string;
}

export interface ColumnHeader {
  HeaderName: string,
  CssClassName: string,
  HeaderData?: string
}

export class RouteEntry {
  path: string;
  typeofpage: string;
  data: RouteData

}

export class RouteData {
  val: string;
  module: string;
}

export class ServerClaim {
  AppId: number;
  AppName: string;
  FeatureName: string;
  Operation: string;
  AllowAccess: boolean;
  FeatureKey: string;
}
export interface ColumnString {
  Key: string,
  Value: string
}

export class RunningNumber {
  constructor() {
    this.currentpattern = '';
    this.previouspattern = '';
    this.runningColumnNumber = null;
    this.previousValueNumber = '';
   // this.isForce = false;
    this.lastNonNumericPosition = -1;
    this.numericValue = '';
    this.nonNumericValue = '';

    this.firstPattern =''; 
    this.firstNumericValue ='';
    this.firstNonNumericValue='';
    this.firstNonNumericPosition = -1;
    this.firstValueNumber = '';
    this.isFirstLoop = true;
  }
  runningColumnNumber: number;
  currentpattern: string;
  previouspattern: string;
  maintainRepeat: boolean;
  isForce: boolean;
  previousValueNumber: string;
  lastNonNumericPosition: number;
  numericValue: string;
  nonNumericValue: string;

  firstPattern:string;
  firstNumericValue:string;
  firstNonNumericValue:string;
  firstNonNumericPosition: number;
  firstValueNumber :string;
  isFirstLoop:boolean;
}

export interface ServerValidations {
  TagToReplace: string,
  ValueTakenFrom: string

}

export interface DateValidator {
  affectedControl?: string,
  isGlobalyAffectedControl?: boolean,
  rule?: string,
  msg?: string
}
export interface Validator {
  Required: boolean;
  Minlength?: number;
  Maxlength?: number;
  MinRange?: number,
  MaxRange?: number,
  Pattern?: any;
  ValidationMsg?: any;
  AdditionalValidator?: Array<ServerValidations>;
  ServiceValidationToReact?: boolean   //if set to true , it will raise validation error if response from servicer is 'true' if set to false then it will raise error when servrer response is 'false'
  DateValidators?: Array<DateValidator>
}
export interface Event {
  EventName: string,
  affectedControlName: string,
  affectedControlModelName?: string,
  affectedControlModelName1?: string,
  EndPoint?: Endpoint,
  RouteEntry?: string,
  Behaviour?: string, //Normal, TableAddNewRow, 
  ReportInputs?: Array<ReportInput>,
  ReportOutputColumns?: Array<ReportOutput>,
  ParentControlId?: any,
  NavigationFrom?: string,
  ActionType: string,
  ParamValueReferences?: Array<ParamKeyValueString>,
  IsLevel3?: boolean
  AdditionalInfo?: boolean;
  IsSequential?: boolean;
  DataNotFoundEvents?: Array<Event>
}
export interface SectionAttribute {
  Id: number;
  AttributeId: number;
  RatingValue: number;
  LabelName: string;
  ControlName: string;
  ModelPropName?: string;
  ControlType: string;
  CurrentValue: string;
  ValueType: string;
  IsHidden?: boolean,
  IsDisabled?: boolean,
  IsNeeded?: boolean,
  CssClassName: string;
  CssHeaderClassName?: string;//s
  SecondaryEntity?: SecondaryEntity,
  ModelPropName2?: string,//
  DependentOption?: DependentOption,
  Title: string;
  Validators: Array<Validator>,
  Events: Array<Event>;
  EndPoint?: Endpoint;
  RouteEntry?: string;
  IncludeIcon?: boolean,
  IconClass?: string;
  ModelPropType?: string;
  IncludeRefresh?: boolean;//s
  HelpText?: string;//s
  IncludeAdditionalInfo?: boolean;//
  ReadFromTag?: boolean;//
  DefaultValue?: string;
  EndPointId?: number;//
  RowVersion?: any;//
}

export class DependentOption {
  Id: number;
  AttributeId: number;
  GetEndpoint: string;
  KeyField: string;
  ValueField: string;

}
export class Menu {
  Id: number;
  Text: string;
  RouterPath?: string;
  Icon: string;
  ApiName?: string;
  ImagePath?: string;
  Value?: string;
  CanActivate?: boolean;
  ComponentType: string;
  Children?: Array<Menu>;
  ToDelete?: boolean;
}

export class GridColumn {
  ColumnName: string;    //ColumnName that needs to be the header
  FQModelName: string;   //Example Address.StreetAddress  (in normal case this will be same as ColumnName, but for associative entity it will Address.StreetAddress)
  ToPublish?: boolean;
  IsSortable?: boolean;
  FQSortableField: string;
  APIUrl?:string;
  ColumnType?: string;
  ColumnHeader?: string;
  Alignment?: string;
  InputKeyColumnName?: string;
  InputValueFieldId?:string;
  //new properties
}
export interface Tab {
  Id: number;
  AttributeId: number;
  TabName: string,
  ControlType: string;
  EndPoint?: Endpoint;
  Events: Array<Event>;
  CssClassName: any;
}
export interface Form {
  Id: number,
  FormName: string,
  Menu: string,
  IsSummaryData?: boolean,
  Sections: Array<Section>,
  PopUpUrl: string,
  TenantId: number,
  FormType: number, //1-> Index, 2-> Add/edit, 3--> Report, 4--> Taskboard, 5--> Timesheet
  Tabs: Array<Tab>
  BaseEntityId: number,
  ModuleId: number,
  BaseFormId: number,
  GotoBack: boolean,
  GridColumns: Array<GridColumn>,
  EndPoint?: Endpoint;
  IsFormMsg?: boolean;
  FormMsg?: string;
  IsHistory?: boolean;
  IsOperationButton?: boolean;
  IsPaginationEnabled?: boolean;
}

export class FormIndex {
  Url: string;
  Navigation: string;
  Endpoints?: Endpoint[];
}

export class CustomKeyValueString {
  Key: number;
  Value: string;
}

export class UpdateValue {
  key: string;
  value: any;
}
export class TypoConfirmationHelper {
  key: string;
  value: boolean;
}
export class ParamKeyValueString {
  ControlName: string;
  Key: string;
  Value: string;
}
export class DataTemplate {
  ColumnName: string;
  ColumnType: string;
  IsDataToBeExtracted: boolean;
  CssClassName: any;
  DataType: string;
  KeyValues?: Array<CustomKeyValueString>;
  Events: Array<Event>;
}

export class UIMenu {
  path: string;
  typeofpage: string;
  data: MenuData;
  canActivate: boolean;
}

export class UIMenuAndRoles {
  Menus: Array<UIMenu>;
  Roles: Array<string>
}

export class KeyValueOfUIMenu {
  Key: string;
  Value: Array<UIMenu>;
}

export class MenuData {
  val: string;
  module: string;
}

export class ColumnInformation {
  HeaderColumn: string;
}