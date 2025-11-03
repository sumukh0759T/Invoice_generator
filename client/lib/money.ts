export function formatINR(amount: number) {
  return amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
}

// Convert number to Indian currency words (Rupees and Paise)
export function numberToIndianWords(n: number): string {
  const rupees = Math.floor(n);
  const paise = Math.round((n - rupees) * 100);
  const words = integerToWordsIndian(rupees);
  const rupeeWord = rupees === 1 ? "rupee" : "rupees";
  if (paise > 0) {
    const paiseWords = integerToWordsIndian(paise);
    const paiseWord = paise === 1 ? "paise" : "paise";
    return `${capitalize(words)} ${rupeeWord} and ${paiseWords} ${paiseWord} only`;
  }
  return `${capitalize(words)} ${rupeeWord} only`;
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

const BELOW_TWENTY = [
  "zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function twoDigitsToWords(n: number): string {
  if (n < 20) return BELOW_TWENTY[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones ? `${TENS[tens]} ${BELOW_TWENTY[ones]}` : TENS[tens];
}

function threeDigitsToWords(n: number): string {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const hundredPart = hundred ? `${BELOW_TWENTY[hundred]} hundred${rest ? " and " : ""}` : "";
  return hundredPart + (rest ? twoDigitsToWords(rest) : "");
}

// Indian system: crore, lakh, thousand, hundred, rest
export function integerToWordsIndian(n: number): string {
  if (n === 0) return "zero";
  if (n < 0) return `minus ${integerToWordsIndian(Math.abs(n))}`;

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundredRest = n; // 0..999

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigitsToWords(crore)} crore`);
  if (lakh) parts.push(`${threeDigitsToWords(lakh)} lakh`);
  if (thousand) parts.push(`${threeDigitsToWords(thousand)} thousand`);
  if (hundredRest) parts.push(threeDigitsToWords(hundredRest));

  return parts.join(" ");
}
