export const convertIntDateToDashedDate = (intDate: number): string => {
  const intDateStr = intDate.toString();
  return `${intDateStr.slice(0, 4)}-${intDateStr.slice(4, 6)}-${intDateStr.slice(6)}`;
}

export const convertDashedDateToIntDate = (dashedDate: string): number => {
  return parseInt(dashedDate.split('-').join(''));
}