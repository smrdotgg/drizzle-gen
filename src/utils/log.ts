const shouldLog = !!process.env.DEBUG;

export const log = (...args: Parameters<typeof console.log>) => {
  if (shouldLog) {
    console.log(args);
  }
};
