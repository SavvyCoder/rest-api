const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load models
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

// Load Validation
const validatePostInput = require("../../validation/post");
const validateCommentInput = require("../../validation/comment");

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Posts Works" }));

// @route   GET api/posts
// @desc    Get Posts
// @access  Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => {
      res.json(posts);
    })
    .catch(err => res.status(404).json(err));
});

// @route   GET api/posts/:id
// @desc    Get single post
// @access  Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      res.json(post);
    })
    .catch(err => res.status(404).json(err));
});

// @route   Delete api/posts/:id
// @desc    Delete Post by id
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Post.findById(req.params.id)
      .then(post => {
        if (post.user.toString() !== req.user.id) {
          errors.deletePost = "User is not authorized to delete this post";
          return res.status(401).json(errors);
        }
        post.remove().then(() => res.json({ success: true }));
      })
      .catch(err => {
        errors.post = "No post found";
        console.log(err);
        return res.status(400).json(errors);
      });
  }
);

// @route   POST api/posts
// @desc    Create Posts
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      res.status(400).json(errors);
    }
    const newPost = new Post({
      user: req.user.id,
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar
    });
    newPost
      .save()
      .then(post => {
        res.json(post);
      })
      .catch(err => {
        errors.newPost = "Post was unable to save";
        console.log(err);
        res.status(400).json(errors);
      });
  }
);

// @route   POST api/posts/like/:id
// @desc    Like Post
// @access  Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length > 0
        ) {
          errors.alreadyLiked = "User already like this post";
          return res.status(400).json(errors);
        }

        // Add user id to post like array
        post.likes.push({ user: req.user.id });
        post.save.then(post => {
          res.json(post);
        });
      })
      .catch(err => {
        errors.post = "No post found";
        console.log(err);
        return res.status(400).json(errors);
      });
  }
);

// @route   POST api/posts/unlike/:id
// @desc    Unlike Post
// @access  Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length == 0
        ) {
          errors.notLiked = "You have not yet liked this post";
          return res.status(400).json(errors);
        }

        // Get remove index
        const removeIndex = post.likes
          .map(item => item.user.toString())
          .indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        post.save().then(post => {
          res.json(post);
        });
      })
      .catch(err => {
        errors.post = "No post found";
        console.log(err);
        return res.status(400).json(errors);
      });
  }
);

// @route   POST api/posts/comment/:id
// @desc    Comment on Post
// @access  Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateCommentInput(req.body);
    if (!isValid) {
      res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          user: req.user.id,
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar
        };
        post.comments.push(newComment);
        post.save().then(post => {
          res.json(post);
        });
      })
      .catch(err => {
        errors.postComment = "Unable to find post to comment on";
        console.log(err);
        res.status(400).json(errors);
      });
  }
);

// @route   Delete api/posts/comment/:id/:comment_id
// @desc    Delete a comment on a Post
// @access  Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          errors.noComment = "No such comment exists";
          return res.status(400).json(errors);
        }
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);
        // Check if comment owner
        if (req.user.id !== post.comments[removeIndex].user.toString()) {
          errors.notAuthorized =
            "User is not authorized to delete this comment";
          return res.json(errors);
        }
        post.comments.splice(removeIndex, 1);
        post.save().then(post => {
          res.json(post);
        });
      })
      .catch(err => {
        errors.postComment = "Unable to find post";
        console.log(err);
        res.status(400).json(errors);
      });
  }
);

module.exports = router;
