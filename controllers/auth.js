const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.register = (req, res) =>{
    console.log(req.body);

    const { name, email, password, passwordConfirm } = req.body;

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) =>{
        if(error){
            console.log(error);
        }
        if(results.length > 0) {
            return res.render('register', {
                message: 'Email is already taken.'
            });
        } else if(password !== passwordConfirm) {
            return res.render('register', {
                message: 'Passwords do not match.'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword}, (error, results) =>{
            if (error) {
                console.log(error);
            } else {
                console.log(results);
                return res.render('register', {
                    message: 'User registered.'
                });
            }
        });
    });  

}

exports.login = async (req,res) =>{
    try{
        const { email, password } = req.body;

        if( !email || !password ) {
            return res.status(400).render('login', {
                message: 'Please provide an email and password'
            });
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error,results)=>{

            if( !results || !(await bcrypt.compare(password, results[0].password)) ) {
                res.status(401).render('login', {
                    message: 'Email or Password is incorrect.'
                });
            } else {
                const id = results[0].id;

                //Every user when they login we can create an unique token.
                // like a long string of numbers.
                // when you have a key-value pair with same name instead of id: id
                // you can replace it with id
                // second parameter - when creating an unique token for a user
                // and using the jwt variable, you need to pass your secret password
                // we will store it in our .env file with the variable of JWT_SECRET
                // The password is used to create the token
                // Third parameter is the expiration
                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                console.log("-->Token: " + token);

                //set the token to cookies
                // Second parameter make sures that we only setup our cookie id when are on
                // a http only environment
                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                        httpOnly: true
                }

                //will setup our cookie in the browser
                //jwt - name of cookie variable
                res.cookie('jwt', token, cookieOptions);
                res.status(200).render('userpage');
            }
            

        });

    } catch(error) {
        console.log(error);
    }
}