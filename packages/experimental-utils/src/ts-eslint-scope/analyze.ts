import { analyze as ESLintAnalyze } from 'eslint-scope';
import { ScopeManager } from './ScopeManager';

interface AnalysisOptions {
  optimistic?: boolean;
  directive?: boolean;
  ignoreEval?: boolean;
  nodejsScope?: boolean;
  impliedStrict?: boolean;
  fallback?: string | ((node: Record<string, unknown>) => string[]);
  sourceType?: 'script' | 'module';
  ecmaVersion?: number;
}
const analyze = ESLintAnalyze as (
  ast: Record<string, unknown>,
  options?: AnalysisOptions,
) => ScopeManager;

export { analyze, AnalysisOptions };
