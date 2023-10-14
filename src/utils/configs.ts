export const AppConfigs = {
    passwordMinLength: 6,
    userNameMinlength: 3,
    passwordHashSaltLength: 12,
    titleMinLength: 3,
    codeMaxLengthFree: 10000,
    codeMaxLengthPro: 100000,
    mongoDBIdRegexp: /^[0-9a-fA-F]{24}$/,
    defaultQueryLimit: 20,
    listCodeMaxLength: 300,
} as const