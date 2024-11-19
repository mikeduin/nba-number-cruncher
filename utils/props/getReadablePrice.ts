export const getReadablePrice = (price?: string) => {
  if (price) {
    return price === 'EVEN' ? 100 : parseFloat(price);
  } else {
    return null;
  }
}