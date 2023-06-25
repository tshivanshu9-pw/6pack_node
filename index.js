import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import jwt from "jsonwebtoken";
const app = express();
//const users = [];

app.use(express.static(path.join(path.resolve(), "public")));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;
    if (token) {
        const decoded = jwt.verify(token, "abcabc");
        console.log(decoded);
        req.user = await User.findById(decoded._id);
        next();
    } else {
        res.redirect("/login");
    }
};

app.get("/", isAuthenticated, (req, res) => {
    console.log(req.user);
    res.render("logout", { name: req.user.name });
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

// app.get("/success", (req, res) => {
//     res.render("success");
// });

// app.get("/add", async (req, res) => {
//     await Message.create({name:"Abhi2",email:"sample@gmail.com"})
//     res.send("Nice");
// });

// app.get("/users", (req, res) => {
//     res.json({
//         users,
//     });
// });

mongoose
    .connect("mongodb://localhost:27017", {
        dbName: "backend",
    })
    .then(() => console.log("Database Connected!"))
    .catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model("User", userSchema);

app.post("/register", async (req, res) => {
    //console.log(req.body);
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
        return res.redirect("/login");
    }
    user = await User.create({ name, email, password });
    const token = jwt.sign({ _id: user._id }, "abcabc");
    //console.log(token);
    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
});


app.post("/login",async (req,res)=>{
    const {email,password}=req.body;
    let user=await User.findOne({email});
    if (!user) return res.redirect("/register");
    const isMatch=user.password===password;
    if (!isMatch) return res.render("login",{message:"Incorrect Password"});
    const token = jwt.sign({ _id: user._id }, "abcabc");
    //console.log(token);
    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/ ");
})

app.get("/logout", (req, res) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.redirect("/");
});

// app.post("/contact", async (req, res) => {
//     //console.log(req.body);
//     const { name, email } = req.body;
//     //console.log(messageData);
//     await Message.create({ name, email });
//     res.redirect("/success");
// });
app.listen(5000, () => {
    console.log("Server is listening at 5000");
});
