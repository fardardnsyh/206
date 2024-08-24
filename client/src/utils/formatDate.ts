const dateFormatter = new Intl.DateTimeFormat('en-UK');

export default function formatDate(date: string) {
  return dateFormatter.format(Date.parse(date));
}
