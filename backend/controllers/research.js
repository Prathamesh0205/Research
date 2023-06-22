require("dotenv").config();
const SerpApi = require('google-search-results-nodejs');
const search = new SerpApi.GoogleSearch(process.env.API_KEY);
const Research=require("../models/Research");
const express=require("express");
const app=express();
const nodemailer = require('nodemailer');
app.use(express.json())



const addUserInterest=async ()=>{

      const find=await Research.find({});

      find.forEach((item) => {
         
         const interest=item.data.interests;
         interest.forEach((element) => {
          
            const intro=item.researchpaper.filter((ele)=>{
               return ele.interest===element
            });
          

            if(!intro.length)
            {
               const callback=async function(data)
                  {
                  let researchpaperdata=await data.organic_results;
                  item.researchpaper.push({interest:element,researchpapercontent:researchpaperdata,start:0});
                 const findoneup=await Research.findOneAndUpdate({email:item.email},{researchpaper:item.researchpaper},{new:true})
                
                  }
                  const params={
                     engine:"google_scholar",
                     q:element,
                     num:10,
                     as_vis:1,
                     start:0
                     }
                 search.json(params,callback)
            }


          });
         
      });
   
}
const deleteUserInterest=async()=>{

   
   const find=await Research.find({});

   find.forEach(async(item) => {
      
      const interest=item.data.interests;
      let arr=[];
      item.researchpaper.forEach((element) => {
       
         const intro=interest.filter((ele)=>{
            return ele===element.interest
         });
       

         if(intro.length)
         {
         
         arr.push(element);
            
         }


       });
        
       await Research.findOneAndUpdate({email:item.email},{researchpaper:arr},{new:true});
      
   });



}



module.exports={addUserInterest,deleteUserInterest};