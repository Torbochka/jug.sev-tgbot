export const splitArray = <T>(array: T[], chunks: number): T[][] => {
  const subarray = [];
  for (let i = 0; i < Math.ceil(array.length / chunks); i++) {
    subarray[i] = array.slice(i * chunks, i * chunks + chunks);
  }
  return subarray;
};
