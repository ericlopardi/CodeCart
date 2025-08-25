export const logInfo = (message) => {
    console.log(`(INFO) ${new Date().toISOString()} - ${message}`);
}

export const logError = (message) => {
    console.log(`(ERROR) ${new Date().toISOString()} - ${message}`);
}
