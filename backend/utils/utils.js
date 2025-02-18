const roundAmount = (amount, decimals = 2) => {
    return parseFloat(Number(amount).toFixed(decimals));
};

module.exports = { roundAmount };
