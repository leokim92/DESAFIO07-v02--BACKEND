const express = require("express");
const router = express.Router(); 
const UserModel = require ("../models/user.model.js")

//Registro: 
router.post("/", async (req, res) => {
    const {first_name, last_name, email, password, age} = req.body; 

    try {
        const userExist = await UserModel.findOne({email:email});
        if(userExist) {
            return res.status(400).send("Email is already in use");
        }

        //Rol-New User
        const role = email === "admincoder@coder.com" ? "admin" : "user"; 
        const newUser = await UserModel.create({first_name, last_name, email, password, age, role});
        
        //Creamos un nuevo usuario: 
        //const newUser = await UserModel.create({first_name, last_name, email, password, age});

        //Armamos la session: 
        req.session.login = true;
        req.session.user = {...newUser._doc}

        res.redirect("/profile");

    } catch (error) {
        res.status(500).send("Internal server error")
    }
})

//Login: 
router.post("/login", async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await UserModel.findOne({email:email}); 
        if(user) {
            if(user.password === password) {
                req.session.login = true;
                req.session.user = {
                    email: user.email, 
                    age: user.age,
                    first_name: user.first_name, 
                    last_name: user.last_name
                }
                res.redirect("/products");
            } else {
                res.status(401).send("Password incorrect");
            }

        } else {
            res.status(404).send("User not found");
        }
        
    } catch (error) {
        res.status(500).send("Internal server error")
    }

})

//Logout
router.get("/logout", (req, res) => {
    if(req.session.login) {
        req.session.destroy();
    }
    res.redirect("/login");
})

module.exports = router;