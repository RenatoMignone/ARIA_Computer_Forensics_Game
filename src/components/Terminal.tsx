import { useEffect, useRef, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useGame } from '../context/GameContext';
import { useAria, validateQuery } from '../hooks/useAria';
import { useToast } from '../hooks/useToast';
import { useAudio } from '../hooks/useAudio';
import { allValidated } from '../lib/scoring';
import evidenceData from '../data/evidence.json';
import ariaData from '../data/aria_responses.json';
import connectionsData from '../data/connections.json';
import { Evidence, AriaData } from '../types/game';

const evidence = evidenceData as Evidence[];
const aria = ariaData as AriaData;
const connections = connectionsData as any[];

export function Terminal() {
    const { state, dispatch } = useGame();
    const { askAria } = useAria();
    const { showToast } = useToast();
    const { playKeystroke } = useAudio();
    const termRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm | null>(null);
    const fitRef = useRef<FitAddon | null>(null);
    const lineRef = useRef('');
    const historyRef = useRef<string[]>([]);
    const stateRef = useRef(state);
    stateRef.current = state;

    const writeLines = useCallback((lines: string[]) => {
        const term = xtermRef.current;
        if (!term) return;
        lines.forEach(l => term.writeln(l));
    }, []);

    const writePrompt = useCallback(() => {
        const term = xtermRef.current;
        const selected = stateRef.current.selectedEvidenceId;
        const evname = selected ? evidence.find(e => e.id === selected)?.filename : null;
        if (!term) return;
        
        if (evname) {
            term.write(`\r\n\x1b[36mforensic@ARIA \x1b[35m[${evname}]\x1b[0m:\x1b[33m~\x1b[0m$ `);
        } else {
            term.write('\r\n\x1b[36mforensic@ARIA\x1b[0m:\x1b[33m~\x1b[0m$ ');
        }
    }, []);

    const handleCommand = useCallback((raw: string) => {
        const term = xtermRef.current;
        if (!term) return;
        const cmd = raw.trim();
        const s = stateRef.current;

        term.writeln('');

        if (!cmd) { writePrompt(); return; }

        historyRef.current.push(cmd);
        if (historyRef.current.length > 50) historyRef.current.shift();

        const runScan = () => {
            writeLines([
                '\x1b[36mScanning evidence vault...\x1b[0m',
                '',
                'ID              FILENAME                  TYPE    SIZE',
                '─'.repeat(60),
                ...evidence.map(e =>
                    `  \x1b[33m${e.id.padEnd(16)}\x1b[0m${e.filename.padEnd(26)}${e.type.padEnd(8)}[encrypted]`
                ),
                '',
                `\x1b[32m${evidence.length} file(s) found in secure evidence vault.\x1b[0m`,
                '\x1b[90mChain of Custody: all files sealed and hash-verified.\x1b[0m',
            ]);
        };

        const runInspect = (target: string, stringsPrefix = false, grepPattern = '') => {
            const ev = evidence.find(e => e.filename === target || e.id === target);
            if (!ev) {
                writeLines([
                    `\x1b[31mFile not found: ${target}\x1b[0m`,
                    '\x1b[90mUse \x1b[0mscan\x1b[90m to list available files.\x1b[0m',
                ]);
            } else {
                dispatch({ type: 'SELECT_EVIDENCE', evidenceId: ev.id });
                if (stringsPrefix) {
                    writeLines([`\x1b[90m[strings] Extracting printable strings from ${ev.filename}...\x1b[0m`]);
                }
                let lines = [
                    `\x1b[36m=== ${ev.filename} ===\x1b[0m`,
                    `\x1b[90mType: ${ev.type.toUpperCase()}\x1b[0m`,
                    '',
                    '--- RAW METADATA ---',
                    ...Object.entries(ev.rawMetadata).map(([k, v]) => {
                        const isBad = v.toLowerCase().includes('fail') || v.toLowerCase().includes('absent') || v.toLowerCase().includes('anomaly') || v.toLowerCase().includes('alert');
                        return `  ${k.padEnd(28)} \x1b[${isBad ? '31' : '37'}m${v}\x1b[0m`;
                    }),
                    '',
                    '--- DISPLAY CONTENT ---',
                    ...ev.displayContent.split('\n').map(l => `  ${l}`),
                ];

                if (grepPattern) {
                    const lc = grepPattern.toLowerCase();
                    lines = lines.filter(l => l.toLowerCase().includes(lc));
                    if (lines.length === 0) {
                        lines = [`\x1b[90mNo lines matched pattern: ${grepPattern}\x1b[0m`];
                    }
                }
                writeLines(lines);
            }
        };

        // --- scan / ls ---
        if (cmd === 'scan' || cmd === 'ls') {
            runScan();
        }
        else if (cmd === 'ls -la' || cmd === 'ls -l' || cmd === 'ls -al') {
            runScan();
            writeLines([
                '\x1b[90m[Note: write-protected evidence vault — use \'inspect <file>\' for full analysis]\x1b[0m'
            ]);
        }

        // --- inspect / cat / strings / grep ---
        else if (cmd.startsWith('inspect ')) runInspect(cmd.slice(8).trim());
        else if (cmd.startsWith('cat ')) runInspect(cmd.slice(4).trim());
        else if (cmd.startsWith('strings ')) runInspect(cmd.slice(8).trim(), true);
        else if (cmd.startsWith('grep ')) {
            const parts = cmd.split(' ');
            if (parts.length >= 3) {
                runInspect(parts.slice(2).join(' ').trim(), false, parts[1]);
            } else {
                writeLines([
                    '\x1b[31mUsage: grep <pattern> <file>\x1b[0m',
                    '\x1b[90mExample: grep SPF email_1.eml\x1b[0m'
                ]);
            }
        }
        
        // --- Unix immersion extras ---
        else if (cmd === 'clear') {
            term.clear();
            term.write('\x1b[2J\x1b[0;0H');
            writePrompt();
            return;
        }
        else if (cmd === 'pwd') {
            writeLines(['\x1b[37mforensic@ARIA:/evidence/vault/TechCorp-2026-03-03/\x1b[0m']);
        }
        else if (cmd === 'whoami') {
            writeLines(['\x1b[37mforensic-investigator (read-only access — evidence vault sealed)\x1b[0m']);
        }
        else if (cmd === 'history') {
            const hist = historyRef.current.slice(-10);
            writeLines(hist.map((h, i) => `  \x1b[36m${(i + 1).toString().padStart(3, ' ')}\x1b[0m  ${h}`));
        }
        else if (cmd === 'exit') {
            writeLines(['\x1b[31m[WARN] Cannot exit — investigation in progress. Use \'report\' to submit findings.\x1b[0m']);
        }
        else if (cmd.startsWith('sudo ') || cmd === 'sudo') {
            writeLines(['\x1b[31m[DENIED] Elevated privileges not available. Evidence vault is read-only by forensic protocol.\x1b[0m']);
        }
        // --- hash verify <file> ---
        else if (cmd.startsWith('hash verify ')) {
            const target = cmd.slice(12).trim();
            const ev = evidence.find(e => e.filename === target || e.id === target);
            if (!ev) {
                writeLines([`\x1b[31mFile not found: ${target}\x1b[0m`]);
            } else {
                writeLines([
                    `\x1b[36mComputing cryptographic hashes for: ${ev.filename}\x1b[0m`,
                    '',
                    `MD5    (${ev.hash.md5.length * 4}-bit) :  \x1b[33m${ev.hash.md5}\x1b[0m`,
                    `SHA256 (256-bit) :  \x1b[33m${ev.hash.sha256}\x1b[0m`,
                    '',
                    '\x1b[32mHash verification complete. File integrity confirmed.\x1b[0m',
                    '\x1b[90mNote: Run again to confirm reproducibility (chain of custody requirement).\x1b[0m',
                ]);
            }
        }

        // --- timeline ---
        else if (cmd === 'timeline') {
            writeLines([
                '\x1b[36m=== ARIA — RECONSTRUCTED ATTACK TIMELINE ===\x1b[0m',
                '\x1b[31m[WARNING] ARIA-generated content. Cross-check all timestamps against raw evidence.\x1b[0m',
                '',
                'TIMESTAMP (UTC)              EVENT',
                '─'.repeat(70),
                ...aria.timeline.events.map((e, i) =>
                    `  \x1b[33m${e.time.padEnd(28)}\x1b[0m ${i === 0 || i === 1 ? '\x1b[90m' : i === 4 || i === 5 ? '\x1b[31m' : '\x1b[37m'}${e.event}\x1b[0m`
                ),
                '',
                '\x1b[90mTimeline generated by ARIA. Validate timestamps with inspect <file> and hash verify <file>.\x1b[0m',
            ]);
        }

        // --- validate <CLAIM-ID> <verdict> ---
        else if (cmd.startsWith('validate ')) {
            const parts = cmd.split(' ');
            const claimId = parts[1]?.toUpperCase();
            const verdict = parts[2]?.toLowerCase() as 'verified' | 'hallucination';

            if (!claimId || !verdict || !['verified', 'hallucination'].includes(verdict)) {
                writeLines([
                    '\x1b[31mUsage: validate <CLAIM-ID> verified|hallucination\x1b[0m',
                    '\x1b[90mExample: validate CLAIM-003 hallucination\x1b[0m',
                ]);
            } else {
                const claim = s.allClaims[claimId];
                if (!claim) {
                    writeLines([
                        `\x1b[31mClaim not found: ${claimId}\x1b[0m`,
                        '\x1b[90mAsk ARIA about evidence files to generate claims first.\x1b[0m',
                    ]);
                } else if (s.verdicts[claimId] !== 'pending') {
                    writeLines([`\x1b[33m${claimId} already validated: ${(s.verdicts[claimId] as import('../types/game').VerdictRecord).verdict.toUpperCase()}\x1b[0m`]);
                } else {
                    dispatch({ type: 'VALIDATE_CLAIM', claimId, verdict, confidence: 'medium', claim });
                    const isCorrect =
                        (claim.isHallucination && verdict === 'hallucination') ||
                        (!claim.isHallucination && verdict === 'verified');
                    const color = isCorrect ? '\x1b[32m' : '\x1b[31m';
                    const delta = isCorrect ? (claim.isHallucination ? '+20' : '+10') : (claim.isHallucination ? '-30' : '-15');

                    // Show Toast Notification
                    // type: 'success-hallu' | 'success-verify' | 'error-hallu' | 'error-verify'
                    const toastType = isCorrect
                        ? (claim.isHallucination ? 'success-hallu' : 'success-verify')
                        : (claim.isHallucination ? 'error-verify' : 'error-hallu'); // if it WAS a hallu but user said verify -> error-verify

                    const titleText = isCorrect
                        ? (claim.isHallucination ? 'Hallucination Caught' : 'Fact Verified')
                        : 'Validation Failed';

                    showToast({
                        type: toastType,
                        title: titleText,
                        message: claim.explanation
                    });

                    writeLines([
                        `${color}${isCorrect ? '✓' : '✗'} ${claimId} → ${verdict.toUpperCase()} [${delta} pts]\x1b[0m`,
                        `\x1b[90mForensic note: ${claim.explanation.slice(0, 120)}...\x1b[0m`,
                    ]);
                }
            }
        }

        // --- hint <CLAIM-ID> ---
        else if (cmd.startsWith('hint ')) {
            if (s.difficulty === 'expert') {
                writeLines(['\x1b[31m[ERROR] Hints are disabled in Expert mode.\x1b[0m']);
                return;
            }

            const parts = cmd.split(' ');
            const claimId = parts[1]?.toUpperCase();

            if (!claimId) {
                writeLines([
                    '\x1b[31mUsage: hint <CLAIM-ID>\x1b[0m',
                    '\x1b[90mExample: hint CLAIM-003\x1b[0m',
                ]);
            } else {
                const claim = s.allClaims[claimId];
                if (!claim) {
                    writeLines([`\x1b[31mClaim not found: ${claimId}\x1b[0m`]);
                } else if (s.verdicts[claimId] && s.verdicts[claimId] !== 'pending') {
                    writeLines([`\x1b[33m${claimId} is already validated.\x1b[0m`]);
                } else if (s.usedHints[claimId]) {
                    writeLines([
                        `\x1b[36mHint for ${claimId} already retrieved:\x1b[0m`,
                        `\x1b[37m${claim.hintText || 'No additional hints available.'}\x1b[0m`
                    ]);
                } else {
                    dispatch({ type: 'HINT_USED', claimId });
                    writeLines([
                        `\x1b[31m[!] Penalty applied: -5 points for using a hint.\x1b[0m`,
                        `\x1b[36mHint for ${claimId}:\x1b[0m`,
                        `\x1b[37m${claim.hintText || 'No additional hints available.'}\x1b[0m`
                    ]);
                }
            }
        }

        // --- ask aria "..." ---
        else if (cmd.startsWith('ask aria ')) {
            if (!s.selectedEvidenceId) {
                writeLines([
                    `\x1b[33m[WARN] No evidence selected. Use 'inspect <filename>' first to set context.\x1b[0m`,
                    `       \x1b[33mExample: inspect email_1.eml\x1b[0m`
                ]);
            } else {
                const question = cmd.slice(9).replace(/^["']|["']$/g, '');
                
                const validation = validateQuery(question);
                if (!validation.valid) {
                    writeLines([`\x1b[33m[WARN] ${validation.reason}\x1b[0m`]);
                } else {
                    writeLines([`\x1b[36mRouting query to ARIA: "${question}"\x1b[0m`]);
                    dispatch({
                        type: 'ADD_CHAT_MESSAGE',
                        message: { id: `player-term-${Date.now()}`, role: 'player', text: question, timestamp: new Date() }
                    });
                    askAria(question, s.selectedEvidenceId);
                    writeLines(['\x1b[90mARIA response posted to chat panel.\x1b[0m']);
                }
            }
        }

        // --- connect <file1> <file2> "reason" ---
        else if (cmd.startsWith('connect ')) {
            const match = cmd.match(/^connect\s+([^\s]+)\s+([^\s]+)\s+"([^"]+)"$/);
            if (!match) {
                writeLines([
                    '\x1b[31mUsage: connect <file1> <file2> "<reason>"\x1b[0m',
                    '\x1b[90mExample: connect email_1.eml network_logs.txt "Same IP address"\x1b[0m',
                ]);
            } else {
                const f1 = match[1].replace(/\.[^/.]+$/, "");
                const f2 = match[2].replace(/\.[^/.]+$/, "");
                const reason = match[3];

                const ev1 = evidence.find(e => e.filename.startsWith(f1) || e.id === f1);
                const ev2 = evidence.find(e => e.filename.startsWith(f2) || e.id === f2);

                if (!ev1 || !ev2) {
                    writeLines([`\x1b[31mInvalid file(s) specified.\x1b[0m`]);
                } else if (ev1.id === ev2.id) {
                    writeLines([`\x1b[31mCannot connect a file to itself.\x1b[0m`]);
                } else {
                    const conn = connections.find(c =>
                        (c.files.includes(ev1.id) && c.files.includes(ev2.id)) ||
                        (c.files.includes(ev1.filename) && c.files.includes(ev2.filename))
                    );

                    if (!conn) {
                        writeLines([
                            `\x1b[31mConnection rejected.\x1b[0m`,
                            `\x1b[90mNo forensic correlation found between ${ev1.filename} and ${ev2.filename}.\x1b[0m`
                        ]);
                    } else if (s.foundConnections.includes(conn.id)) {
                        writeLines([`\x1b[33mConnection already established.\x1b[0m`]);
                    } else {
                        const reasonLower = reason.toLowerCase();
                        const hasKeyword = conn.keywords.some((k: string) => reasonLower.includes(k.toLowerCase()));

                        if (!hasKeyword) {
                            writeLines([
                                `\x1b[31mConnection rejected: Insufficient reasoning.\x1b[0m`,
                                `\x1b[90mThe files may be related, but your justification is too vague. Specify the exact matching artifact (e.g. timestamp, IP, username).\x1b[0m`
                            ]);
                        } else {
                            dispatch({
                                type: 'REGISTER_CONNECTION',
                                connectionId: conn.id,
                                file1: ev1.filename,
                                file2: ev2.filename,
                                description: conn.description,
                                scoreDelta: conn.reward,
                                timestamp: new Date().toISOString()
                            });
                            showToast({
                                type: 'success-verify',
                                title: 'Connection Established',
                                message: `Linked ${ev1.filename} & ${ev2.filename}`
                            });
                            writeLines([
                                `\x1b[32m✓ Valid connection established [+${conn.reward} pts]\x1b[0m`,
                                `\x1b[36m${conn.description}\x1b[0m`,
                                `\x1b[90mLesson: ${conn.forensicLesson}\x1b[0m`
                            ]);
                        }
                    }
                }
            }
        }

        // --- notes list ---
        else if (cmd === 'notes list') {
            const hasNotes = Object.keys(s.notes || {}).length > 0;
            if (!hasNotes) {
                writeLines(['\x1b[90mNo annotations found. Use the Evidence Vault inspector to add notes.\x1b[0m']);
            } else {
                writeLines(['\x1b[36m=== INVESTIGATOR ANNOTATIONS ===\x1b[0m', '']);
                Object.entries(s.notes).forEach(([evId, fields]) => {
                    const evname = evidence.find(e => e.id === evId)?.filename || evId;
                    writeLines([`\x1b[33m[${evname}]\x1b[0m`]);
                    Object.entries(fields).forEach(([field, note]) => {
                        writeLines([`  ${field.padEnd(20)}: \x1b[37m${note}\x1b[0m`]);
                    });
                    writeLines(['']);
                });
            }
        }

        // --- timer start ---
        else if (cmd === 'timer start') {
            if (s.timerEndTime && s.timerEndTime > Date.now()) {
                writeLines(['\x1b[33mTimer is already running.\x1b[0m']);
            } else {
                dispatch({ type: 'START_TIMER', durationMs: 15 * 60 * 1000 });
                writeLines([
                    '\x1b[32mInvestigation timer started: 15:00\x1b[0m',
                    '\x1b[90mSubmit your final report before time expires for a +50 pt speed bonus.\x1b[0m'
                ]);
            }
        }

        // --- report ---
        else if (cmd === 'report') {
            if (!allValidated(s.verdicts, s.allClaims)) {
                const remaining = Object.values(s.allClaims).filter(c => !s.verdicts[c.id] || s.verdicts[c.id] === 'pending').length;
                writeLines([
                    `\x1b[31m[!] REPORT REJECTED — CHAIN OF CUSTODY INCOMPLETE\x1b[0m`,
                    `\x1b[33mAwaiting investigator verification on ${remaining} AI-generated claim(s).\x1b[0m`,
                    '\x1b[90mSupervisory Protocol 402.B dictates that all ARIA outputs must be independently verified against raw evidence before a final verdict can be signed. AI outputs cannot be trusted inherently.\x1b[0m',
                    '\x1b[90mHint: Use \x1b[0mvalidate <CLAIM-ID> verified|hallucination\x1b[90m for each remaining claim.\x1b[0m',
                ]);
            } else {
                const bonus = s.timerEndTime && s.timerEndTime > Date.now() ? 50 : 0;
                writeLines([
                    '\x1b[32m✓ All claims validated. Generating forensic investigation report...\x1b[0m',
                    `\x1b[33mCalculating score + applying bonus...\x1b[0m`,
                    '\x1b[32mReport submitted. Opening debrief screen.\x1b[0m',
                ]);
                setTimeout(() => dispatch({ type: 'SUBMIT_REPORT' }), 800);
            }
        }

        // --- log show ---
        else if (cmd === 'log show') {
            writeLines([
                '\x1b[36m=== CHAIN OF CUSTODY AUDIT LOG ===\x1b[0m',
                '',
                ...s.chainOfCustody.map(e =>
                    `  \x1b[90m${new Date(e.timestamp).toISOString()}\x1b[0m  \x1b[33m${e.action.padEnd(20)}\x1b[0m  ${e.detail}`
                ),
            ]);
        }

        // --- trace <ip> ---
        else if (cmd.startsWith('trace ')) {
            const ip = cmd.slice(6).trim();
            if (!ip) {
                writeLines([
                    '\x1b[31mUsage: trace <ip_address>\x1b[0m',
                    '\x1b[90mExample: trace 192.168.1.1\x1b[0m'
                ]);
            } else if (ip === '185.220.101.42') {
                writeLines(['\x1b[36mTracing route to 185.220.101.42 over a maximum of 30 hops...\x1b[0m']);
                
                let hop = 1;
                const traceInterval = setInterval(() => {
                    const term = xtermRef.current;
                    if (!term) { clearInterval(traceInterval); return; }
                    
                    if (hop === 1) term.writeln(`  1    <1 ms    <1 ms    <1 ms  10.0.0.1 (gateway)`);
                    else if (hop === 2) term.writeln(`  2      3 ms      2 ms      2 ms  91.200.81.1 (isp-gw)`);
                    else if (hop === 3) term.writeln(`  3     15 ms     14 ms     14 ms  de-cix.fra.net [80.81.192.0]`);
                    else if (hop === 4) term.writeln(`  4     22 ms     25 ms     22 ms  lag-10.ear1.Frankfurt1.Level3.net [4.69.163.54]`);
                    else if (hop === 5) term.writeln(`  5     45 ms    102 ms     80 ms  \x1b[33m185.220.101.42 (tor-exit.nullroute.net)\x1b[0m`);
                    else {
                        term.writeln('');
                        term.writeln('\x1b[31m[!] ALERT: Host identified as known Tor Exit Node (AbuseIPDB Score: 100/100)\x1b[0m');
                        term.writeln('\x1b[90mTrace complete. Connection confirms deliberate anonymity tool usage.\x1b[0m');
                        
                        if (!stateRef.current.foundConnections.includes('tor_trace_bonus')) {
                             dispatch({
                                type: 'REGISTER_CONNECTION',
                                connectionId: 'tor_trace_bonus',
                                file1: 'Terminal',
                                file2: 'Network Logs',
                                description: 'Manually traced exact Tor Exit Node IP',
                                scoreDelta: 15,
                                timestamp: new Date().toISOString()
                            });
                            showToast({
                                type: 'success-verify',
                                title: 'Secret Discovered',
                                message: 'Traced Tor IP address'
                            });
                        }
                        
                        writePrompt();
                        clearInterval(traceInterval);
                    }
                    hop++;
                }, 800);
                return; // Return early because prompt writes async
            } else {
                writeLines(['\x1b[36mTracing route to ' + ip + '...\x1b[0m']);
                let hop = 1;
                const traceInterval = setInterval(() => {
                    const term = xtermRef.current;
                    if (!term) { clearInterval(traceInterval); return; }
                    
                    if (hop === 1) term.writeln(`  1    <1 ms    <1 ms    <1 ms  10.0.0.1 (gateway)`);
                    else if (hop === 2) term.writeln(`  2      *         *         *     Request timed out.`);
                    else if (hop === 3) term.writeln(`  3      *         *         *     Request timed out.`);
                    else {
                        term.writeln('\x1b[90mTrace complete. No meaningful routing data recovered.\x1b[0m');
                        writePrompt();
                        clearInterval(traceInterval);
                    }
                    hop++;
                }, 800);
                return; // Return early
            }
        }

        // --- decode <base64> ---
        else if (cmd.startsWith('decode ')) {
            const b64 = cmd.slice(7).trim();
            try {
                const decoded = atob(b64);
                writeLines([
                    `\x1b[90m[Base64 Decoder] Processing string: ${b64}\x1b[0m`,
                    `\x1b[32mDecoded Output: ${decoded}\x1b[0m`
                ]);
                
                if (decoded === 'AutoDoc AI Writer') {
                    if (!s.foundConnections.includes('base64_bonus')) {
                         dispatch({
                            type: 'REGISTER_CONNECTION',
                            connectionId: 'base64_bonus',
                            file1: 'Terminal',
                            file2: 'Invoice PDF',
                            description: 'Decoded hidden invoice creator payload',
                            scoreDelta: 20,
                            timestamp: new Date().toISOString()
                        });
                        showToast({
                            type: 'success-verify',
                            title: 'Hidden Payload Found',
                            message: 'Decoded Base64 string'
                        });
                    }
                }
            } catch (e) {
                writeLines([`\x1b[31mError: String is not valid Base64 encoding.\x1b[0m`]);
            }
        }

        // --- theme <name> ---
        else if (cmd.startsWith('theme ')) {
            const themeName = cmd.slice(6).trim();
            const term = xtermRef.current;
            if (term) {
                if (themeName === 'matrix') {
                    term.options.theme = { background: '#000000', foreground: '#00ff00', cursor: '#00ff00', selectionBackground: '#003300' };
                    writeLines(['\x1b[32mTerminal theme updated to: \x1b[1mmatrix\x1b[0m']);
                } else if (themeName === 'blood') {
                    term.options.theme = { background: '#1a0000', foreground: '#ff3333', cursor: '#ff0000', selectionBackground: '#4d0000' };
                    writeLines(['\x1b[31mTerminal theme updated to: \x1b[1mblood\x1b[0m']);
                } else if (themeName === 'default') {
                    term.options.theme = { background: '#0a0e17', foreground: '#e2e8f0', cursor: '#06b6d4', selectionBackground: '#1f2937' };
                    writeLines(['\x1b[36mTerminal theme restored to default.\x1b[0m']);
                } else {
                    writeLines([
                        `\x1b[31mUnknown theme: ${themeName}\x1b[0m`,
                        '\x1b[90mAvailable themes: default, matrix, blood\x1b[0m'
                    ]);
                }
            }
        }

        // --- help ---
        else if (cmd === 'help') {
            writeLines([
                '\x1b[36m=== ARIA FORENSIC WORKSTATION — COMMAND REFERENCE ===\x1b[0m',
                '',
                '  \x1b[33mscan\x1b[0m                                List all evidence files',
                '  \x1b[33minspect <file>\x1b[0m                      Show raw metadata + content',
                '  \x1b[33mhash verify <file>\x1b[0m                  Compute MD5/SHA256 hashes',
                '  \x1b[33mtimeline\x1b[0m                            Show ARIA attack timeline (validate it!)',
                '  \x1b[33mvalidate <CLAIM-ID> verified\x1b[0m         Mark ARIA claim as correct',
                '  \x1b[33mvalidate <CLAIM-ID> hallucination\x1b[0m    Mark ARIA claim as hallucination',
                '  \x1b[33mhint <CLAIM-ID>\x1b[0m                      Request a hint for a pending claim (-5 pts)',
                '  \x1b[33mask aria "<question>"\x1b[0m                Send query to ARIA chat',
                '  \x1b[33mconnect <f1> <f2> "<reason>"\x1b[0m       Cross-reference evidence files',
                '  \x1b[33mnotes list\x1b[0m                          List investigator annotations',
                '  \x1b[33mtimer start\x1b[0m                         Start investigation speed timer',
                '  \x1b[33mdecode <base64>\x1b[0m                     Decrypt a base64 encoded string',
                '  \x1b[33mtrace <ip>\x1b[0m                          Trace network route to IP address',
                '  \x1b[33mtheme <name>\x1b[0m                        Change terminal color theme (default, matrix, blood)',
                '  \x1b[33mhelp\x1b[0m                                Show this help',
                '',
                '\x1b[36m[UNIX ALIASES]\x1b[0m',
                '  \x1b[33mls, cat, grep, pwd, clear, history\x1b[0m      Standard CLI navigation aliases',
                '',
                '\x1b[90mRemember: Every ARIA claim tagged [CLAIM-XXX] must be validated.\x1b[0m',
                '\x1b[90mAI assistants can hallucinate — always cross-check raw evidence.\x1b[0m',
            ]);
        }

        else {
            writeLines([
                `\x1b[31mUnknown command: ${cmd}\x1b[0m`,
                '\x1b[90mType \x1b[0mhelp\x1b[90m for available commands.\x1b[0m',
            ]);
        }

        writePrompt();
    }, [dispatch, askAria, writeLines, writePrompt]);

    useEffect(() => {
        if (!termRef.current) return;

        const term = new XTerm({
            theme: {
                background: '#0a0e17',
                foreground: '#e2e8f0',
                cursor: '#06b6d4',
                selectionBackground: '#1f2937',
                black: '#0a0e17',
                brightBlack: '#374151',
                white: '#e2e8f0',
                brightWhite: '#f1f5f9',
                cyan: '#06b6d4',
                brightCyan: '#22d3ee',
                green: '#10b981',
                brightGreen: '#34d399',
                yellow: '#f59e0b',
                brightYellow: '#fbbf24',
                red: '#ef4444',
                brightRed: '#f87171',
            },
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: 12,
            lineHeight: 1.5,
            cursorBlink: true,
            cursorStyle: 'bar',
            scrollback: 500,
        });

        const fit = new FitAddon();
        term.loadAddon(fit);
        term.open(termRef.current);
        fit.fit();
        xtermRef.current = term;
        fitRef.current = fit;

        // Write initial history
        state.terminalHistory.forEach(l => term.writeln(l));
        writePrompt();

        // Input handler
        term.onData(data => {
            const code = data.charCodeAt(0);
            if (code === 13) { // Enter
                playKeystroke();
                handleCommand(lineRef.current);
                lineRef.current = '';
            } else if (code === 127 || code === 8) { // Backspace
                playKeystroke();
                if (lineRef.current.length > 0) {
                    lineRef.current = lineRef.current.slice(0, -1);
                    term.write('\b \b');
                }
            } else if (code === 9) { // Tab autocomplete
                playKeystroke();
                const buf = lineRef.current;
                if (!buf.trim()) return;

                const commands = ['scan', 'inspect ', 'hash verify ', 'validate ', 'ask aria ', 'report', 'log show', 'help', 'timeline', 'hint ', 'connect ', 'notes list', 'timer start', 'ls', 'cat ', 'grep ', 'pwd', 'history', 'clear', 'strings ', 'whoami', 'exit', 'sudo ', 'decode ', 'trace ', 'theme '];
                const parts = buf.split(' ');
                let matches: string[] = [];
                let prefixLength = 0;

                if (parts.length === 1 && !buf.endsWith(' ')) {
                    // Autocomplete base command
                    matches = commands.filter(c => c.startsWith(buf));
                    prefixLength = buf.length;
                } else if (buf.startsWith('inspect ') || buf.startsWith('hash verify ') || buf.startsWith('cat ') || buf.startsWith('strings ')) {
                    // Autocomplete filename
                    const base = buf.startsWith('inspect ') ? 'inspect ' : buf.startsWith('cat ') ? 'cat ' : buf.startsWith('strings ') ? 'strings ' : 'hash verify ';
                    const partial = buf.slice(base.length);
                    const fileNames = evidence.map(e => e.filename);
                    matches = fileNames.filter(f => f.startsWith(partial)).map(f => base + f);
                    prefixLength = buf.length;
                } else if (buf.startsWith('validate ') || buf.startsWith('hint ')) {
                    // Autocomplete claim ID
                    const base = buf.startsWith('validate ') ? 'validate ' : 'hint ';
                    const partial = buf.slice(base.length).toUpperCase();
                    // We only want to autocomplete the CLAIM-XXX part, not the verdict yet
                    if (!partial.includes(' ')) {
                        const claimIds = Object.keys(stateRef.current.allClaims);
                        matches = claimIds.filter(id => id.startsWith(partial)).map(id => base + id);
                        prefixLength = buf.length;
                    }
                }

                if (matches.length === 1) {
                    // Exact match — complete it inline
                    const completion = matches[0].slice(prefixLength);
                    lineRef.current += completion;
                    term.write(completion);
                } else if (matches.length > 1) {
                    // Multiple matches — print options
                    term.writeln('');
                    const displayMatches = matches.map(m => m.trim());
                    term.writeln(`\x1b[90m${displayMatches.join('  ')}\x1b[0m`);
                    writePrompt();
                    term.write(lineRef.current);
                }
            } else if (code >= 32) {
                playKeystroke();
                lineRef.current += data;
                term.write(data);
            }
        });

        const resizeObs = new ResizeObserver(() => fit.fit());
        resizeObs.observe(termRef.current);

        return () => {
            resizeObs.disconnect();
            term.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="h-full bg-[#0a0e17] overflow-hidden" ref={termRef} />
    );
}
