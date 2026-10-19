# Architecture rules
- Use a shared project detail view for public and administrative screens so both display the same saved records, never fabricated project metrics.
- Keep additive project field types and evidence access in application-owned modules until generated database types catch up; never edit generated integration files.
- Store project evidence in private storage with project-linked metadata and short-lived signed URLs; database roles authorize all write operations.
- Reuse implementation fields in both project editors so saved information stays consistent across public and administrative entry points.
- Treat unconfirmed expenditure as unknown and use only saved projected costs; never infer financial records from physical progress.
- Parse project CSV imports with Papa Parse so commas, escaped quotes, and multiline evidence descriptions remain intact.