export default function splitExpirationDate(date: string) {
  const [month, year] = date.split("/");

  return { expiryMonth: month, expiryYear: year };
}
