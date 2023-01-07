function appendLeadingZeroes(n) {
  if (n <= 9) {
    return "0" + n;
  }
  return n;
}

function getDate() {
  const today = new Date();
  const shortMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const shortDaysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let hours = today.getHours();
  const AmOrPm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return (
    shortDaysOfWeek[today.getDay()] +
    " " +
    shortMonths[today.getMonth()] +
    " " +
    appendLeadingZeroes(today.getDate()) +
    ", " +
    today.getFullYear() +
    " " +
    hours +
    ":" +
    appendLeadingZeroes(today.getMinutes()) +
    " " +
    AmOrPm
  );
}

module.exports = {
  appendLeadingZeroes,
  getDate,
};
