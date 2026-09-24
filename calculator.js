function parseLocalDate(value) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function calculateThreeFourthGuarantee({
  startDate,
  endDate,
  weeklyHours
}) {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  if (!start || Number.isNaN(start.getTime())) {
    throw new Error("Please enter a valid start date.");
  }

  if (!end || Number.isNaN(end.getTime())) {
    throw new Error("Please enter a valid end date.");
  }

  if (end < start) {
    throw new Error("The end date cannot be before the start date.");
  }

  if (!Number.isFinite(weeklyHours)) {
    throw new Error("Please enter valid weekly hours.");
  }

  if (weeklyHours < 35) {
    throw new Error("H-2A Job Orders must offer at least 35 hours per week.");
  }

  if (weeklyHours > 168) {
    throw new Error("Weekly hours cannot exceed 168.");
  }

  const utcStart = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );

  const utcEnd = Date.UTC(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  );

  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  const totalDays = Math.floor((utcEnd - utcStart) / millisecondsPerDay) + 1;
  const totalWeeks = totalDays / 7;
  const totalHours = totalWeeks * weeklyHours;
  const guaranteeHours = totalHours * 0.75;

  return {
    startDate: toDateString(start),
    totalDays,
    totalWeeks,
    totalHours,
    guaranteeHours
  };
}
