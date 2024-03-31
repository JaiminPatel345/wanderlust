const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');

const port = 3000;
const app = express();

app.use(express.urlencoded( { extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname , 'public')));

app.set("views" , path.join(__dirname , 'views'));
app.set('view engine' , 'ejs');



main()
.then( () => console.log("connection successfully"))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}



app.get('/' , (req , res) => {
    res.send("Home Page");
})

//index route
app.get('/chats' , async (req , res) => {
    let chats =  await Chat.find();
    res.render('index.ejs' , {chats});
});


app.get('/chats/new' , async (req , res) => {
  res.render('new.ejs' );
});

// new chat
app.post('/chats' , async (req , res) => {
  let {from , to , msg} = req.body;
  let newChat = new Chat({
    from : from,
    to : to,
    msg : msg,
    createdAt : new Date()
  });
  newChat.save();
  res.redirect('/chats');
});


//edit chat
app.get('/chats/:id/edit' , async (req , res) => {
  let {id} = req.params;
  let chat = await Chat.findById(id);
  // console.log(chat);
  res.render('edit.ejs' ,{chat});
});

app.put('/chats/:id' , async (req , res) => {
  let {id} = req.params;
  let chat = await Chat.findByIdAndUpdate(id , {msg :req.body.msg} , {new : true} , {runValidator : true});
  
  res.redirect('/chats') ;
});


app.delete('/chats/:id' , async (req , res) => {
  let {id} = req.params;
  await Chat.findByIdAndDelete(id);
  
  res.redirect('/chats') ;
});


app.listen(port , () => console.log(`listen on port ${port}`));
