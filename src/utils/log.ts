let shouldLog = 0;

export const log = (...args: Parameters<typeof console.log>) => {
  if (shouldLog){
    console.log(args);
  }
}
