const express=require ("express")
const router=express.Router()
const {Employee,Department}= require("../models/model")
const auth=require("../middleware/auth")
// Create a new employee
router.post('/register', auth, async (req, res) => {
  try {
    
    const { firstName, lastName, email, departmentId, jobTitle, hireDate, salary } = req.body;

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const employee = new Employee({
      ...req.body,
      userId: req.user.id, 
    });
    // const registeredUser = await Employee.findOne({ userId: req.user.id }).populate('userId', 'name');
    // res.json(registeredUser)
    await employee.save();

    

    
    return res.status(201).json(employee);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const employees = await Employee.find()//.populate('userId departmentId').populate('userId', 'name email');
    return res.status(200).json(employees);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/',auth, async (req,res) => {
    try {
        const {  email, departmentId } = req.body
        const existUser= await Employee.findOne({email})
        if (!existUser)return res.status(404).json({message:"Employee does not exist"})
        const existDpt= await Department.findById(departmentId)
        if (!existDpt) return res.status(404).json({message:"Department does not exist"})
        
        const updatedUser= await Employee.findByIdAndUpdate(
            req.body,
            {firstName,lastName,email,departmentId,jobTitle,hireDate,salary,userId: req.user.id,},
            {new:true}

        )
        await updatedUser.save()
        res.status(201).json({message:"Employee Updated successfully"})
        
        
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
})

router.delete('/',auth,async (req,res )=>{
    try {
        const {email}=req.body
        const deleteEmp= await Employee.findOneAndDelete({email})
        if(!deleteEmp){
            return res.json({message:"Employee does not exist"})
        }
        res.json({message:"Deleted successfully"})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
})





module.exports=router