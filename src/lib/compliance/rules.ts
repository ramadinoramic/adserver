import { ComplianceRule, ComplianceResult } from '@/types/compliance';
import { FabricJSON } from '@/types/editor';
import { OfferData } from '@/types/project';

function getAllTextFromCanvas(canvasJSON: FabricJSON): string {
  const texts: string[] = [];

  function extractText(obj: unknown) {
    if (!obj || typeof obj !== 'object') return;
    const o = obj as Record<string, unknown>;

    if (
      (o.type === 'i-text' || o.type === 'text' || o.type === 'textbox') &&
      typeof o.text === 'string'
    ) {
      texts.push(o.text);
    }

    if (Array.isArray(o.objects)) {
      o.objects.forEach(extractText);
    }
  }

  if (canvasJSON?.objects) {
    canvasJSON.objects.forEach(extractText);
  }

  return texts.join(' ').toLowerCase();
}

function pass(ruleId: string): ComplianceResult {
  return { ruleId, status: 'pass' };
}

function fail(ruleId: string, message: string, suggestion: string): ComplianceResult {
  return { ruleId, status: 'fail', message, suggestion };
}

function warn(ruleId: string, message: string, suggestion: string): ComplianceResult {
  return { ruleId, status: 'warning', message, suggestion };
}

export const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: 'age_restriction',
    market: 'generic',
    description: 'Must include 18+ or 21+ age restriction',
    severity: 'error',
    check: (canvas: FabricJSON, offer: OfferData): ComplianceResult => {
      const text = getAllTextFromCanvas(canvas);
      if (text.includes('18+') || text.includes('21+') || text.includes('18 +') || text.includes('21 +')) {
        return pass('age_restriction');
      }
      return fail(
        'age_restriction',
        'No age restriction (18+ or 21+) found in creative',
        'Add "18+" or "21+" text element to your creative'
      );
    },
  },
  {
    id: 'terms_conditions',
    market: 'generic',
    description: 'Must include T&Cs reference',
    severity: 'error',
    check: (canvas: FabricJSON, offer: OfferData): ComplianceResult => {
      const text = getAllTextFromCanvas(canvas);
      const hasTerms =
        text.includes('t&c') ||
        text.includes('terms') ||
        text.includes('t&cs apply') ||
        text.includes('conditions apply');
      if (hasTerms) return pass('terms_conditions');
      return fail(
        'terms_conditions',
        'No T&Cs reference found in creative',
        'Add "T&Cs Apply" or "Terms & Conditions Apply" text element'
      );
    },
  },
  {
    id: 'responsible_gambling_uk',
    market: 'UK',
    description: 'Must include responsible gambling message (UK)',
    severity: 'error',
    check: (canvas: FabricJSON, offer: OfferData): ComplianceResult => {
      const text = getAllTextFromCanvas(canvas);
      const hasRG =
        text.includes('begambleaware') ||
        text.includes('gamble aware') ||
        text.includes('gamblingtherapy') ||
        text.includes('responsible gambling');
      if (hasRG) return pass('responsible_gambling_uk');
      return fail(
        'responsible_gambling_uk',
        'No responsible gambling message found (required for UK)',
        'Add "BeGambleAware.org" or equivalent responsible gambling text'
      );
    },
  },
  {
    id: 'wagering_requirements',
    market: 'UK',
    description: 'Bonus claims must include wagering requirements (UK)',
    severity: 'warning',
    check: (canvas: FabricJSON, offer: OfferData): ComplianceResult => {
      const text = getAllTextFromCanvas(canvas);
      const hasBonusClaim = offer.bonus_amount || text.includes('bonus') || text.includes('free spins');
      if (!hasBonusClaim) return pass('wagering_requirements');

      const hasWagering =
        text.includes('wagering') ||
        text.includes('wager') ||
        text.includes('x playthrough') ||
        /\d+x/.test(text);

      if (hasWagering) return pass('wagering_requirements');
      return warn(
        'wagering_requirements',
        'Bonus offer present but wagering requirements not shown',
        'Add wagering requirement information (e.g., "35x wagering") near the bonus claim'
      );
    },
  },
  {
    id: 'no_misleading_claims',
    market: 'generic',
    description: 'Avoid misleading claims',
    severity: 'warning',
    check: (canvas: FabricJSON, offer: OfferData): ComplianceResult => {
      const text = getAllTextFromCanvas(canvas);
      const misleadingPhrases = [
        'guaranteed win',
        'guaranteed profit',
        'easy money',
        'risk free',
        'risk-free',
        'no risk',
      ];

      const found = misleadingPhrases.find((phrase) => text.includes(phrase));
      if (found) {
        return warn(
          'no_misleading_claims',
          `Potentially misleading claim found: "${found}"`,
          'Review and remove or qualify potentially misleading claims'
        );
      }
      return pass('no_misleading_claims');
    },
  },
  {
    id: 'terms_font_size',
    market: 'generic',
    description: 'Terms and conditions text should be legible (min 8px)',
    severity: 'warning',
    check: (canvas: FabricJSON, offer: OfferData): ComplianceResult => {
      let hasSmallTerms = false;

      function checkObj(obj: unknown) {
        if (!obj || typeof obj !== 'object') return;
        const o = obj as Record<string, unknown>;

        if (
          (o.type === 'i-text' || o.type === 'text' || o.type === 'textbox') &&
          typeof o.text === 'string'
        ) {
          const textLower = (o.text as string).toLowerCase();
          if (
            (textLower.includes('t&c') || textLower.includes('terms') || textLower.includes('18+')) &&
            typeof o.fontSize === 'number' &&
            o.fontSize < 8
          ) {
            hasSmallTerms = true;
          }
        }

        if (Array.isArray(o.objects)) o.objects.forEach(checkObj);
      }

      if (canvas?.objects) canvas.objects.forEach(checkObj);

      if (hasSmallTerms) {
        return warn(
          'terms_font_size',
          'Terms/disclaimer text may be too small to read',
          'Ensure T&Cs and disclaimer text is at least 8px'
        );
      }
      return pass('terms_font_size');
    },
  },
];

export function runComplianceChecks(
  canvas: FabricJSON,
  offer: OfferData,
  markets: string[] = ['generic']
): ComplianceResult[] {
  const relevantRules = COMPLIANCE_RULES.filter(
    (rule) => rule.market === 'generic' || markets.includes(rule.market)
  );

  return relevantRules.map((rule) => rule.check(canvas, offer));
}
