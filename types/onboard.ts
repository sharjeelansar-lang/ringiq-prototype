export type S1 = {
  practiceName: string;
  contactName:  string;
  email:        string;
  phone:        string;
  officeLine2:  string;
  officeLine3:  string;
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
  saturdayOpen:      string;
  saturdayClose:     string;
  saturdayClosed:    boolean;
  sundayClosed:      boolean;
  lunchBreak:        string;
  afterHoursPolicy:  string;
};

export type S4 = {
  voice:     string;
  interests: string[];
  notes:     string;
};
