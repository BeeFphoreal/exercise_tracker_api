const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("connected to mogoDB"))
.catch((err) => console.error("error connecting to mongoDB", err));


const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true},
      Exercise: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise'} ] 
})

const exerciseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true },
    description: {type: String, required: true,},
    duration:  {type: Number, required: true},
    date: {type: Date, default: Date.now} 
})

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = { User, Exercise } 