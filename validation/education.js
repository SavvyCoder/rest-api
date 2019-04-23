const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateEducationInput(data) {
  let errors = {};

  data.school = !isEmpty(data.school) ? data.school : "";
  data.degree = !isEmpty(data.degree) ? data.degree : "";
  data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  if (Validator.isEmpty(data.school)) {
    errors.school = "School field is required";
  }

  if (Validator.isEmpty(data.degree)) {
    errors.degree = "Degree field is required";
  }

  if (Validator.isEmpty(data.fieldofstudy)) {
    errors.fieldofstudy = "Field of study is required";
  }

  if (!Validator.toDate(data.from)) {
    errors.from = "Not a valid date";
  }

  if (Validator.isEmpty(data.from)) {
    errors.from = "From field is required";
  }

  if (!isEmpty(data.to)) {
    if (!Validator.toDate(data.to)) {
      errors.to = "Not a valid date";
    }
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
