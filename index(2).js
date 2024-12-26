const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { User, Exercise } = require('./mongoose')
//const Exercise = require('./mongoose')

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//date format 
const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};



app.post('/api/users', async (req, res) => {
  console.log('Request body', req.body)
 const userInput = req.body.username;
 console.log('recieved username', userInput);

 //add new user or return existing user name and _id
 try{
 const existingUser = await User.findOne({username : userInput});
 if (existingUser) {
    console.log('user exist', existingUser);
  return res.json({username : existingUser.username, _id : existingUser._id});
 }else {
  const newUser = await User.create({username : userInput});
  console.log('new user created', newUser);
  return res.json({ username : newUser.username, _id : newUser._id});
 };
 }
 catch(err) {
  console.log('error saving user', err)
  res.status(500).json({error : 'failed username'})
 }
})

app.get('/api/users', async (req, res) => {
  const allUsers = await User.find({}, 'username _id');
  try 
  {
   res.send(allUsers)
   console.log('all users response', allUsers)
  }
  catch(err) {
    res.status(500).json({error : 'server error'})
  }
})

//Add a new exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  const useridInput = req.params._id;
  console.log('User ID input:', useridInput);
  const existingUsername = await User.findById(useridInput)
  console.log(existingUsername)
  const description = req.body.description;
  const duration = req.body.duration;
  const date = req.body.date
  
  try {
  if (existingUsername) {
    //console.log('user exist', existingUsername);
    const exercise = await Exercise.create({
                           userId: useridInput,
                           description,
                           duration: parseInt(duration),
                          date: date ? new Date(date) : Date.now()
                           })

   console.log('exercise added', exercise);
   return res.json(
    {
 username: existingUsername.username,
 description: exercise.description,
 duration: exercise.duration,
 date: formatDate(exercise.date ? new Date(exercise.date) : new Date()),
 _id: existingUsername.id
   })
   
   console.log('response', res);
   }  else {
    console.log('error could not find user');
    return res.status(404).json({ error : ' could not find user'})
    }                  
   }

catch(err) {
  console.log('error', err)
  return res.status(500).json({error : 'server error'})
}
})
// get logs with params and return
app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params
  const { from, to, limit } = req.query;


  try 
  {
    const user = await User.findById(_id);
    if (!user) {
      console.log('cant find user', user);
      return res.status(404).json({ error : 'user does not exist'})
    }

    const query = {userId : _id}

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

const exercises = await Exercise.find(query).limit(parseInt(limit) || 0);

    const log = exercises.map((exercise) => ({
      description: exercise.description,
      duration: exercise.duration,
      date: new Date(exercise.date).toDateString()
    }))

    console.log(log)

    res.json({
      username: user.username,
      _id: user._id,
      count: log.length,
      log
    })
  }
  catch(err) {
    console.log('error', err)
    res.status(500).json({ error : 'server error'})
  }
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
