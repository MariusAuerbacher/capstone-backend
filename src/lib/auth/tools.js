import jwt from "jsonwebtoken";




export const createAccessToken = (payload, expiresIn)=>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn},
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
