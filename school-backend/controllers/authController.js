const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const studentRepository = require("../repositories/studentRepository");
const teacherRepository = require("../repositories/teacherRepository");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body; // email could be username or email
    const user = await userRepository.findByEmailOrUsername(email);

    if (!user) {
      return res.status(404).json("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json("Invalid credentials");
    }

    const jwtConfig = require("../config/jwt");
    const token = jwt.sign(
      { user_id: user._id, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.json({
      message: "Login successful ✅",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentProfile: user.studentProfile,
        teacherProfile: user.teacherProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

const registerStudent = async (req, res, next) => {
  try {
    const { name, email, username, password, studentProfileId } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (dbStatus.isMongoConnected) {
      const userExists = await User.findOne({
        $or: [
          { email: email.toLowerCase() },
          { username }
        ]
      });
      if (userExists) {
        return res.status(400).json("User already exists with this email or username");
      }

      const newStudentUser = new User({
        name,
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
        role: "student",
        studentProfile: studentProfileId
      });
      await newStudentUser.save();
      res.json({ message: "Student account created successfully ✅", user: newStudentUser });
    } else {
      const userExists = inMemoryStore.users.find(
        u => u.email.toLowerCase() === email.toLowerCase() || u.username === username
      );
      if (userExists) {
        return res.status(400).json("User already exists with this email or username");
      }

      const newStudentUser = {
        _id: "mem-u-" + Date.now(),
        name,
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
        role: "student",
        studentProfile: studentProfileId
      };
      inMemoryStore.users.push(newStudentUser);
      res.json({ message: "Student account created successfully ✅", user: newStudentUser });
    }
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    if (!req.userRecord) {
      return res.status(404).json("User not found");
    }

    const user = req.userRecord;
    let populatedUser = user.toObject ? user.toObject() : { ...user };

    if (user.role === "student" && user.studentProfile) {
      const student = await studentRepository.findById(user.studentProfile);
      populatedUser.studentProfile = student;
    } else if (user.role === "teacher" && user.teacherProfile) {
      const teacher = await teacherRepository.findById(user.teacherProfile);
      populatedUser.teacherProfile = teacher;
    }

    res.json(populatedUser);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  registerStudent,
  getMe
};
