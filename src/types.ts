export interface DialogueTurn {
  sender: string;
  text: string;
}

export interface TokenInfo {
  t: string;
  type: 'special' | 'subword' | 'normal';
  meaning: string;
  embedding: number[];
}

export interface AttentionHeadData {
  [queryToken: string]: {
    [targetToken: string]: number;
  };
}

export interface AttentionData {
  [headIndex: number]: AttentionHeadData;
}

export interface DomainLogit {
  name: string;
  logit: number;
  prob: number;
}

export interface SlotCandidate {
  name: string;
  prob: number;
}

export interface SlotItem {
  slotName: string; // e.g. "{지점}", "{시설}"
  value: string;
  candidates: SlotCandidate[];
}

export interface SlotTemplateData {
  domain: string;
  slots: SlotItem[];
}

export interface SpanTokenInfo {
  text: string;
  bio: 'B' | 'I' | 'O';
  score: number;
}

export interface SpanCandidate {
  name: string;
  score: number;
}

export interface EmbeddingPoint {
  name: string;
  x: number;
  y: number;
  slot: string;
  color: string;
}

export interface SimilarityPair {
  a: string;
  b: string;
  cos: number;
  sameSlot: boolean;
  yes: boolean;
}

export interface BeamNode {
  y: number;
  text: string;
  prob: number;
  parent?: string;
  id: string;
  top?: boolean;
}

export interface BeamLevel {
  x: number;
  label: string;
  nodes: BeamNode[];
}

export interface NBestQuery {
  rank: number;
  query: string;
  prob: number;
  logProb: number;
}

export interface Scenario {
  id: string;
  title: string;
  domainName: string;
  lede: string;
  dialogue: DialogueTurn[];
  tokens: TokenInfo[];
  attention: AttentionData;
  attentionTokens: string[];
  domains: DomainLogit[];
  slotsTemplate: SlotTemplateData;
  spanTokens: SpanTokenInfo[];
  spanCandidates: SpanCandidate[];
  embPoints: EmbeddingPoint[];
  simPairs: SimilarityPair[];
  beamLevels: BeamLevel[];
  nbest: NBestQuery[];
  insightList: string[];
}
