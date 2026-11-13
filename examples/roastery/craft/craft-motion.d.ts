/** Names of every data attribute the kit understands (data-<name>). */
export declare const effects: readonly string[];

export interface CraftOptions {
  /** Force reduced motion on or off; defaults to the user's OS setting. */
  reducedMotion?: boolean;
}

/** Start every effect inside root and return a cleanup function. */
export declare function init(root?: ParentNode | null, options?: CraftOptions): () => void;
