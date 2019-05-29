module.exports = {
    "extends": "airbnb-base",
    "rules": {
        "semi": ['error', 'never'],
        "max-len": ['error', { code: 150 }],
        "no-underscore-dangle": ['error', {allow: ['_id', '__v']}],
    }
};
