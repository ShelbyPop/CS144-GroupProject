const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });

//curl -X GET http://localhost:3000/api/auth/viewavatarname/testuser1  should get back Dragaonball
router.get('/viewavatarname/:username', async (req, res) => {
   const { username } = req.params;
   try{
    const player = await User.findOne({ username: username });
     if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.send(player.avatarname);
   }catch(error){
    console.error('Error fetching avatar name:', error);
   res.status(500).json({ error: 'Server error' });
   }

});

/*curl -X POST http://localhost:3000/api/auth/assignavatarname/testuser1/Dragaonball*/
router.post('/assignavatarname/:username/:avatarname', async (req, res) => {
  const {username,avatarname}= req.params;
  try{
    const player = await User.findOne({ username:username });
    if (!player){
      return res.status(404).json({error:"User Not Found"});
    }
    player.avatarname= avatarname;
    await player.save();
    res.status(200).json({ message: 'Avatar Name Assigned' });
  }catch(error){
    console.error('Error assigning avatar name:', error);
   res.status(500).json({ error: 'Server error' });
  }

});

router.post('/signup', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const existing = await User.findOne({ username  });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = await User.create({ username, password, email });

    const token = createToken(newUser._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000,
    });

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
     console.error('Signup error:', err); 
    res.status(500).json({ error: 'Something went wrong during signup' });
  }
});



router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = createToken(user._id);

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'Strict',
    maxAge: 60 * 60 * 1000,
  });

  res.status(200).json({ message: 'Logged in' });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out' });
});





module.exports = router;
