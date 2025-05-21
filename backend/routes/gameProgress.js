const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const GameProgress = require('../models/GameProgress');
const router = express.Router();

/*curl -X GET http://localhost:3000/api/gameProgress/viewGameProgress/testuser1 */
router.get('/viewGameProgress/:username', async(req,res)=>{
  try{
  const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

  const progress = await GameProgress.findOne({ gamer: user._id }).populate('gamer','username avatarname');

  if (!progress){
     return res.status(404).json({ error: 'Game Progress Not Found' });
  }
  progress.lastlogin = new Date().toISOString();
  await progress.save();

  res.json(progress);
  }catch(error){
     console.error('Error fetching gamer progress:', error);
   res.status(500).json({ error: 'Server error' });
  }});




/**curl -X POST http://localhost:3000/api/gameProgress/setGameProgress/testuser1/0.5/0/0/ */

  router.post('/setGameProgress/:username/:timePlayed/:levelfinished/:totalpoints', async (req,res)=>{
  try{
     const { username,timePlayed,levelfinished,totalpoints } = req.params;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

    const existingProgress = await GameProgress.findOne({ gamer: user._id });
    if (existingProgress) {
      return res.status(400).json({ error: 'Game Progress already exists for this user' });
    }

  const newProgress = new GameProgress(
    {
     gamer: user._id,
      lastlogin : new Date().toISOString(),
      timePlayed:timePlayed,
       progress: {
  levelFinished:levelfinished,
  totalPoints:totalpoints,
  }

    }
  );
  await newProgress.save()
  
  res.status(201).json({ message: 'GameProgress created', progress: newProgress });

} catch(error){
   console.error('Error saving gamer progress:', error);
   res.status(500).json({ error: 'Game Progress error' });
}
  });


module.exports = router;