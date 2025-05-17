const nodemailer = require('nodemailer');

// Configura il trasportatore di Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tuo_email@gmail.com',  // Inserisci il tuo indirizzo email
    pass: 'tua_password_email'    // Inserisci la tua password email
  }
});

/**
 * Funzione per inviare un'email di recupero password
 * @param {string} email - L'indirizzo email dell'utente a cui inviare l'email
 * @param {string} resetLink - Il link per il recupero della password
 */
const inviaEmailRecuperoPassword = (email, resetLink) => {
  const mailOptions = {
    from: 'tuo_email@gmail.com',  
    to: email,                    
    subject: 'Recupero Password', 
    text: `Clicca sul link per reimpostare la tua password: ${resetLink}` 
  };

  // Invia l'email
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);  
      } else {
        resolve(info);
      }
    });
  });
};

module.exports = {
  inviaEmailRecuperoPassword
};
