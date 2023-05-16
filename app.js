//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
require('dotenv').config();
const PORT = process.env.PORT;

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

//store id for temporary //
let passingId;
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//require mongoose //
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI);

const postSchema = new mongoose.Schema({
  title:String,
  content: String
});

const Post = mongoose.model('Post', postSchema);





app.post("/", function (req, res) {
  const compose = req.body.compose;
  console.log(compose);
  res.redirect("/compose");
});

app.get("/", function(req, res){
  // res.render("home", {
  //   startingContent: homeStartingContent,
  //   posts: Post
  //   });

  Post.find().then( function (foundPosts) {
    res.render("home", {startingContent: homeStartingContent, posts: foundPosts});
    //console.log(foundPosts);
  });
});

app.post("/posts/:postName", function(req, res){
  const requestedTitle = _.lowerCase(req.params.postName);
  const editId = req.body.edit;
  const removeId = req.body.delete;
  if(editId) {
    console.log(editId);
    passingId = editId;
    res.redirect("/edit/"+ requestedTitle);
    
  } else if(removeId){
    Post.findByIdAndRemove(removeId).then( function (){
      console.log("remove completed successfully");
      res.redirect("/");
    });
  }
});
// edit section //

app.post("/edit/:postName", function(req, res){
  const requestedTitle = _.lowerCase(req.params.postName);

  Post.findByIdAndUpdate({_id: passingId},{
    title: req.body.postTitle,
    content: req.body.postBody
  }).then( function () {
    console.log("Updated");
  });
  res.redirect("/");
});

app.get("/edit/:postName", function(req, res){
  const requestedTitle = _.lowerCase(req.params.postName);
  Post.findOne({_id: passingId}).then( function(foundPost) {
    
    res.render("edit",{title: foundPost.title, content: foundPost.content,});
    passingId = foundPost._id;
  });
});


app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const newPost = new Post({
    title: _.lowerCase(req.body.postTitle),
    content: req.body.postBody,
  });

  newPost.save();
  res.redirect("/");

});


app.get("/posts/:postName", function(req, res){
  // const requestedTitle = _.lowerCase(req.params.postName);

  // posts.forEach(function(post){
  //   const storedTitle = _.lowerCase(post.title);

  //   if (storedTitle === requestedTitle) {
  //     res.render("post", {
  //       title: post.title,
  //       content: post.content
  //     });
  //   }
  // });
  const requestedTitle = _.lowerCase(req.params.postName);
  Post.findOne({title: requestedTitle}).then( function (foundPost) {
    res.render("post", {title:  foundPost.title, content: foundPost.content, postId: foundPost._id});
  });

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
