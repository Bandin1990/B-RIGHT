-- B-RIGHT: โครงสร้างข้อมูลสำหรับระบบช่วยประเมินการปล่อยชั่วคราว
-- ห้ามเก็บข้อมูลจริงจนกว่าจะกำหนดสิทธิ์ การเข้ารหัส และนโยบายเก็บรักษาข้อมูลของหน่วยงาน
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  case_no TEXT NOT NULL UNIQUE,
  charge TEXT NOT NULL,
  legal_basis TEXT,
  suspect_name TEXT,
  suspect_reference TEXT,
  custody_started_at TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS risk_assessments (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id),
  factor_answers_json TEXT NOT NULL,
  group_scores_json TEXT NOT NULL,
  total_percent REAL NOT NULL,
  risk_level TEXT NOT NULL,
  legal_gates_json TEXT NOT NULL DEFAULT '[]',
  officer_opinion TEXT,
  assessed_by TEXT NOT NULL,
  assessed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS guarantees (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id),
  guarantee_type TEXT NOT NULL,
  description TEXT NOT NULL,
  declared_value REAL,
  encumbrance_value REAL DEFAULT 0,
  usable_value REAL,
  source_type TEXT NOT NULL,
  source_reference TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  case_id TEXT,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cases_status_updated ON cases(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_case ON risk_assessments(case_id, assessed_at);
CREATE INDEX IF NOT EXISTS idx_guarantees_case ON guarantees(case_id, verification_status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_case_time ON audit_logs(case_id, created_at);
