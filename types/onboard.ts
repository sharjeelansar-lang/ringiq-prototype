export type S1 = {
  practiceName: string;
  contactName:  string;
  email:        string;
  phone:        string;
  website:      string;
  ehrSystem:    string;
  officeLine2:  string;
};

export type S2 = {
  streetAddress:     string;
  city:              string;
  state:             string;
  zipCode:           string;
  timezone:          string;
  monthlyCallVolume: string;
  phoneProvider:     string;
  currentPhoneSetup: string;
};

export type S3 = {
  officeGreeting:    string;
  locationNote:      string;
  mondayFridayOpen:  string;
  mondayFridayClose: string;
  mondayOpen:        string;
  mondayClose:       string;
  mondayClosed:      boolean;
  tuesdayOpen:       string;
  tuesdayClose:      string;
  tuesdayClosed:     boolean;
  wednesdayOpen:     string;
  wednesdayClose:    string;
  wednesdayClosed:   boolean;
  thursdayOpen:      string;
  thursdayClose:     string;
  thursdayClosed:    boolean;
  fridayOpen:        string;
  fridayClose:       string;
  fridayClosed:      boolean;
  saturdayOpen:      string;
  saturdayClose:     string;
  saturdayClosed:    boolean;
  sundayOpen:        string;
  sundayClose:       string;
  sundayClosed:      boolean;
  lunchBreak:        string;
  afterHoursPolicy:  string;
  currentAfterHoursPolicy: string;
  ringiqAfterHoursPolicy:  string;
};

export type S4 = {
  voice:     string;
  interests: string[];
  notes:     string;
};
