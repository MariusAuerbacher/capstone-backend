import jwt from "jsonwebtoken";




export const createAccessToken = (payload)=>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "4 weeks" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  ); 

export const verifyAccessToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) reject(err);
      else resolve(payload);
    })
  ); 
