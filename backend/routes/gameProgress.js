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


//update progress like level points etc for a single user
  router.post('/updateProgress', async (req, res) => {
  const { userId, time } = req.body;

  try {
    const progress = await GameProgress.findOne({ gamer: userId });

    if (!progress) {
      return res.status(404).json({ message: 'Game progress not found for this user.' });
    }

    // Update progress fields
    progress.timePlayed += time;
    progress.progress.levelFinished += 1;
    progress.progress.totalPoints += 1000;
    progress.lastlogin = new Date().toISOString();

    await progress.save();
    res.json({ message: 'Progress updated successfully.', progress });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// View progress for a single user
router.get('/viewPlayerProgress/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const progress = await GameProgress.findOne({ gamer: userId }).populate('gamer', 'username');

    if (!progress) {
      return res.status(404).json({ message: 'No progress found for this user.' });
    }

    res.json({
      username: progress.gamer.username,
      levelFinished: progress.progress.levelFinished,
      totalPoints: progress.progress.totalPoints,
      timePlayed: progress.timePlayed
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// View progress for all users
router.get('/viewPlayerProgressAll', async (req, res) => {
  try {
    const allProgress = await GameProgress.find().populate('gamer', 'username');

    const result = allProgress.map(progress => ({
      username: progress.gamer.username,
      levelFinished: progress.progress.levelFinished,
      totalPoints: progress.progress.totalPoints,
      timePlayed: progress.timePlayed
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;