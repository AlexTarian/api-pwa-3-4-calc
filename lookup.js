const MOCK_CASES = [
  {
    caseNum: "H-300-27123-012345",
    employerName: "Smith Farms LLC",
    jobStart: "2027-03-01",
    jobEnd: "2027-11-15",
    weeklyHours: 48
  },
  {
    caseNum: "H-300-27145-023456",
    employerName: "Prairie View Agriculture",
    jobStart: "2027-04-10",
    jobEnd: "2027-12-01",
    weeklyHours: 40
  },
  {
    caseNum: "H-300-27160-034567",
    employerName: "Green Valley Produce",
    jobStart: "2027-05-01",
    jobEnd: "2027-10-31",
    weeklyHours: 45
  }
];

export async function searchCases(query) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) return [];

  return MOCK_CASES.filter((item) =>
    item.caseNum.toLowerCase().includes(normalized) ||
    item.employerName.toLowerCase().includes(normalized)
  );
}

export async function getCaseByNumber(caseNum) {
  const normalized = caseNum.trim().toLowerCase();

  return MOCK_CASES.find(
    (item) => item.caseNum.toLowerCase() === normalized
  ) ?? null;
}
