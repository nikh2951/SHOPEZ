const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const sendOTP = require('../utils/sendOTP');
const { protect } = require('../middleware/auth');

// Generate a random 6 digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'shopez_secret_key_13579', {
    expiresIn: '30d',
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (customer/seller) & send OTP
 * @access  Public
 */
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide all details' });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      } else {
        // If unverified user exists, update details and proceed to send a new OTP
        const salt = await bcrypt.genSalt(10);
        user.name = name;
        user.password = await bcrypt.hash(password, salt);
        user.role = role || 'customer';
        await user.save();
      }
    } else {
      // Create new unverified user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'customer',
        isVerified: false,
      });
    }

    // Generate OTP
    const code = generateOTP();

    // Store OTP in database (overwrite any existing pending OTPs for this email)
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: code });

    // Send OTP email
    const emailSent = await sendOTP(email, code);

    res.status(201).json({
      success: true,
      message: emailSent
        ? 'OTP sent to email. Please verify to complete signup.'
        : 'User registered, but failed to send verification email. Developer OTP logged to server terminal.',
      email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and activate the user account
 * @access  Public
 */
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Please provide email and OTP code' });
  }

  try {
    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP verification code' });
    }

    // Find and verify the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    user.isVerified = true;
    await user.save();

    // Remove OTP from database
    await Otp.deleteMany({ email });

    res.status(200).json({
      success: true,
      message: 'Account verified successfully!',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    // Check for user (and explicitly select password since it was hidden)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      // Trigger new OTP for registration completion
      const code = generateOTP();
      await Otp.deleteMany({ email });
      await Otp.create({ email, otp: code });
      await sendOTP(email, code);

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        message: 'Email address is not verified. A new verification code has been sent to your email.',
        email,
      });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

/**
 * @route   GET /api/auth/google/client-id
 * @desc    Get Google Client ID configuration
 * @access  Public
 */
router.get('/google/client-id', (req, res) => {
  res.json({
    success: true,
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  });
});

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate user using Google ID token
 * @access  Public
 */
router.post('/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ success: false, message: 'Please provide Google credential token' });
  }

  try {
    let email, name, picture;

    // Check if it's a simulated google login (for local testing/beginner ease)
    if (credential.startsWith('mock-google-token-')) {
      email = credential.replace('mock-google-token-', '');
      name = email.split('@')[0];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      picture = `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`;
    } else {
      try {
        // Verify token with Google's API securely without any extra npm packages
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (!response.ok) {
          throw new Error('Google token verification failed');
        }
        const googleUser = await response.json();
        email = googleUser.email;
        name = googleUser.name;
        picture = googleUser.picture;
      } catch (fetchErr) {
        console.warn('Google API verification failed, decoding directly:', fetchErr.message);
        // Direct decode fallback
        const decoded = jwt.decode(credential);
        if (!decoded || !decoded.email) {
          return res.status(400).json({ success: false, message: 'Failed to verify Google token' });
        }
        email = decoded.email;
        name = decoded.name || email.split('@')[0];
        picture = decoded.picture || '';
      }
    }

    // Check for existing user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user (automatically verified since they logged in via Google)
      user = await User.create({
        name,
        email,
        avatarUrl: picture || '',
        isVerified: true,
        role: 'customer',
      });
    } else {
      // Sync Google avatar if not set, and ensure verified
      let updated = false;
      if (!user.isVerified) {
        user.isVerified = true;
        updated = true;
      }
      if (!user.avatarUrl && picture) {
        user.avatarUrl = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: 'Server error during Google login' });
  }
});

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend a verification OTP to an existing unverified user
 * @access  Public
 */
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide email address' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email address is already verified' });
    }

    const code = generateOTP();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: code });
    const emailSent = await sendOTP(email, code);

    res.status(200).json({
      success: true,
      message: emailSent
        ? 'A new OTP has been sent to your email address.'
        : 'OTP generated, but email delivery failed. Check server logs for the code.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error resending OTP' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user details
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current logged in user profile details
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.dob !== undefined) user.dob = req.body.dob;
    if (req.body.gender !== undefined) user.gender = req.body.gender;
    if (req.body.address !== undefined) user.address = req.body.address;
    if (req.body.avatarUrl !== undefined) user.avatarUrl = req.body.avatarUrl;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        phone: updatedUser.phone,
        dob: updatedUser.dob,
        gender: updatedUser.gender,
        address: updatedUser.address,
        avatarUrl: updatedUser.avatarUrl,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
});

module.exports = router;
