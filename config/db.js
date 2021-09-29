const mongoose = require('mongoose')
exports.connectToMongoDB = async ()=> {
  try {
    await mongoose.connect("mongodb+srv://mohd_suhail:mohdsuhail786@cluster0.6icau.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",{
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("Connected to MongoDB...")
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }
}