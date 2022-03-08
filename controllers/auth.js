const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const cryto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../models/userModels');
const Helpers = require('../Helpers/helpers');
const dbConfig = process.env.SECRET;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passwordresetToken = require('../models/resetTokenModel');

module.exports = {
  // create user
  async createUser(req, res) {
    const schema = Joi.object().keys({
      username: Joi.string().min(5).max(10).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(5).required(),
    });

    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    const userEmail = await User.findOne({
      email: Helpers.lowerCase(req.body.email),
    });
    if (userEmail) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({ mesage: 'Email already exist' });
    }

    const userName = await User.findOne({
      username: Helpers.firstUpper(req.body.username),
    });
    if (userName) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({ message: 'Username already exist' });
    }

    return bcrypt.hash(value.password, 10, (err, hash) => {
      if (err) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Username already exist' });
      }
      const body = {
        username: Helpers.firstUpper(value.username),
        email: Helpers.lowerCase(value.email),
        password: hash,
      };
      User.create(body)
        .then((user) => {
          const token = jwt.sign({ user }, dbConfig.secret, {
            expiresIn: '5h',
          });
          res.cookie('auth', token);
          res
            .status(HttpStatus.CREATED)
            .json({ message: 'User created successfully', user, token });
        })
        .catch((err) => {
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: 'Error occured' });
        });
    });
  },

  async loginUser(req, res) {
    if (!req.body.username || !req.body.password) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ mesage: 'No empty fields allowed' });
    }

    await User.findOne({ username: Helpers.firstUpper(req.body.username) })
      .then((user) => {
        if (!user) {
          return res
            .status(HttpStatus.NOT_FOUND)
            .json({ message: 'Username not found' });
        }
        return bcrypt
          .compare(req.body.password, user.password)
          .then((result) => {
            if (!result) {
              return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Password is incorrect' });
            }

            const token = jwt.sign({ data: user }, dbConfig.secret, {
              expiresIn: '5h',
            });
            res.cookie('auth', token);
            return res
              .status(HttpStatus.OK)
              .json({ message: 'Login successful', user, token });
          });
      })
      .catch((err) => {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error occured' });
      });
  },

  async ResetPassword(req, res) {
    if (!req.body.email) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Email is required' });
    }
    await User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Email not found' });
      }

      // if (!user) {
      //   return res
      //     .status(HttpStatus.NOT_FOUND)
      //     .json({ message: 'Email not found' });
      // }

      // if (user) {
      //   return res
      //     .status(HttpStatus.OK)
      //     .json({ message: 'created', user });
      // }

      var resetToken = new passwordresetToken({
        _userId: user._id,
        resetToken: cryto.randomBytes(16).toString('hex')
      });

      resetToken.save((err) => {
        if (err) {
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: err.message });
        }

        passwordresetToken
          .find({ _userId: user._id, resetToken: { $ne: resetToken.resetToken } })
          .remove()
          .exec();

        res.status(HttpStatus.OK).json({ message: 'Reset password successful.' });
      });
      var transporter = nodemailer.createTransport({
        service: 'Gmail',
        port: 465,
        auth: {
          user: 'oluseyipeter41@gmail.com',
          pass: 'wizard4life',
        },
      });
      var mailOptions = {
        to: user.email,
        from: 'oluseyipeter41@gmail.com',
        subject: 'Rostocks password reset',
        text:
          'You are receiving this because you (or someone else) requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http//localhost:4200/response-reset-password' +
          resetToken.resetToken +
          '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged',
      };
      transporter.sendMail(mailOptions, (err, info) => {});
    }).catch((err) => {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: err.message });
    });
  },

  async ValidPasswordToken(req, res) {
    if (!req.body.resetToken) {
      return res.status(500).json({ message: 'Token is required' });
    }
    const user = await passwordresetToken.findOne({
      resetToken: req.body.resetToken,
    });
    if (!user) {
      return res.status(409).json({ message: 'Invalid URL' });
    }
    User.findOneAndUpdate({ _id: user._userId })
      .then(() => {
        res.status(200).json({ message: 'Token verified successfully.' });
      })
      .catch((err) => {
        return res.status(500).send({ msg: err.message });
      });
  },
  async NewPassword(req, res) {
    passwordresetToken.findOne(
      { resetToken: req.body.resetToken },
      function (err, userToken, next) {
        if (!userToken) {
          return res.status(409).json({ message: 'Token has expired' });
        }

        User.findOne(
          {
            _id: userToken._userId,
          },
          function (err, userEmail, next) {
            if (!userEmail) {
              return res.status(409).json({ message: 'User does not exist' });
            }
            return bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
              if (err) {
                return res
                  .status(400)
                  .json({ message: 'Error hashing password' });
              }
              userEmail.password = hash;
              userEmail.save(function (err) {
                if (err) {
                  return res
                    .status(400)
                    .json({ message: 'Password can not reset.' });
                } else {
                  userToken.remove();
                  return res
                    .status(201)
                    .json({ message: 'Password reset successfully' });
                }
              });
            });
          }
        );
      }
    );
  },
};
