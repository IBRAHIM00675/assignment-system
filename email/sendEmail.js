const transporter = require('./transporter'); 


const sendEmail = async (mailOptions) => {
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; 
    }
};

module.exports = sendEmail;