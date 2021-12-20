const users = require("../models/userModel");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

class userRepository {
    async changePassword(req){
        req.user.userName
        let hashed = await bcrypt.hash(req.body.newPassword,14)
        let found;
        return new Promise((res, rej) => {
            try {
                users.findOne({userName : req.user.userName}).then(dbUser => {
                    if(!dbUser){
                      rej("Invalid Username or Password")
                    }
                    console.log(dbUser)
                    bcrypt.compare(req.body.oldPassword, dbUser.password)
                    .then(isCorrect => {
                        if(isCorrect){
                            found = true;
                        } else {
                            res({message: "Invalid Email or Password"})
                      }
                    })
                  })

                  if(found){
                      users.findOneAndUpdate({userName : req.user.userName},{
                        $set: {
                            password: hashed,
                        },
                    }).then(() => {
                        console.log(`Password for ${req.user.userName} has been changed`);
                        res({message: Success});
                    });
                  }
            } catch (err) {
                throw new Error("Username Or Password Are Incorrect");
            }
        });
    }
    async addUser(req){
        let newUser = req.body 
        let hashed = await bcrypt.hash(newUser.password,14)
        return new Promise((res, rej) => {
            try {
                users.insertMany({
                    userName: newUser.userName,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    passportNumber: newUser.passportNumber,
                    password: hashed,
                    isAdmin: false,
                    flights: [],
                    homeAddress: newUser.homeAddress || "",
                    telephoneNumbers: newUser.telephoneNumbers || [],
                    countryCode: newUser.countryCode || ""
                }, function (err, docs) {
                    if (docs == undefined) {
                        rej("An error occured while creating your account");
                    } else {
                        res("Registration Successful");
                    }
                });
            } catch (err) {
                console.log(err)
                throw new Error("An error occured while creating your account");
            }
        });
    }
    async login(userName, password) {
        return new Promise((res, rej) => {
            try {
                users.findOne({userName : userName}).then(dbUser => {
                    if(!dbUser){
                      rej("Invalid Username or Password")
                    }
                    console.log(dbUser)
                    bcrypt.compare(password, dbUser.password)
                    .then(isCorrect => {
                      if(isCorrect){
                        const payload = {
                          id: dbUser._id,
                          userName: dbUser.userName,
                        }
                        jwt.sign(
                          payload,
                          secret,
                          {expiresIn: 86400},
                          (err, token) => {
                            if(err) rej({message: err})
                            res({
                              message: "Success",
                              token: "Bearer " + token
                            })
                          }
                        )
                      } else{
                        res({message: "Invalid Email or Password"})
                      }
                    })
                  })
            } catch (err) {
                throw new Error("Username Or Password Are Incorrect");
            }
        });
    }

    async getUsers() {
        let allUsers = users.find({});
        return allUsers;
    }

    async getUser(userName) {
        let user = users.find({userName : userName});
        return user;
    }

    async updateUser(req) {
        let user = users.find({
            userName: req.user.userName
        })
        for (let num of req.body.telephoneNumbers) {
            if (user.telephoneNumbers.includes(num))
                user.telephoneNumbers.push(num)
        }
        users
            .findOneAndUpdate({
                userName: req.body.oldUserName
            }, {
                $set: {
                    userName: req.body.userName,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    passportNumber: req.body.passportNumber,
                    flights: req.body.flights,
                    homeAddress: newUser.homeAddress,
                    telephoneNumbers: newUser.telephoneNumbers,
                    countryCode: newUser.countryCode
                },
            })
            .then(() => {
                console.log(`User ${req.body.userName} was updated successfully!`);
                return req.body.userName;
            });
    }

    async getFlights(userName, allFlights) {
        return new Promise((res, rej) => {
            users.findOne({
                userName: userName
            }, function (err, docs) {
                if (docs == undefined) {
                    rej("User not found!");
                } else {
                    let results = []
                    console.log(docs.flights);
                    for (let flight of docs.flights) {
                        let data = flight.split(" ")
                        let filtered = allFlights.filter(f => f.flightNumber == data[0])
                        if (filtered.length == 1)
                            results.push(flight)
                    }
                    res(results);
                }
            });
        });
    }

    async deleteFlight(req) {
        let user = users.find({
            userName: req.body.userName
        })
        for (let i in user.flights) {
            if (user.flight[i].includes(req.body.bookingId))
                user.flights.splice(i, 1)
        }
        users
            .findOneAndUpdate({
                userName: user.userName
            }, {
                $set: {
                    flights: user.flights,
                },
            })
            .then(() => {
                console.log(`Booking ${req.body.bookingId} was deleted successfully!`);
                return req.body.bookingId;
            });
    }
}

const repository = new userRepository();
module.exports = repository;