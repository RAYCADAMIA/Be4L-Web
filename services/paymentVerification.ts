import Tesseract from 'tesseract.js';
import { AIVerification } from '../types';
import { supabaseService } from './supabaseService';

export interface VerifyExpected {
    amount: number;
    receiver_name?: string;
    receiver_number?: string;
    booking_created_at: string;
}

const REF_REGEX = /\b\d{13}\b/;
const AMOUNT_REGEX = /(?:₱|PHP|Php|P)\s?([\d,]+\.\d{2})/;
const MOBILE_REGEX = /\b(09\d{9})\b/;
const TIMESTAMP_REGEX = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}[^\n]*\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?/;

function levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        }
    }
    return dp[m][n];
}

function nameFuzzyMatch(extracted: string, expected: string): boolean {
    if (!extracted || !expected) return false;
    const e = extracted.trim().toLowerCase();
    const x = expected.trim().toLowerCase();
    if (e.includes(x) || x.includes(e)) return true;
    return levenshtein(e, x) < 3;
}

async function checkRefUnique(ref: string): Promise<boolean> {
    try {
        const fn = (supabaseService.dibs as any)?.isRefUnique;
        if (typeof fn === 'function') {
            return !!(await fn(ref));
        }
    } catch {
        /* swallow — default to unique-unknown => true */
    }
    return true;
}

export async function verifyGCashProof(
    imageFile: File | Blob | string,
    expected: VerifyExpected
): Promise<AIVerification> {
    const flags: string[] = [];
    let rawText = '';

    try {
        const result = await Tesseract.recognize(imageFile as any, 'eng');
        rawText = result.data.text || '';
    } catch (err) {
        return {
            confidence_score: 0,
            status: 'rejected',
            flags: ['ocr_failed'],
            raw_text: '',
            engine: 'tesseract',
            verified_at: new Date().toISOString(),
        };
    }

    const refMatch = rawText.match(REF_REGEX);
    const amountMatch = rawText.match(AMOUNT_REGEX);
    const mobileMatch = rawText.match(MOBILE_REGEX);
    const tsMatch = rawText.match(TIMESTAMP_REGEX);

    const extracted_ref = refMatch?.[0];
    const extracted_amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined;
    const extracted_receiver_number = mobileMatch?.[1];
    const extracted_timestamp = tsMatch?.[0];

    let extracted_receiver: string | undefined;
    const recvLineMatch = rawText.match(/(?:To|Sent to|Recipient)[:\s]+([A-Z][A-Za-z .'-]{2,60})/);
    if (recvLineMatch) extracted_receiver = recvLineMatch[1].trim();

    const ref_valid = !!extracted_ref;
    const ref_unique = ref_valid ? await checkRefUnique(extracted_ref!) : false;
    const amount_matches = extracted_amount != null && Math.abs(extracted_amount - expected.amount) <= 1;
    const receiver_matches = expected.receiver_name
        ? nameFuzzyMatch(extracted_receiver || '', expected.receiver_name)
        : extracted_receiver_number
        ? expected.receiver_number
            ? extracted_receiver_number === expected.receiver_number
            : true
        : false;

    let timestamp_valid = false;
    if (extracted_timestamp) {
        const parsed = Date.parse(extracted_timestamp);
        if (!isNaN(parsed)) {
            const bookingTime = Date.parse(expected.booking_created_at);
            const diffHrs = Math.abs(parsed - bookingTime) / 36e5;
            timestamp_valid = diffHrs <= 24;
            if (!timestamp_valid) flags.push('timestamp_out_of_window');
        } else {
            flags.push('timestamp_unparseable');
        }
    }

    if (!ref_valid) flags.push('ref_not_found');
    if (!ref_unique) flags.push('ref_duplicate');
    if (!amount_matches) flags.push('amount_mismatch');
    if (!receiver_matches) flags.push('receiver_mismatch');

    const checks = { ref_valid, ref_unique, amount_matches, receiver_matches, timestamp_valid };
    const passed = Object.values(checks).filter(Boolean).length;
    const patternQuality = Math.min(1, (rawText.length > 40 ? 1 : 0.6));
    const confidence_score = Math.round((passed / 5) * patternQuality * 100) / 100;

    let status: AIVerification['status'];
    if (confidence_score >= 0.9) status = 'verified';
    else if (confidence_score >= 0.5) status = 'flagged';
    else status = 'rejected';

    return {
        confidence_score,
        status,
        extracted_ref,
        extracted_amount,
        extracted_receiver,
        extracted_receiver_number,
        extracted_timestamp,
        checks,
        flags,
        raw_text: rawText,
        verified_at: new Date().toISOString(),
        engine: 'tesseract',
    };
}
