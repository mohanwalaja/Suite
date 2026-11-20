// A conservative screening gate, not a proof of design originality.
export function visualAuditPasses(report) {
  const subjects = report.subjectsReport;
  return report.threshold === 0.97 && report.subjects === 172 && report.rendered === 25800 &&
    report.compared === 1922100 && report.exact === 0 && report.near === 0 &&
    Array.isArray(subjects) && subjects.length === 172 &&
    new Set(subjects.map((s) => s.subject)).size === 172 &&
    subjects.every((s) => s.rendered === 150 && s.flaggedPairs === 0 && s.identicalSignatures === 0);
}
