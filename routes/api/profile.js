const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load  models
const Profile = require("../../models/Profile");
const User = require("../../models/User");

//Load Validators
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Profile Works" }));

// @route   GET api/profile
// @desc    Get current users profile
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => {
        return res.status(404).json(err);
      });
  }
);

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public
router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for that user";
        return res.status(400).json(errors);
      }
      res.json(profile);
    })
    .catch(err => {
      return res.status(404).json(err);
    });
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public
router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for that user";
        return res.status(400).json(errors);
      }
      res.json(profile);
    })
    .catch(err => {
      errors.noprofile = "There is no profile for this user";
      console.log(err);
      return res.status(404).json({ errors });
    });
});

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile =
          "There are no profiles in the database or can't fetch them";
        return res.status(400).json(errors);
      }
      return res.json(profiles);
    })
    .catch(err => {
      errors.noprofile = "Can't find profiles";
      console.log(err);
      return res.json(errors);
    });
});

// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Validate input
    const { errors, isValid } = validateProfileInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    //  Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    //  Skills - split into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }
    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    //  Keeping it DRY

    // const {
    //   skills,
    //   youtube,
    //   twitter,
    //   facebook,
    //   linkedin,
    //   instagram
    // } = req.body;
    // const profileFields = {
    //   ...req.body,
    //   user: req.user.id,
    //   skills: skills.split(","),
    //   social: { youtube, twitter, facebook, linkedin, instagram }
    // };

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create
        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            return res.status(400).json(errors);
          }
          // Save Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private

router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Get the fields
    const experience = {
      ...req.body
    };

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.noprofile =
            "User has no profile/ can't find profile with that ID";
          return res.status(400).json(errors);
        }
        profile.experience.push(experience);
        profile.save().then(profile => {
          return res.json(profile);
        });
      })
      .catch(err => {
        console.log(err);
        errors.noprofile = "Error finding profile with that user id";
        return res.status(400).json(errors);
      });
  }
);

// @route   POST api/profile/education
// @desc    Add education to profile
// @access  Private

router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Get the fields
    const education = {
      ...req.body
    };

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.noprofile =
            "User has no profile/ can't find profile with that ID";
          return res.status(400).json(errors);
        }
        profile.education.push(education);
        profile.save().then(profile => {
          return res.json(profile);
        });
      })
      .catch(err => {
        console.log(err);
        errors.noprofile = "Error finding profile with that user id";
        return res.status(400).json(errors);
      });
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete specific experience by ID
// @access  Private

router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.noprofile =
            "User has no profile/ can't find profile with that ID";
          return res.status(400).json(errors);
        }
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);
        errors.rindex = removeIndex;
        if (Number.isInteger(removeIndex)) {
          profile.experience.splice(removeIndex, 1);
          profile.save().then(profile => {
            return res.json(profile);
          });
        } else {
          errors.experience = "No such experience found at that ID";
          return res.status(400).json(errors);
        }
      })
      .catch(err => {
        console.log(err);
        errors.noprofile = "Error finding profile with that user id";
        return res.status(400).json(errors);
      });
  }
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education by ID
// @access  Private

router.post(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.noprofile =
            "User has no profile/ can't find profile with that ID";
          return res.status(400).json(errors);
        }
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);
        errors.rindex = removeIndex;
        if (Number.isInteger(removeIndex)) {
          profile.education.splice(removeIndex, 1);
          profile.save().then(profile => {
            return res.json(profile);
          });
        } else {
          errors.education = "No such education found at that ID";
          return res.status(400).json(errors);
        }
      })
      .catch(err => {
        console.log(err);
        errors.noprofile = "Error finding profile with that user id";
        return res.status(400).json(errors);
      });
  }
);

module.exports = router;
