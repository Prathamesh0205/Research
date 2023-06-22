
require("dotenv").config();
const SerpApi = require('google-search-results-nodejs');
const search = new SerpApi.GoogleSearch(process.env.API_KEY);
const Research=require("../models/Research");
const express=require("express");
const app=express();
const nodemailer = require('nodemailer');
const date=new Date();


let getAllUsers=async()=>{

    let UserDB=await Research.find({});
 
    for(let i in UserDB)
    {
        if(UserDB[i].data.day===date.getDay())
        {
       
        let tosendarr=[];
      
       
       for(let j in UserDB[i].researchpaper)
       {
      let quantity=UserDB[i].researchpaper[j].researchpapercontent;
    
      if(quantity.length===0)
      {
       
        
         let params1=UserDB[i]["researchpaper"][j].start;
       

         params1=params1+10;
         
         const params={
          engine:"google_scholar",
          q:UserDB[i]["researchpaper"][j].interest+'Research Paper',
          num:10,
          as_vis:1,
          start:params1
         }
         
       
         const callback=async(data)=>{
            quantity= data.organic_results;
            const resq=UserDB[i].researchpaper;
            tosendarr.push(quantity.pop())
            resq[j].researchpapercontent=quantity;
            resq[j].start=params.start;
            const findup=await Research.findOneAndUpdate({email:UserDB[i].email},{researchpaper:resq},{new:true})
         }
    
          search.json(params,callback)
      
   
    }else
    {
    const rest=async()=>{
       const resq=UserDB[i].researchpaper;
      const tosend=quantity.pop();
      resq[j].researchpapercontent=quantity;
      const findup=await Research.findOneAndUpdate({email:UserDB[i].email},{researchpaper:resq},{new:true})
         tosendarr.push(tosend);
     }
     await rest();
    }
 
    
 }
 
 let titl=[];
 let li=[];
 for(let i=0;i<tosendarr.length;i++)
 {
   titl.push(tosendarr[i].title)
   li.push(tosendarr[i].link)
 }
 let message=
 `<h3>
 <b>Hey ${UserDB[i].name},</b>
 </h3>
 <br>
 <div>
 <p>     
 Thanks for waiting for this week's Research Paper related to your Interests.
 So here is Today's Research Paper with the given Title and it's Link attached below it. 
 </p>
 </div><br>`
 
 // let htmlp=tosendarr.map((ele)=>replaceTemplate(ele,d)).join('')
 // message=message+htmlp;
 
 for(let i=0;i<titl.length;i++)
 {
   var x=
   `<div>
   <h3>Title: ${titl[i]}</h4>
   <h3>Link: <a href=${li[i]}>Research Paper</a></h4>
   </div><br>`
   
   message=message+x;
 }

 let fina=
 `<p>
 The Research Scholar Team hopes that you liked today's Research Paper and help's you in your Research.Please remain Subscribed to our website
 for the next week's Research Paper.<br><br>
 </p>
 <h3>
 <b>Thank You</b><br>
 <t>Team Research Scholar
 </h3>`
 
 message=message+fina;


 const final=async()=>{
 
   console.log(tosendarr.length)
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user:process.env.AUTH_EMAIL,
        pass:process.env.AUTH_PASS
      }
    });
    
    var mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: UserDB[i].email,
      subject: titl[0],
      html: message
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
 
     }
 
 
   setTimeout(()=>{
  final()
   },60000)
}
 
 }
 console.log("successfully send mail")
 }


 module.exports={getAllUsers};