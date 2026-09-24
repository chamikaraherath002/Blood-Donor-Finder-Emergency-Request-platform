// Blood group compatibility rules for donor searching
// The values are donor blood groups that can match the requested blood group

const bloodCompatibility = {
  "O+": ["O+", "O-"],
  "O-": ["O-"],

  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],

  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],

  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],

  "AB-": ["A-", "B-", "AB-", "O-"],
};

export default bloodCompatibility;
