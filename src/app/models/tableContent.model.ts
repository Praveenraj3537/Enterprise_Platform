import { KeyValue } from '@angular/common';
import { CustomKeyValueString } from '../shared/interface/form-data-advanced';

export class TableColumn{
    public ColumnName:string;
    public ColumnType:string;
    
}

export class TableData{
    public ColumnName: string;
    public ColumnData: any;
    public ColumnType?:string;
    public CssClassName?:string;
    public KeyValues?:Array<CustomKeyValueString>;
}

export class TableRecord{
    public Record:any;
    public Id:any;
   // public ColumnValues:KeyValue<string,string>; //  Array<TableData>;
    public ColumnValues:TableData[]; //Array<TableData>;
   
  
}