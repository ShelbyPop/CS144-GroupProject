const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const GameProgress = require('../models/GameProgress');
const router = express.Router();

// GET: View game progress by username
router.get('/viewGameProgress/:username', async (req, res) => {
  const { username } = req.params;
  const redisClient = req.app.locals.redis;
  const cacheKey = `progress:${username}`;

  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    } else {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const progress = await GameProgress.findOne({ gamer: user._id }).populate('gamer', 'username avatarname');
      if (!progress) {
        return res.status(404).json({ error: 'Game Progress Not Found' });
      }

      progress.lastlogin = new Date().toISOString();
      await progress.save();

      await redisClient.set(cacheKey, JSON.stringify(progress));
      return res.json(progress);
    }
  } catch (error) {
    console.error('Error fetching game progress:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST: Set game progress for a user
router.post('/setGameProgress/:username/:timePlayed/:levelfinished/:totalpoints', async (req, res) => {
  const redisClient = req.app.locals.redis;

  try {
    const { username, timePlayed, levelfinished, totalpoints } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingProgress = await GameProgress.findOne({ gamer: user._id });
    if (existingProgress) {
      return res.status(400).json({ error: 'Game Progress already exists for this user' });
    }

    const newProgress = new GameProgress({
      gamer: user._id,
      lastlogin: new Date().toISOString(),
      timePlayed,
      progress: {
        levelFinished: levelfinished,
        totalPoints: totalpoints,
      }
    });

    await newProgress.save();

    // Invalidate user-specific and all-users cache
    await redisClient.del(`progress:${username}`);
    await redisClient.del('progress:all');

    res.status(201).json({ message: 'GameProgress created', progress: newProgress });
  } catch (error) {
    console.error('Error saving game progress:', error);
    res.status(500).json({ error: 'Game Progress error' });
  }
});

// POST: Update game progress

router.post('/updateProgress/:username', async (req, res) => {
  const redisClient = req.app.locals.redis;
  const { username } = req.params;
  const { time } = req.body;

  try {
    // Find the user by username first
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Then find progress by ObjectId
    const progress = await GameProgress.findOne({ gamer: user._id });
    if (!progress) {
      return res.status(404).json({ message: 'Game progress not found for this user.' });
    }

    // Update the progress
    progress.timePlayed += time;
    progress.progress.levelFinished += 1;
    progress.progress.totalPoints += 1000;
    progress.lastlogin = new Date().toISOString();
    await progress.save();

    // Clear cache
    await redisClient.del(`progress:${username}`);
    await redisClient.del('progress:all');

    res.json({ message: 'Progress updated successfully.', progress });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});


// GET: View player progress by userId
// GET: View player progress by username
router.get('/viewPlayerProgress/:username', async (req, res) => {
  const { username } = req.params;
  const redisClient = req.app.locals.redis;
  const cacheKey = `progress:${username}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const progress = await GameProgress.findOne({ gamer: user._id }).populate('gamer', 'username');
    if (!progress) {
      return res.status(404).json({ message: 'No progress found for this user.' });
    }

    const response = {
      username: progress.gamer.username,
      levelFinished: progress.progress.levelFinished,
      totalPoints: progress.progress.totalPoints,
      timePlayed: progress.timePlayed
    };

    await redisClient.set(cacheKey, JSON.stringify(response));
    return res.json(response);
  } catch (error) {
    console.error('Error fetching player progress:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});


// GET: View progress for all users
router.get('/viewPlayerProgressAll', async (req, res) => {
  const redisClient = req.app.locals.redis;
  const cacheKey = 'progress:all';

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const allProgress = await GameProgress.find().populate('gamer', 'username');

    const result = allProgress.map(progress => ({
      username: progress.gamer.username,
      levelFinished: progress.progress.levelFinished,
      totalPoints: progress.progress.totalPoints,
      timePlayed: progress.timePlayed
    }));

    await redisClient.set(cacheKey, JSON.stringify(result));
    return res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
