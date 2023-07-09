export const appConfigs = {
    passwordMinLength: 6,
    userNameMinlength: 3,
    passwordHashSaltLength: 12,
    titleMinLength: 3,
    codeMaxLengthFree: 10000,
    codeMaxLengthPro: 100000,
    mongoDBIdRegexp: /^[0-9a-fA-F]{24}$/
} as const