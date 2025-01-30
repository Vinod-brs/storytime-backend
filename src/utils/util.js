import ejs from "ejs";
import nodemailer from "nodemailer";

import { fileURLToPath } from "url";
import { dirname } from "path";
const currentFilePath = import.meta.url;
const currentDirectory = dirname(fileURLToPath(currentFilePath));

// console.log(currentDirectory);

const mail = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "kingvinodkumart@gmail.com",
      pass: "kqhxnwpzhvkbjsss",
    },
  });

// send mail
const sendEmailVerificationLink = async (email, token, name) => {
  try {
    const renderedContent = await ejs.renderFile(
      `${currentDirectory}/../templates/confirm_email.ejs`,
      { token, name }
    );

    const mailOptions = {
      from: "kingvinodkumart@gmail.com",
      to: email,
      subject: "Storytime - Email Confirmation",
      html: renderedContent,
    };

    const verificationInfo = await mail.sendMail(mailOptions);
    return verificationInfo;
  } catch (error) {
    return { error };
  }
};

const EmailVerification = async (name, status, content, token, hide) => {
  try {
    const renderedContent = await ejs.renderFile(
      `${currentDirectory}/../templates/verifyMail.ejs`,
      { name, status, content, token, hide }
    );

    return renderedContent;
  } catch (error) {
    return { error };
  }
};


const sendPasswordResetLink = async (email, token, name) => {
  try {
    const renderedContent = await ejs.renderFile(
      `${currentDirectory}/../templates/reset_password.ejs`,
      { token, name }
    );

    const mailOptions = {
      from: "storytime.nyros@gmail.com",
      to: email,
      subject: "Storytime - Password reset link",
      html: renderedContent,
    };

    const verificationInfo = await mail.sendMail(mailOptions);
    return verificationInfo;
  } catch (error) {
    return { error };
  }
};

const resetPasswordV = async (content, token, hide) => {
  try {
    const renderedContent = await ejs.renderFile(
      `${currentDirectory}/../templates/resetPassword.ejs`,
      { content, token, hide }
    );

    return renderedContent;
  } catch (error) {
    return { error };
  }
};

// Mobile
// send verification code through mail
const sendVerificationCode = async (name, email, otp) => {
  try {
    const renderedContent = await ejs.renderFile(
      `${currentDirectory}/../templates/otp.ejs`,
      { name, otp }
    );

    const mailOptions = {
      from: "storytime.nyros@gmail.com",
      to: email,
      subject: "Storytime - Email Confirmation",
      html: renderedContent,
    };

    const verificationInfo = await mail.sendMail(mailOptions);
    return verificationInfo;
  } catch (error) {
    return { error };
  }
};

const sendPasswordResetVerificationCode = async (name, email, otp) => {
  try {
    const renderedContent = await ejs.renderFile(
      `${currentDirectory}/../templates/reset_password_code.ejs`,
      { name, otp }
    );

    const mailOptions = {
      from: "storytime.nyros@gmail.com",
      to: email,
      subject: "Storytime - Password reset code",
      html: renderedContent,
    };

    const verificationInfo = await mail.sendMail(mailOptions);
    return verificationInfo;
  } catch (error) {
    return { error };
  }
};

export { sendEmailVerificationLink, EmailVerification, sendPasswordResetLink, sendVerificationCode, sendPasswordResetVerificationCode, resetPasswordV };