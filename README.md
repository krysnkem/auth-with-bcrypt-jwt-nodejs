A nodejs authentication built using express, bcrypt and jwt,

It has the following features

1. Register, Login, Logout usint bcrypt to hash password
2. roles for users such as staff, managers, admin
3. protection of the user routes, with JSON web token
4. password recovery

   Api methods

REGISTRATION : requires username, email, password || Method : POST

For managers : "localhost:[port]/manager/auth/signup"

For staff : "localhost:[port]/staff/auth/signup"

LOGIN: requires email and password || Method : POST || generates a jwt token to be used for the user session

manager : "localhost:[port]/manager/auth/login"

staff: "localhost:[port]/staff/auth/login"

admin: "localhost:[port]/staff/auth/login"

LOGOUT: requires the session json web token to be set authorization header || Method: POST , logs the user out

manager : "localhost:[port]/manager/auth/logout"

staff: "localhost:[port]/staff/auth/logout"

admin: "localhost:[port]/staff/auth/logout"

RECOVERY: makes use of the same route for 2 step process of recovery

GET requires email address to which an otp will be sent

POST requires email address, otp and new password

manager : "localhost:[port]/manager/auth/recovery"

staff: "localhost:[port]/staff/auth/recovery"
