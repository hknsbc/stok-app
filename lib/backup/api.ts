
import type { JobRow } from "./types";

// İstemciye dönen iş özeti: state / token gibi iç veriler asla dışarı çıkmaz.
export function publicJob(j: JobRow) {
  let progress = 0;
  if (j.status === "success") progress = 100;
  else if (j.operation === "backup") {
    const js = j.state?.json;
    const expected = Object.values(js?.expected ?? {}).reduce((a, b) => a + b, 0);
    const done = Object.values(js?.counts ?? {}).reduce((a, b) => a + b, 0);
    const jsonPct = js?.done ? 1 : expected > 0 ? Math.min(0.99, done / expected) : 0;
    const excelPct = Math.min(1, (j.state?.excelIdx ?? 0) / 7);
    const phaseBase = { json: 0, excel: 55, documents: 85, finalize: 95 }[j.phase ?? "json"] ?? 0;
    progress = j.phase === "json" ? Math.round(jsonPct * 55) : j.phase === "excel" ? Math.round(55 + excelPct * 30) : phaseBase;
  } else {
    const rs = j.state?.restore;
    const stage = { init: 2, purge: 10, import: 20, reconcile: 85, documents: 92, done: 99 }[rs?.stage ?? "init"] ?? 0;
    const imp = rs?.size ? Math.min(1, (rs.byteOffset ?? 0) / rs.size) : 0;
    progress = rs?.stage === "import" ? Math.round(20 + imp * 65) : stage;
  }
  return {
    id: j.id, operation: j.operation, trigger: j.trigger, status: j.status, phase: j.phase, progress,
    startedAt: j.started_at, finishedAt: j.finished_at, fileName: j.file_name, fileSize: j.file_size,
    recordCounts: j.record_counts, error: j.error_message, warnings: j.warnings ?? [],
  };
}

