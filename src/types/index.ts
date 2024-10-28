export interface Staff {
  Object: string;
  Id: number;
  FirstName: string;
  LastName: string;
  State: string;
}

export interface Schedule {
  TimePeriod: {
    StartTime: string;
    EndTime: string;
    StartDate: string;
    EndDate: string | null;
    NumberOfOccurence: number | null;
    RecurrenceEndDate: string | null;
    TimeZone: string;
    TimePeriodType: string;
    Days: string[];
    RecurrenceUnitType: string | null;
    MonthType: string | null;
  };
  Staff: Staff[];
  Locations: {
    Id: number;
    Name: string;
  }[];
}

export interface Activity {
  Name: string;
  StartDate: string;
  EndDate: string;
  ScheduleSummary: string;
  Url: string;
  Schedules: Schedule[];
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface ActivityOccurrence extends Activity {
  date: Date;
  timeRange: TimeRange;
}

export interface AmiliaResponse {
  Items: Activity[];
  Paging: {
    TotalCount: number;
    Next: string;
  };
}