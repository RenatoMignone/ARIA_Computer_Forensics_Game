#!/usr/bin/env node
/**
 * ARIA Forensic Workstation — Class Results Aggregator
 * =====================================================
 * Usage:
 *   node scripts/aggregate_results.mjs [input-dir] [output-dir]
 *
 * Arguments:
 *   input-dir   Directory containing aria_report_*.json files (default: ./reports)
 *   output-dir  Directory where class_summary.json will be written (default: ./reports)
 *
 * What it does:
 *   1. Scans input-dir for all aria_report_*.json files
 *   2. Parses each report and extracts key metrics
 *   3. Aggregates class-level statistics
 *   4. Writes class_summary.json to output-dir
 *   5. Prints a formatted summary to stdout
 *
 * Dependencies: Node.js built-ins only (fs, path, process)
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { resolve, join, basename } from 'path';

// ── Argument Parsing ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const inputDir = resolve(args[0] || './reports');
const outputDir = resolve(args[1] || inputDir);

// ── File Discovery ────────────────────────────────────────────────────────────
let files;
try {
    files = readdirSync(inputDir).filter(f => f.match(/^aria_report_.*\.json$/));
} catch (err) {
    console.error(`[ERROR] Cannot read input directory: ${inputDir}`);
    console.error(`        ${err.message}`);
    process.exit(1);
}

if (files.length === 0) {
    console.warn(`[WARN] No aria_report_*.json files found in: ${inputDir}`);
    process.exit(0);
}

console.log(`[INFO] Found ${files.length} report(s) in ${inputDir}`);

// ── Per-Report Parsing ────────────────────────────────────────────────────────
const parsed = [];
const errors = [];

for (const filename of files) {
    const filepath = join(inputDir, filename);
    try {
        const raw = readFileSync(filepath, 'utf-8');
        const report = JSON.parse(raw);

        // Validate expected fields
        const required = ['finalScore', 'difficulty', 'claimBreakdown', 'connectionsFound', 'calibration'];
        const missing = required.filter(k => !(k in report));
        if (missing.length > 0) {
            errors.push({ file: filename, reason: `Missing required fields: ${missing.join(', ')}` });
            continue;
        }

        const claims = Array.isArray(report.claimBreakdown) ? report.claimBreakdown : [];
        const hallucinations = claims.filter(c => c.isHallucination);
        const halluCaught = hallucinations.filter(c => c.verdict === 'hallucination').length;
        const trueAccepted = claims.filter(c => !c.isHallucination && c.verdict === 'verified').length;
        const totalClaims = claims.length;
        const validated = claims.filter(c => c.verdict !== 'pending' && c.verdict !== null).length;

        const wellCalibrated = report.calibration?.wellCalibrated ?? 0;
        const totalCalibrated = report.calibration?.total ?? 0;
        const calibPct = totalCalibrated > 0 ? Math.round((wellCalibrated / totalCalibrated) * 100) : null;

        // Tier classification (mirrors scoring.ts getTier)
        const getTier = (score) => {
            if (score >= 150) return 'expert';
            if (score >= 100) return 'senior';
            if (score >= 50) return 'junior';
            return 'dependent';
        };

        parsed.push({
            file: filename,
            date: report.dateGenerated ?? null,
            difficulty: report.difficulty ?? 'unknown',
            finalScore: report.finalScore,
            tier: getTier(report.finalScore),
            tierLabel: report.investigatorTier ?? '—',
            mode: report.mode ?? 'unknown',
            totalClaims,
            validated,
            halluTotal: hallucinations.length,
            halluCaught,
            halluMissed: hallucinations.length - halluCaught,
            trueAccepted,
            connectionsFound: Array.isArray(report.connectionsFound) ? report.connectionsFound.length : 0,
            calibrationScore: calibPct,
            studentNotes: Array.isArray(report.studentNotes) ? report.studentNotes.length : 0,
        });
    } catch (err) {
        errors.push({ file: filename, reason: err.message });
    }
}

if (errors.length > 0) {
    console.warn(`\n[WARN] ${errors.length} file(s) skipped due to errors:`);
    errors.forEach(e => console.warn(`       - ${e.file}: ${e.reason}`));
}

if (parsed.length === 0) {
    console.error('[ERROR] No valid reports could be parsed. Exiting.');
    process.exit(1);
}

// ── Class Aggregation ─────────────────────────────────────────────────────────
const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const median = (arr) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const scores = parsed.map(p => p.finalScore);
const tierCounts = { expert: 0, senior: 0, junior: 0, dependent: 0 };
parsed.forEach(p => { if (p.tier in tierCounts) tierCounts[p.tier]++; });

const difficultyCounts = {};
parsed.forEach(p => {
    difficultyCounts[p.difficulty] = (difficultyCounts[p.difficulty] || 0) + 1;
});

const halluRates = parsed.map(p => p.halluTotal > 0 ? p.halluCaught / p.halluTotal : null).filter(r => r !== null);
const calibScores = parsed.map(p => p.calibrationScore).filter(s => s !== null);

const summary = {
    generatedAt: new Date().toISOString(),
    totalReports: parsed.length,
    skippedFiles: errors.length,
    scoreStats: {
        mean: Math.round(avg(scores) * 10) / 10,
        median: median(scores),
        min: Math.min(...scores),
        max: Math.max(...scores),
        standardDeviation: Math.round(
            Math.sqrt(avg(scores.map(s => Math.pow(s - avg(scores), 2)))) * 10
        ) / 10,
    },
    tierDistribution: {
        ...tierCounts,
        total: parsed.length,
    },
    difficultyDistribution: difficultyCounts,
    hallucinationDetectionRate: halluRates.length > 0
        ? Math.round(avg(halluRates) * 1000) / 10 // percentage
        : null,
    calibrationMeanPct: calibScores.length > 0
        ? Math.round(avg(calibScores) * 10) / 10
        : null,
    students: parsed.sort((a, b) => b.finalScore - a.finalScore),
};

// ── Output ────────────────────────────────────────────────────────────────────
try {
    mkdirSync(outputDir, { recursive: true });
} catch { /* already exists */ }

