declare global {
  // eslint-disable-next-line no-var
  var __vergabeAgentBuildId__: string | undefined;
}

const generateBuildId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export function getBuildId(): string {
  const globalObject =
    typeof globalThis !== "undefined" ? (globalThis as typeof globalThis & { __vergabeAgentBuildId__?: string }) : undefined;

  if (!globalObject) {
    return generateBuildId();
  }

  if (!globalObject.__vergabeAgentBuildId__) {
    globalObject.__vergabeAgentBuildId__ = generateBuildId();
  }

  return globalObject.__vergabeAgentBuildId__;
}
