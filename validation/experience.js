const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateExperienceInput(data) {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : "";
  data.company = !isEmpty(data.company) ? data.company : "";
  data.location = !isEmpty(data.location) ? data.location : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  if (Validator.isEmpty(data.title)) {
    errors.title = "Title field is required";
  }

  if (Validator.isEmpty(data.company)) {
    errors.company = "Company field is required";
  }

  if (Validator.isEmpty(data.location)) {
    errors.location = "Location field is required";
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
