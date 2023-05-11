import InstitutionModel from "../api/institutions/model.js"
import UserModel from "../api/users/model.js"
import { createTransport } from "nodemailer"

const transport = createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD
  }
})

const sendEmail = async(to, subject, html) =>{
  await transport.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    html
  })
}

export const sendPasswordResetEmail = async(userName, userEmail, userNewPassword) => {
  await sendEmail(userEmail,  "Password Reset Confirmation",  `
  <p> Dear ${userName},
  this is your new Password: ${userNewPassword} .Please make sure to change it after loggin in. <p>
  ` )
}

export const sendDonationEmail = async(userId, institutionId) => {
  const user = await UserModel.findById(userId)
  const institution = await InstitutionModel.findById(institutionId)
  await sendEmail(user.email,  "Thanks for donating",  `
  <p> Dear ${user.name},
  thank you for donating, we would like to let you know that we have received your donation <p>
  ` )

  await sendEmail(institution.email,  "Thanks for donating", `
  <p> Dear ${institution.name},
  we would like to let you know that we have sent you a donation<p>
  `)


}


