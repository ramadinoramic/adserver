import { FabricJSON } from './editor';
import { OfferData } from './project';

export type ComplianceMarket =
  | 'generic'
  | 'UK'
  | 'AT'
  | 'IT'
  | 'DE'
  | 'SE'
  | 'ES'
  | 'FI'
  | 'CA'
  | 'AU';

export type ComplianceSeverity = 'error' | 'warning' | 'info';

export interface ComplianceResult {
  ruleId: string;
  status: 'pass' | 'fail' | 'warning';
  message?: string;
  suggestion?: string;
}

export interface ComplianceRule {
  id: string;
  market: ComplianceMarket | 'generic';
  description: string;
  severity: ComplianceSeverity;
  check: (canvasData: FabricJSON, offerData: OfferData) => ComplianceResult;
}

export interface ComplianceReport {
  market: ComplianceMarket;
  results: ComplianceResult[];
  passCount: number;
  failCount: number;
  warningCount: number;
  overallStatus: 'pass' | 'fail' | 'warning';
}
