class EngineDiagnosticsManager {
  private static instance: EngineDiagnosticsManager;
  
  private diagnostics = {
    executionTimes: {} as Record<string, number>,
    cacheHits: {} as Record<string, number>,
    cacheMisses: {} as Record<string, number>,
    arrayTraversals: {} as Record<string, number>,
    warnings: [] as string[]
  };

  private constructor() {}

  public static getInstance(): EngineDiagnosticsManager {
    if (!EngineDiagnosticsManager.instance) {
      EngineDiagnosticsManager.instance = new EngineDiagnosticsManager();
    }
    return EngineDiagnosticsManager.instance;
  }

  public recordExecutionTime(engineName: string, timeMs: number) {
    if (__DEV__) {
      this.diagnostics.executionTimes[engineName] = timeMs;
      console.log(`[Diagnostics] ${engineName} generated in ${timeMs.toFixed(2)}ms`);
    }
  }

  public recordCacheHit(key: string) {
    if (__DEV__) {
      this.diagnostics.cacheHits[key] = (this.diagnostics.cacheHits[key] || 0) + 1;
    }
  }

  public recordCacheMiss(key: string) {
    if (__DEV__) {
      this.diagnostics.cacheMisses[key] = (this.diagnostics.cacheMisses[key] || 0) + 1;
    }
  }

  public recordTraversal(datasetName: string, count: number) {
    if (__DEV__) {
      this.diagnostics.arrayTraversals[datasetName] = (this.diagnostics.arrayTraversals[datasetName] || 0) + count;
    }
  }

  public recordWarning(warning: string) {
    if (__DEV__) {
      this.diagnostics.warnings.push(warning);
      console.warn(`[Diagnostics Warning] ${warning}`);
    }
  }

  public getSnapshot() {
    return { ...this.diagnostics };
  }

  public clear() {
    this.diagnostics.executionTimes = {};
    this.diagnostics.cacheHits = {};
    this.diagnostics.cacheMisses = {};
    this.diagnostics.arrayTraversals = {};
    this.diagnostics.warnings = [];
  }
}

export default EngineDiagnosticsManager.getInstance();
