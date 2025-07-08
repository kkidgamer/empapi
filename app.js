const express=require("express")
const mongoose=require("mongoose")
const app= express()
// we need the dotenv which has our configuration info
require("dotenv").config()
// middleware
app.use(express.json())

// need to make files accessible
app.use('uploads',express.static('uploads'))

// routes
const auth=require('./routes/auth')
app.use('/api/emp',auth)

const user=require('./routes/user')
app.use('/api/user',user)

const departments=require('./routes/department')
app.use('/api/departments',departments)

const employee=require('./routes/emp')
app.use('/api/employee',employee)

// Connecting to mongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(()=>console.log("MongoDB connected"))
    .catch(err=>console.log("MongoDB Connection error",err))

// Server listener
app.listen(3000,()=>{
    console.log("Server running on port 3000")
})