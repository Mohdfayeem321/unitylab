//<<<==================================== Function for validation =======================================>>>//

//===================== Checking that there is something as Input =====================//

const checkInputsPresent = (value) => { return (Object.keys(value).length > 0); }


//===================== Function to validate the input value with Regex =====================//

const isValidEmail = (value) => { return (/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/.test(value)); }

const isValidpassword = (value) => { return (/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(value)); }

//===================== Module Export =====================//


module.exports = {
    checkInputsPresent,
    isValidEmail,
    isValidpassword
};