const outPath = join(outputDir, 'class_summary.json');
writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf-8');

// ── Stdout Summary ────────────────────────────────────────────────────────────
const LINE = '─'.repeat(60);
console.log('\n' + LINE);
console.log('  ARIA Forensic Workstation — Class Summary');
console.log(LINE);
console.log(`  Reports processed : ${parsed.length}`);
console.log(`  Score  mean       : ${summary.scoreStats.mean}`);
console.log(`  Score  median     : ${summary.scoreStats.median}`);
console.log(`  Score  range      : ${summary.scoreStats.min} – ${summary.scoreStats.max}`);
console.log(`  Score  std-dev    : ${summary.scoreStats.standardDeviation}`);
console.log('');
console.log('  Tier Distribution:');
console.log(`    🥇 Expert     : ${tierCounts.expert}  (${Math.round(tierCounts.expert / parsed.length * 100)}%)`);
console.log(`    🥈 Senior     : ${tierCounts.senior}  (${Math.round(tierCounts.senior / parsed.length * 100)}%)`);
console.log(`    🥉 Junior     : ${tierCounts.junior}  (${Math.round(tierCounts.junior / parsed.length * 100)}%)`);
console.log(`    ⚠️  Dependent  : ${tierCounts.dependent}  (${Math.round(tierCounts.dependent / parsed.length * 100)}%)`);
console.log('');
if (summary.hallucinationDetectionRate !== null) {
    console.log(`  Avg hallucination detection rate : ${summary.hallucinationDetectionRate}%`);
}
if (summary.calibrationMeanPct !== null) {
    console.log(`  Avg calibration score            : ${summary.calibrationMeanPct}%`);
}
console.log('');
console.log(`  Output written to: ${outPath}`);
console.log(LINE + '\n');
