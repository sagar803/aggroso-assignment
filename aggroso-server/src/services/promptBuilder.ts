import type { InsightsRequest, FollowUpRequest } from "../types/schema";

export function buildInsightsPrompt(data: InsightsRequest): string {
  const columnSummary = data.columns
    .map((col) => {
      const parts = [
        `  - "${col.name}" [${col.type}]`,
        `nulls: ${col.nullCount}`,
        `unique: ${col.uniqueCount}`,
      ];
      if (col.mean !== undefined) parts.push(`mean: ${col.mean.toFixed(2)}`);
      if (col.min !== undefined) parts.push(`min: ${col.min}`);
      if (col.max !== undefined) parts.push(`max: ${col.max}`);
      parts.push(`samples: [${col.sampleValues.slice(0, 3).join(", ")}]`);
      return parts.join(" | ");
    })
    .join("\n");

  const sampleRowsText = JSON.stringify(data.sampleRows.slice(0, 5), null, 2);

  const focusNote =
    data.selectedColumns && data.selectedColumns.length > 0
      ? `\nThe user has selected these columns for focused analysis: ${data.selectedColumns.join(", ")}.`
      : "";

  return `You are a data analyst reviewing a CSV dataset. Provide a concise, actionable insights report.

DATASET OVERVIEW:
- File: ${data.filename}
- Rows: ${data.rowCount.toLocaleString()}
- Columns: ${data.columnCount}
${focusNote}

COLUMN STATISTICS:
${columnSummary}

SAMPLE ROWS (first 5):
${sampleRowsText}

Respond ONLY with a valid JSON object in this exact shape:
{
  "summary": "2-3 sentence high-level description of the dataset",
  "insights": [
    { "type": "trend|outlier|quality|warning|positive", "title": "short title", "description": "1-2 sentence detail" }
  ],
  "healthScore": <integer 0-100 based on data completeness and quality>,
  "healthBreakdown": {
    "completeness": <0-100>,
    "consistency": <0-100>,
    "diversity": <0-100>
  },
  "nextSteps": ["actionable suggestion 1", "actionable suggestion 2", "actionable suggestion 3"],
  "outlierColumns": ["col names that have suspicious values"]
}

Rules:
- Provide 4-6 insights total
- Be specific — reference actual column names and values
- healthScore should reflect real data quality (nulls, inconsistencies, outlier density)
- nextSteps should be concrete and analytical`;
}

export function buildFollowUpPrompt(data: FollowUpRequest): string {
  const columnNames = data.columns.map((c) => `"${c.name}" (${c.type})`).join(", ");
  const sampleRowsText = JSON.stringify(data.sampleRows.slice(0, 8), null, 2);

  return `You are a data analyst. The user has already received an initial insights report on their CSV dataset and is asking a follow-up question.

DATASET CONTEXT:
- File: ${data.filename}
- Rows: ${data.rowCount.toLocaleString()}
- Columns: ${columnNames}

PREVIOUS INSIGHTS SUMMARY:
${data.previousInsights}

SAMPLE DATA:
${sampleRowsText}

USER QUESTION: "${data.question}"

Answer the question directly and concisely (2-4 sentences). Be specific, reference column names and actual values where relevant. If the question can't be answered from the available statistics, say so clearly and suggest what data would be needed.`;
}