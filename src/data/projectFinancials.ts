import type { Project } from "./projects";

export function recordedExpenditure(project: Pick<Project, 'actual_spend' | 'expenditure_confirmed'>): number | null {
  return project.expenditure_confirmed ? Number(project.actual_spend) : null;
}

export function projectFinancials(project: Project) {
  const actual = recordedExpenditure(project);
  const projected = project.projected_cost == null ? null : Number(project.projected_cost);
  return { actual, projected, variance: projected == null ? null : projected - Number(project.budget) };
}