'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Shield } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useProjectStore } from '@/stores/projectStore';
import { runComplianceChecks } from '@/lib/compliance/rules';
import { ComplianceResult } from '@/types/compliance';
import { cn } from '@/lib/utils';

const MARKETS = ['generic', 'UK', 'AT', 'IT', 'DE', 'SE', 'ES'] as const;

export function ComplianceChecker() {
  const { canvasDataPerSize, activeSizeKey } = useEditorStore();
  const { activeCreative } = useProjectStore();
  const [results, setResults] = useState<ComplianceResult[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(['generic']);
  const [isChecking, setIsChecking] = useState(false);

  function runChecks() {
    const canvasData = canvasDataPerSize[activeSizeKey];
    const offerData = activeCreative?.offer_data ?? {};
    if (!canvasData) return;

    setIsChecking(true);
    // Small delay for UX feedback
    setTimeout(() => {
      const checkResults = runComplianceChecks(canvasData, offerData, selectedMarkets);
      setResults(checkResults);
      setIsChecking(false);
    }, 300);
  }

  const passCount = results.filter((r) => r.status === 'pass').length;
  const failCount = results.filter((r) => r.status === 'fail').length;
  const warnCount = results.filter((r) => r.status === 'warning').length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Compliance
          </span>
          <button
            onClick={runChecks}
            disabled={isChecking}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={cn('w-3 h-3', isChecking && 'animate-spin')} />
            Check
          </button>
        </div>

        {/* Market selector */}
        <div className="flex flex-wrap gap-1">
          {MARKETS.map((market) => (
            <button
              key={market}
              onClick={() =>
                setSelectedMarkets((prev) =>
                  prev.includes(market)
                    ? prev.filter((m) => m !== market)
                    : [...prev, market]
                )
              }
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-full border transition-colors',
                selectedMarkets.includes(market)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-text-secondary hover:border-primary/40'
              )}
            >
              {market}
            </button>
          ))}
        </div>
      </div>

      {/* Results summary */}
      {results.length > 0 && (
        <div className="flex gap-2 p-3 border-b border-border">
          <div className="flex-1 text-center">
            <div className="text-lg font-bold text-success">{passCount}</div>
            <div className="text-[10px] text-text-secondary">Pass</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-lg font-bold text-red-400">{failCount}</div>
            <div className="text-[10px] text-text-secondary">Fail</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-lg font-bold text-yellow-400">{warnCount}</div>
            <div className="text-[10px] text-text-secondary">Warning</div>
          </div>
        </div>
      )}

      {/* Results list */}
      <div className="p-2 space-y-1">
        {results.length === 0 ? (
          <div className="text-center py-6">
            <Shield className="w-8 h-8 text-text-secondary/40 mx-auto mb-2" />
            <p className="text-xs text-text-secondary">
              Select markets and click Check to validate your creative
            </p>
          </div>
        ) : (
          results.map((result) => (
            <div
              key={result.ruleId}
              className={cn(
                'p-2 rounded-lg border text-xs',
                result.status === 'pass' && 'border-success/20 bg-success/5',
                result.status === 'fail' && 'border-red-500/20 bg-red-500/5',
                result.status === 'warning' && 'border-yellow-500/20 bg-yellow-500/5'
              )}
            >
              <div className="flex items-start gap-2">
                {result.status === 'pass' && (
                  <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                )}
                {result.status === 'fail' && (
                  <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                )}
                {result.status === 'warning' && (
                  <AlertCircle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={cn(
                    'font-medium',
                    result.status === 'pass' && 'text-success',
                    result.status === 'fail' && 'text-red-400',
                    result.status === 'warning' && 'text-yellow-400'
                  )}>
                    {result.ruleId.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                  {result.message && (
                    <p className="text-text-secondary mt-0.5">{result.message}</p>
                  )}
                  {result.suggestion && result.status !== 'pass' && (
                    <p className="text-text-secondary/70 mt-1 italic">{result.suggestion}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
