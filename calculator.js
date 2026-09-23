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
  jobStart,
  workerArrival,
  jobEnd,
  weeklyHours
}) {
  const jobStartDate = parseLocalDate(jobStart);
  const jobEndDate = parseLocalDate(jobEnd);
  const workerArrivalDate = workerArrival ? parseLocalDate(workerArrival) : null;

  if (!jobStartDate || Number.isNaN(jobStartDate.getTime())) {
    throw new Error("Please enter a valid job start date.");
  }

  if (!jobEndDate || Number.isNaN(jobEndDate.getTime())) {
    throw new Error("Please enter a valid job end date.");
  }

  if (workerArrivalDate && Number.isNaN(workerArrivalDate.getTime())) {
    throw new Error("Please enter a valid worker arrival date.");
  }

  if (jobEndDate < jobStartDate) {
    throw new Error("The job end date cannot be before the job start date.");
  }

  if (!Number.isFinite(weeklyHours) || weeklyHours <= 0) {
    throw new Error("Weekly hours must be greater than zero.");
  }

  const effectiveStart =
    workerArrivalDate && workerArrivalDate > jobStartDate
      ? workerArrivalDate
      : jobStartDate;

  if (effectiveStart > jobEndDate) {
    throw new Error("The worker's effective start date cannot be after the job end date.");
  }

  const utcStart = Date.UTC(
    effectiveStart.getFullYear(),
    effectiveStart.getMonth(),
    effectiveStart.getDate()
  );

  const utcEnd = Date.UTC(
    jobEndDate.getFullYear(),
    jobEndDate.getMonth(),
    jobEndDate.getDate()
  );

  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  const totalDays = Math.floor((utcEnd - utcStart) / millisecondsPerDay) + 1;
  const totalWeeks = totalDays / 7;
  const totalHours = totalWeeks * weeklyHours;
  const guaranteeHours = totalHours * 0.75;

  return {
    effectiveStart: toDateString(effectiveStart),
    totalDays,
    totalWeeks,
    totalHours,
    guaranteeHours
  };
}
