require("dotenv").config()
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy =  require('passport-google-oauth2');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB=require("./db/connect");
const USER = require("./models/Research");
const cron = require('node-cron');
const {getAllUsers}=require("./controllers/schedule");
const {addUserInterest,deleteUserInterest}=require("./controllers/research");
const path = require('path');


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'build')));


app.use(session({
    secret:"THIS",
    resave:false,
    saveUninitialized: false
}));



app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user,done){
    done(null,user);
});

passport.deserializeUser(function(user,done){
    done(null,user);
});
let user;
passport.use(new GoogleStrategy ({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "/auth/google/recommend",
    },
    function(request,accessToken,refreshToken,profile,done){
        console.log(profile);
        user = profile;
        return done(null, profile);
    }
))

const date=new Date()

setInterval(()=>{
cron.schedule(`55 8 * * ${date.getDay()}`,()=>{
   
    deleteUserInterest();
    addUserInterest();
    setTimeout(()=>{
        getAllUsers()
    },60000)})},60000)
   



app.get("/",(req,res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get("/login",(req,res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get("/home",(req,res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get("/user",(req,res) => {
    res.json({user});
});
app.get("/data/:email",(req,res) => {
    const email = req.params.email;
    // console.log(email);
    const edit = async () => {
        const u = await USER.find({email:email}).exec();
        if(u.length != 0){
            // console.log(u[0].data);
            res.send(u[0].data);
        }
        else{
            res.send({interests:[],day:0});
        }

        
    }
    edit();
    // const user = new USER({
        // name:req.body.name,
        // email:req.body.email,
        // parameters:[],
        // researchpaper:[],
        // day:req.body.day,
        // data:req.body
    // });
    // console.log(USER.db.collections.users.collection);
    // res.send(USER.collection());

})
app.post("/data",(req,res) => {
    console.log(req.body);
    const user = new USER({
        name:req.body.name,
        email:req.body.email,
        parameters:[],
        researchpaper:[],
        day:req.body.day,
        data:req.body    
    });

    const edit = async () => {
        const u = await USER.findOneAndUpdate({email:req.body.email},{data:req.body});
        // console.log(u);
    }
    
    const obj = async () => { 
        const o = await USER.find({email:req.body.email}).exec();
        if(o.length == 0)
            user.save();
        else{
            // console.log(o[0].data);
            edit();
        }
    }
    // const u = obj();
    obj();
    // console.log(u);
        // user.save();
    
    // console.log(obj)
        // console.log("Found User");
})

app.get("/auth/google",
  passport.authenticate("google",{scope: ["profile","email"]})
);

app.get("/auth/google/recommend",
    passport.authenticate("google"),
    (req,res) => {
        if(req.isAuthenticated()){
            console.log(user);
            res.redirect('/home');
        }
        else
            res.redirect('/login');
    }
);

app.get("/logout",(req,res) => {
    req.logout(function(err){
        if(err)
            console.log(err);
        else{
            res.redirect('/login');
        }
    });
})

async function connectserver()
{
   try {
        await connectDB(process.env.MONGO_URI);
        app.listen(5000, () => {
            console.log("Server started at port 5000");
        });     
   } catch (error) {
       console.log(error)
       console.log("could not connect to database please try again")
   }
}
connectserver();
