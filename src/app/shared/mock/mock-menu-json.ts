import { Menu } from '../interface/form-data-advanced';
export const MenuItem: Menu =
{
  Id: 2,
  Text: 's',

  Icon: 'icon path',
  ComponentType: '',
  Children: [
    {
      Id: 101,
      Text: "Platform",
      RouterPath: "",
      Icon: "fa fa-cog",
      ComponentType: "",
      Children: [
        {
          Id: 102,
          Text: "Admin",
          RouterPath: "",
          Icon: "fa fa-user-plus",
          ComponentType: "",
          Children: [
            {
              Id: 109,
              Text: "App",
              RouterPath: "/platform/apps",
              Icon: "fa fa-user",
              ComponentType: "",
            },
            {
              Id: 108,
              Text: "App Role",
              RouterPath: "/platform/appRoles",
              Icon: "fa fa-user",
              ComponentType: "",
            },
            {
              Id: 104,
              Text: "Clients",
              RouterPath: "/platform/clients",
              Icon: "fa fa-user-circle",
              ComponentType: "",
            },
            {
              Id: 191166,
              Text: "Features",
              RouterPath: "/platform/features",
              Icon: "fa fa-cog",
              ComponentType: "",
            },
            {
              Id: 191167,
              Text: "Feature Permissions",
              RouterPath: "/platform/featurePermissions",
              Icon: "fa fa-cogs",
              ComponentType: "",
            },
            {
              Id: 1913,
              Text: "Bulk Feature Permissions",
              RouterPath: "/platform/bulkfeaturepermissions",
              Icon: "fa fa-cogs",
              ComponentType: "",
            },
            {
              Id: 110,
              Text: "Forms",
              RouterPath: "/platform/forms",
              Icon: "fa fa-wpforms",
              ComponentType: "",
            },
            {
              Id: 1710,
              Text: "Histories",
              RouterPath: "/platform/histories",
              Icon: "fa fa-history",
              ComponentType: "",
            },
            {
              Id: 107,
              Text: "Roles",
              RouterPath: "/platform/roles",
              Icon: "fa fa-id-badge",
              ComponentType: "",
            },

            {
              Id: 105,
              Text: "Tenants",
              RouterPath: "/platform/tenants",
              Icon: "fa fa-paper-plane",
              ComponentType: "",
            },

            {
              Id: 19166,
              Text: "Tenant Apps",
              RouterPath: "/platform/tenantApps",
              Icon: "fa fa-user-circle-o",
              ComponentType: "",
            },

            {
              Id: 110,
              Text: "Tenant Users",
              RouterPath: "/platform/tenantUsers",
              Icon: "fa fa-wpforms",
              ComponentType: "",
            },
            {
              Id: 111,
              Text: "Tenant User Apps",
              RouterPath: "/platform/tenantUserApps",
              Icon: "fa fa-wpforms",
              ComponentType: "",
            },
            {
              Id: 112,
              Text: "Tenant User App Roles",
              RouterPath: "/platform/tenantUserAppRoles",
              Icon: "fa fa-wpforms",
              ComponentType: "",
            },
            {
              Id: 113,
              Text: "Tenant App Features",
              RouterPath: "/platform/tenantAppFeatures",
              Icon: "fa fa-wpforms",
              ComponentType: "",
            },
            {
              Id: 103,
              Text: "Users",
              RouterPath: "/platform/users",
              Icon: "fa fa-users",
              ComponentType: "",
            },
            {
              Id: 3002,
              Text: "Tickets",
              RouterPath: "/platform/tickets",
              Icon: "fa fa-users",
              ComponentType: "",
            },
            {
              Id: 3062,
              Text: "TicketCategories",
              RouterPath: "/platform/ticketCategories",
              Icon: "fa fa-users",
              ComponentType: "",
            },
            {
              Id: 3042,
              Text: "TicketResolutions",
              RouterPath: "/platform/ticketResolutions",
              Icon: "fa fa-users",
              ComponentType: "",
            },
            {
              Id: 304902,
              Text: "Log Report",
              RouterPath: "/platform/logReport",
              Icon: "fa fa-users",
              ComponentType: "",
            }

          ]
        }
      ]
    },

    {
      Id: 119,
      Text: "ProjectPlus",
      RouterPath: "",
      Icon: "fa fa-bar-chart",
      ComponentType: "",
      Children: [
        {
          Id: 109,
          Text: "Setting",
          RouterPath: "",
          Icon: "fa fa-cog",
          ComponentType: "",
          Children: [
            {
              Id: 113,
              Text: "Clients",
              RouterPath: "/projectplus/clients",
              ApiName :"serviceproviderclients",
              Icon: "fa fa-user",
              ComponentType: "",
            },
            {
              Id: 114,
              Text: "Client Employees",
              RouterPath: "/projectplus/clientEmployees",
              Icon: "fa fa-users",
              ComponentType: "",
            },
            {
              Id: 111,
              Text: "Divisions",
              RouterPath: "/projectplus/divisions",
              Icon: "fa fa-map-marker",
              ComponentType: "Index",
              CanActivate: false,
              Value: "Divisions"
            },
            {
              Id: 112,
              Text: "OrgDesignations",
              RouterPath: "/projectplus/orgDesignations",
              Icon: "fa fa-user-circle-o",
              ComponentType: "Index",
              CanActivate: false,
              Value: "OrgDesignations"
            },
            {
              Id: 110,
              Text: "Regions",
              RouterPath: "/projectplus/regions",
              Icon: "fa fa-globe",
              ComponentType: "Index",
              CanActivate: false,
              Value: "Regions"
            },
            {
              Id: 116,
              Text: "Staff",
              RouterPath: "/projectplus/staff",
              Icon: "fa fa-users",
              ComponentType: "",
            },
            {
              Id: 122,
              Text: "Business Units",
              RouterPath: "/projectplus/businessUnits",
              Icon: "fa fa-quote-left",
              ComponentType: "",
            },
            {
              Id: 115,
              Text: "Vendors",
              RouterPath: "/projectplus/vendors",
              Icon: "fa fa-address-card-o",
              ComponentType: "",
            },
          ]
        },

        {
          Id: 120,
          Text: "Operations",
          RouterPath: "",
          Icon: "fa fa-puzzle-piece",
          ComponentType: "",
          Children: [

            {

              Id: 1224,
              Text: "Assignments",
              RouterPath: "/projectplus/assignments",
              Icon: "fa fa-quote-left",
              ComponentType: "",
            },
            {
              Id: 125,
              Text: "Blocked Staff",
              RouterPath: "/projectplus/blockedStaff",
              Icon: "fa fa-ban",
              ComponentType: "",
            },
            {
              Id: 10,
              Text: "Allocated Staff",
              RouterPath: "/projectplus/allocatedStaff",
              Icon: "fa fa-tasks",
              ComponentType: "",
            },
            {
              Id: 122,
              Text: "Interviews",
              RouterPath: "/projectplus/interviews",
              Icon: "fa fa-quote-left",
              ComponentType: "",
            },
            {
              Id: 1922,
              Text: "Invoices",
              RouterPath: "/projectplus/invoices",
              Icon: "fa fa-quote-left",
              ComponentType: "",
            },
            {
              Id: 123,
              Text: "Projects",
              RouterPath: "/projectplus/projects",
              Icon: "fa fa-file-powerpoint-o",
              ComponentType: "",
            },
            {
              Id: 124,
              Text: "Project Staff",
              RouterPath: "/projectplus/projectStaff",
              Icon: "fa fa-users",
              ComponentType: "",
            },
            {
              Id: 67121,
              Text: "Project Meetings",
              RouterPath: "/projectplus/projectMeetings",
              Icon: "fa fa-users",
              ComponentType: "",
            },
            {
              Id: 121,
              Text: "Staff Feedback",
              RouterPath: "/projectplus/staffFeedbacks",
              Icon: "fa fa-comment-o",
              ComponentType: "",
            },
            {
              Id: 122,
              Text: "Staff Leave",
              RouterPath: "/projectplus/staffLeaves",
              Icon: "fa fa-sign-out",
              ComponentType: "",
            },

            {
              Id: 126,
              Text: "Search Staff",
              RouterPath: "/projectplus/searchStaff",
              Icon: "fa fa-search",
              ComponentType: "",
            },
            {
              Id: 126,
              Text: "Time Sheet",
              RouterPath: "/projectplus/timeSheet/view",
              Icon: "fa fa-search",
              ComponentType: "",
            },
            {
              Id: 126,
              Text: "Task Board",
              RouterPath: "/projectplus/taskBoard/view",
              Icon: "fa fa-search",
              ComponentType: "",
            },

          ]
        },
        {
          Id: 129,
          Text: "Reports",
          RouterPath: "",
          Icon: "fa fa-flag-checkered",
          ComponentType: "",
          Children: [
            {
              Id: 12760,
              Text: "Assignment Report",
              RouterPath: "/projectplus/assignmentReport",
              Icon: "fa fa-flag",
              ComponentType: "",
            },
            {
              Id: 120,
              Text: "Staff Availability Report",
              RouterPath: "/projectplus/staffAvailabilityReports",
              Icon: "fa fa-flag",
              ComponentType: "",
            },

            {
              Id: 121,
              Text: "Staff Forecast Report",
              RouterPath: "/projectplus/staffForecastingReports",
              Icon: "fa fa-sun-o",
              ComponentType: "",
            }


          ]
        },

      ]
    },

    {
      Id: 1119,
      Text: "IoTPlus",
      RouterPath: "",
      Icon: "fa fa-ioxhost",
      ComponentType: "",
      Children: [
        {
          Id: 1091,
          Text: "Settings",
          RouterPath: "",
          Icon: "fa fa-cog",
          ComponentType: "",
          Children: [
            {
              Id: 1131,
              Text: "Clients",
              RouterPath: "/iotplus/clients",
              Icon: "fa fa-user",
              ComponentType: "",
              CanActivate: false,
              Value: "Clients"
            },
            {
              Id: 1131,
              Text: "Sensors",
              RouterPath: "/iotplus/sensors",
              Icon: "fa fa-heartbeat",
              ComponentType: "",
              CanActivate: false,
              Value: "Sensors"
            },
          
            {
              Id: 1141,
              Text: "Instruments",
              RouterPath: "/iotplus/instruments",
              Icon: "fa fa-stethoscope",
              ComponentType: "",
              CanActivate: false,
              Value: "Instruments"
            },
            {
              Id: 1715191,
              Text: "Instrument Categories",
              RouterPath: "/iotplus/instrumentCategories",
              Icon: "fa fa-building",
              ComponentType: "",
              CanActivate: false,
              Value: "InstrumentCategories"
            },
            {
              Id: 1167132,
              Text: "IoT Devices",
              RouterPath: "/iotplus/iotDevices",
              Icon: "fa fa-desktop",
              ComponentType: "",
              CanActivate: false,
              Value: "IotDevices"
            },

            {
              Id: 116,
              Text: "Aparatuses",
              RouterPath: "/iotplus/aparatuses",
              Icon: "fa fa-building-o",
              ComponentType: "",
              CanActivate: false,
              Value: "Aparatuses"
            },


            {
              Id: 118735,
              Text: "Calibration Templates",
              RouterPath: "/iotplus/calibrationTemplates",
              Icon: "fa fa-ravelry",
              ComponentType: "",
              CanActivate: false,
              Value: "CalibrationTemplates"
            },
            {
              Id: 11867735,
              Text: "Calibration Template Sections",
              RouterPath: "/iotplus/calibrationTemplateSections",
              Icon: "fa fa-address-card-o",
              ComponentType: "",
              CanActivate: false,
              Value: "CalibrationTemplateSections"
            },


            {
              Id: 1189435,
              Text: "Methods",
              RouterPath: "/iotplus/methods",
              Icon: "fa fa-spinner",
              ComponentType: "",
              CanActivate: false,
              Value: "Methods"
            },
            {
              Id: 118943645,
              Text: "Stages",
              RouterPath: "/iotplus/stages",
              Icon: "fa fa-stack-exchange",
              ComponentType: "",
              CanActivate: false,
              Value: "Stages"
            },
            {
              Id: 11897543645,
              Text: "Method Stages",
              RouterPath: "/iotplus/methodStages",
              Icon: "fa fa-eercast",
              ComponentType: "",
              CanActivate: false,
              Value: "MethodStages"
            },
            {
              Id: 1189754363445,
              Text: "Method Stage Grid Columns",
              RouterPath: "/iotplus/methodStageGridColumns",
              Icon: "fa fa-th-list",
              ComponentType: "",
              CanActivate: false,
              Value: "MethodStageGridColumns"
            }
          ],

        },
        {
          Id: 12075665,
          Text: "Operations",
          RouterPath: "",
          Icon: "fa fa-puzzle-piece",
          ComponentType: "",
          Children: [
            {
              Id: 10522,
              Text: "Projects",
              RouterPath: "/iotplus/projects",
              Icon: "fa fa-file-powerpoint-o",
              ComponentType: "",
              CanActivate: false,
              Value: "Projects"
            },
            {
              Id: 1093131,
              Text: "Sensor Data",
              RouterPath: "/iotplus/sensorData",
              Icon: "fa fa-heartbeat",
              ComponentType: "",
              CanActivate: false,
              Value: "SensorData"
            },
            {
              Id: 10522,
              Text: "Samples",
              RouterPath: "/iotplus/samples",
              Icon: "fa fa-hourglass",
              ComponentType: "",
              CanActivate: false,
              Value: "Samples"
            },
            {
              Id: 10523,
              Text: "Sample Initializations",
              RouterPath: "/iotplus/sampleInitializations",
              Icon: "fa fa-hourglass",
              ComponentType: "",
              CanActivate: false,
              Value: "SampleInitializations"
            },
            {
              Id: 10524,
              Text: "Sample Initialization2",
              RouterPath: "/iotplus/sampleInitialization2",
              Icon: "fa fa-hourglass",
              ComponentType: "",
              CanActivate: false,
              Value: "SampleInitializations"
            },
            {
              Id: 10522,
              Text: "Sample Method Stages",
              RouterPath: "/iotplus/sampleMethodStages",
              Icon: "fa fa-hourglass",
              ComponentType: "",
              CanActivate: false,
              Value: "SampleMethodStages"
            },
            {
              Id: 11435,
              Text: "Instrument Calibration Sets",
              RouterPath: "/iotplus/instrumentCalibrationSets",
              Icon: "fa fa-object-group",
              ComponentType: "",
              CanActivate: false,
              Value: "InstrumentCalibrationSets"
            },
            {
              Id: 1091435,
              Text: "Internal Calibrations",
              RouterPath: "/iotplus/internalCalibrations",
              Icon: "fa fa-object-group",
              ComponentType: "",
              CanActivate: false,
              Value: "InternalCalibrations"
            },
            {
              Id: 11382345,
              Text: "Balance Records",
              RouterPath: "/iotplus/balanceRecords",
              Icon: "fa fa-compass",
              ComponentType: "",
              CanActivate: false,
              Value: "BalanceRecords"
            },
            {
              Id: 1138322345,
              Text: "Sample Method Stage Readings",
              RouterPath: "/iotplus/sampleMethodStageReadings",
              Icon: "fa fa-compass",
              ComponentType: "",
              CanActivate: false,
              Value: "SampleMethodStageReadings"
            },
            {
              Id: 1138322345,
              Text: "Sample Method Stage Reading2",
              RouterPath: "/iotplus/sampleMethodStageReadings2",
              Icon: "fa fa-compass",
              ComponentType: "",
              CanActivate: false,
              Value: "SampleMethodStageReadings2"
            }

          ]
        },
        {
          Id: 129079,
          Text: "Reports",
          RouterPath: "",
          Icon: "fa fa-flag-checkered",
          ComponentType: "",
          Children: [
            {
              Id: 1628921,
              Text: "Balance Record Reports",
              RouterPath: "/iotplus/balanceRecordReports",
              Icon: "fa fa-globe",
              ComponentType: "",
            },
            {
              Id: 18352055,
              Text: "Live Project Report",
              RouterPath: "/iotplus/liveProjectReport",
              Icon: "fa fa-male",
              ComponentType: "",
            },
            {
              Id: 18352044,
              Text: "Project Reports",
              RouterPath: "/iotplus/projectReports",
              Icon: "fa fa-male",
              ComponentType: "",
            },
          
            {
              Id: 183527849,
              Text: "Sample Report",
              RouterPath: "/iotplus/sampleReport",
              Icon: "fa fa-male",
              ComponentType: "",
            },
            {
              Id: 16284921,
              Text: "Instrument Calibration Set Reports",
              RouterPath: "/iotplus/instrumentCalibrationSetReports",
              Icon: "fa fa-caret-square-o-up",
              ComponentType: "",
            },
            {
              Id: 1628774921,
              Text: "Internal Calibration Reports",
              RouterPath: "/iotplus/internalCalibrationReports",
              Icon: "fa fa-caret-square-o-up",
              ComponentType: "",
            }


          ]
        },


      ]
    },
    {
      Id: 4008,
      Text: "SalesCRMPlus",
      RouterPath: "",
      Icon: "fa fa-safari",
      ComponentType: "",
      Children: [
     
        {
          Id: 899980,
          Text: "Setting",
          RouterPath: "",
          Icon: "fa fa-cog",
          ComponentType: "",
          Children: [
            {
              Id: 8991,
              Text: "Associate Companies",
              RouterPath: "/salescrmplus/associateCompanies",
              Icon: "fa fa-building",
              ComponentType: "",
              CanActivate: false,
              Value: "AssociateCompanies"
            },
            {
              Id: 8992,
              Text: "Regions",
              RouterPath: "/salescrmplus/regions",
              Icon: "fa fa-globe",
              ComponentType: "",
              CanActivate: false,
              Value: "Regions"
            },
            {
              Id: 8993,
              Text: "Executives",
              RouterPath: "/salescrmplus/executives",
              Icon: "fa fa-object-group",
              ComponentType: "",
              CanActivate: false,
              Value: "Executives"
            },
            {
              Id: 893293,
              Text: "Executive Expenses",
              RouterPath: "/salescrmplus/executiveExpenses",
              Icon: "fa fa-object-group",
              ComponentType: "",
              CanActivate: false,
              Value: "ExecutiveExpenses"
            },
            {
              Id: 8994,
              Text: "Products",
              RouterPath: "/salescrmplus/products",
              Icon: "fa fa-th-large",
              ComponentType: "",
              CanActivate: false,
              Value: "Products"
            },
            {
              Id: 82994,
              Text: "Product Category Types",
              RouterPath: "/salescrmplus/productCategoryTypes",
              Icon: "fa fa-product-hunt",
              ComponentType: "",
              CanActivate: false,
              Value: "ProductCategoryTypes"
            },
            {
              Id: 8995,
              Text: "Prospect Status",
              RouterPath: "/salescrmplus/prospectStatuses",
              Icon: "fa fa-ravelry",
              ComponentType: "",
              CanActivate: false,
              Value: "ProspectStatuses"
            },
            {
              Id: 8996,
              Text: "Region Budget",
              RouterPath: "/salescrmplus/regionBudget",
              Icon: "fa fa-inr",
              ComponentType: "",
              CanActivate: false,
              Value: "RegionBudget"
            },
            {
              Id: 89956,
              Text: "Executive Relations",
              RouterPath: "/salescrmplus/executiveRelations",
              Icon: "fa fa-user-o",
              ComponentType: "",
              CanActivate: false,
              Value: "ExecutiveRelations"
            },
            {
              Id: 899546,
              Text: "Competitors",
              RouterPath: "/salescrmplus/competitors",
              Icon: "fa fa-users",
              ComponentType: "",
              CanActivate: false,
              Value: "Competitors"
            },
            {
              Id: 89695446,
              Text: "Journal Categories",
              RouterPath: "/salescrmplus/journalCategories",
              Icon: "fa fa-book",
              ComponentType: "",
              CanActivate: false,
              Value: "JournalCategories"
            },
            {
              Id: 48995476,
              Text: "Publish Categories",
              RouterPath: "/salescrmplus/publishCategories",
              Icon: "fa fa-podcast",
              ComponentType: "",
              CanActivate: false,
              Value: "PublishCategories"
            },
            {
              Id: 58995476,
              Text: "Executive Budgets",
              RouterPath: "/salescrmplus/executiveBudgets",
              Icon: "fa fa-money",
              ComponentType: "",
              CanActivate: false,
              Value: "ExecutiveBudgets"
            },
            {
              Id: 18995476,
              Text: "Executive Meetings",
              RouterPath: "/salescrmplus/executiveMeetings",
              Icon: "fa fa-meetup",
              ComponentType: "",
              CanActivate: false,
              Value: "ExecutiveMeetings"
            },
            {
              Id: 18976,
              Text: "Publish Details",
              RouterPath: "/salescrmplus/publishDetails",
              Icon: "fa fa-share-square-o",
              ComponentType: "",
              CanActivate: false,
              Value: "PublishDetails"
            },
            {
              Id: 18325976,
              Text: "Taxes",
              RouterPath: "/salescrmplus/taxes",
              Icon: "fa fa-industry",
              ComponentType: "",
              CanActivate: false,
              Value: "Taxes"
            },
            {
              Id: 185976,
              Text: "User Role Access",
              RouterPath: "/salescrmplus/userRoleAccesses",
              Icon: "fa fa-compass",
              ComponentType: "",
              CanActivate: false,
              Value: "UserRoleAccesses"
            }

          ]
        },
        {
          Id: 401760,
          Text: "Operations",
          RouterPath: "",
          Icon: "fa fa-puzzle-piece",
          ComponentType: "",
          Children: [
            {
              Id: 4011,
              Text: "SalesProspects",
              RouterPath: "/salescrmplus/salesProspects",
              Icon: "fa fa-heartbeat",
              ComponentType: "",
              CanActivate: false,
              Value: "SalesProspects"
            },
            {
              Id: 4012,
              Text: "Journals",
              RouterPath: "/salescrmplus/journals",
              Icon: "fa fa-book",
              ComponentType: "",
              CanActivate: false,
              Value: "Journals"
            },
            {
              Id: 4013,
              Text: "Customers",
              RouterPath: "/salescrmplus/customers",
              Icon: "fa fa-users",
              ComponentType: "",
              CanActivate: false,
              Value: "Customers"
            },
            {
              Id: 40183,
              Text: "Customer Contracts",
              RouterPath: "/salescrmplus/customerContracts",
              Icon: "fa fa-address-card",
              ComponentType: "",
              CanActivate: false,
              Value: "CustomerContracts"
            },
            {
              Id: 4014,
              Text: "Executive Meetings Tracker",
              RouterPath: "/salescrmplus/executiveMeetingsTracker",
              Icon: "fa fa-meetup",
              ComponentType: "",
              CanActivate: false,
              Value: "ExecutiveMeetingsTracker"
            },
            {
              Id: 40514,
              Text: "Prospect Transfer",
              RouterPath: "/salescrmplus/prospectTransfer",
              Icon: "fa fa-money",
              ComponentType: "",
              CanActivate: false,
              Value: "ProspectTransfer"
            },
            {
              Id: 40532114,
              Text: "Product Performances",
              RouterPath: "/salescrmplus/productPerformances",
              Icon: "fa fa-tasks",
              ComponentType: "",
              CanActivate: false,
              Value: "ProductPerformances"
            },

            {
              Id: 4015,
              Text: "Leads",
              RouterPath: "/salescrmplus/leads",
              Icon: "fa fa-user",
              ComponentType: "",
              CanActivate: false,
              Value: "Leads"
            },
            {
              Id: 401955,
              Text: "LeadSource",
              RouterPath: "/salescrmplus/leadSource",
              Icon: "fa fa-tree",
              ComponentType: "",
              CanActivate: false,
              Value: "LeadSource"
            },
            {
              Id: 497355,
              Text: "Leads-Automation-Config",
              RouterPath: "/salescrmplus/leadsAutomationConfigurations",
              Icon: "fa fa-magic",
              ComponentType: "",
              CanActivate: false,
              Value: "LeadsAutomationConfigurations"
            },
            {
              Id: 4966435,
              Text: "Leads-Followup-SMS",
              RouterPath: "/salescrmplus/leadsFollowupForSMSes",
              Icon: "fa fa-commenting-o",
              ComponentType: "",
              CanActivate: false,
              Value: "LeadsFollowupForSMSes"
            },
            {
              Id: 40154,
              Text: "Quotations",
              RouterPath: "/salescrmplus/quotations",
              Icon: "fa fa-quote-left",
              ComponentType: "",
              CanActivate: false,
              Value: "Quotations"
            },
            {
              Id: 401554,
              Text: "Visits",
              RouterPath: "/salescrmplus/visits",
              Icon: "fa fa-location-arrow",
              ComponentType: "",
              CanActivate: false,
              Value: "Visits"
            },

          ],

        },
        {
          Id: 89910,
          Text: "Reports",
          RouterPath: "",
          Icon: "fa fa-flag-checkered",
          ComponentType: "",
          Children: [
            {
              Id: 89911,
              Text: "Sales Prospect Report",
              RouterPath: "/salescrmplus/salesProspectReport",
              Icon: "fa fa-sellsy",
              ComponentType: "",
            },
            {
              Id: 89912,
              Text: "Prospect Status Report",
              RouterPath: "/salescrmplus/prospectStatusReport",
              Icon: "fa fa-flag",
              ComponentType: "",
            },
            {
              Id: 89913,
              Text: "Product Report",
              RouterPath: "/salescrmplus/productReport",
              Icon: "fa fa-braille",
              ComponentType: "",
            },


          ]
        },


      ]
    },


  ],
};