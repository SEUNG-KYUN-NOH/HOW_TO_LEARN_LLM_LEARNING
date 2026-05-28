import React, { useState, useEffect } from 'react';
import { 
  SCENARIOS 
} from './data';
import { 
  Scenario, 
  TokenInfo, 
  DomainLogit,
  SimilarityPair, 
  EmbeddingPoint 
} from './types';
import { 
  BookOpen, 
  Cpu, 
  Layers, 
  Compass, 
  Sliders, 
  GitPullRequest, 
  Database, 
  Search, 
  HelpCircle, 
  Info, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Check, 
  Maximize2, 
  RefreshCw, 
  Flame,
  MousePointer, 
  TrendingUp, 
  GraduationCap
} from 'lucide-react';

export default function App() {
  // Current active scenario state
  const [activeScenarioId, setActiveScenarioId] = useState<string>('suseongmot-parking');
  const activeScenario = SCENARIOS.find(s => s.id === activeScenarioId) || SCENARIOS[0];

  // Stage timeline index (0 to 6)
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);

  // STAGE 01 State: Selected token for embedding display
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(2); // Default to first meaningful word '주말'
  
  // STAGE 02 State: Selected head index (0, 1, 2) & selected query token
  const [activeHeadIndex, setActiveHeadIndex] = useState<number>(0);
  const [selectedQueryToken, setSelectedQueryToken] = useState<string>('주차');

  // STAGE 03 State: Artificial raw logit multipliers for the interactive softmax simulator
  const [userLogitOffsets, setUserLogitOffsets] = useState<{ [domainName: string]: number }>({});

  // STAGE 05 State: Slider threshold
  const [bioThreshold, setBioThreshold] = useState<number>(0.50);

  // STAGE 06 State: Highlighting point or pair
  const [selectedEmbPoint, setSelectedEmbPoint] = useState<string>('공영주차장');

  // Dictionary Glossaries - easy interactive descriptions
  const [selectedGlossary, setSelectedGlossary] = useState<string | null>(null);

  // STAGE 07 State: Interactive log P calculator parameters
  const [calcP1, setCalcP1] = useState<number>(0.80);
  const [calcP2, setCalcP2] = useState<number>(0.75);
  const [calcP3, setCalcP3] = useState<number>(0.90);

  // Effect to sync default variables when switching scenarios
  useEffect(() => {
    setSelectedTokenIndex(2); // Reset to '주말' or third token
    
    // Pick first available attention target
    if (activeScenario.attentionTokens.length > 0) {
      if (activeScenario.attentionTokens.includes('주차')) {
        setSelectedQueryToken('주차');
      } else if (activeScenario.attentionTokens.includes('파스타')) {
        setSelectedQueryToken('파스타');
      } else if (activeScenario.attentionTokens.includes('실내')) {
        setSelectedQueryToken('실내');
      } else {
        setSelectedQueryToken(activeScenario.attentionTokens[0]);
      }
    }

    // Reset offsets & states
    setUserLogitOffsets({});
    
    // Pick appropriate default keyword point
    if (activeScenario.id === 'suseongmot-parking') {
      setSelectedEmbPoint('공영주차장');
    } else if (activeScenario.id === 'gangnam-restaurant') {
      setSelectedEmbPoint('파스타');
    } else {
      setSelectedEmbPoint('협재');
    }
  }, [activeScenarioId]);

  // Term dictionary definitions for non-majors
  const GLOSSARY_TERMS: { [key: string]: { title: string; subtitle: string; explanation: string; metaphor: string } } = {
    token: {
      title: "토큰 (Token)",
      subtitle: "문장을 컴퓨터 규격에 맞춰 자른 '단어 벽돌'",
      explanation: "컴퓨터는 사람처럼 문자 한 글자씩 깊은 사색을 하지 못해요. 그래서 긴 문장을 의미가 있는 최소 단위(예: '수성', '못', '에')로 칼같이 도려내어 벽돌처럼 쌓아두는 것을 '토큰화'라고 부릅니다.",
      metaphor: "🍪 쉽게 말해, 긴 김밥(문장)을 입에 쏙 들어가도록 한 입 크기로 총총 썰어낸 김밥 한 개(토큰)와 같습니다!"
    },
    embedding: {
      title: "임베딩 & 벡터 (Embedding & Vector)",
      subtitle: "단어의 뜻을 숫자로 가득 찬 '사물함 지도'에 채워 가두기",
      explanation: "컴퓨터는 한글 단어의 깊은 한자 사색을 이해하지 못해요. 대신 모든 단어를 거대한 숫자 목록(수백 개에서 수천 개의 실수)으로 바꿉니다. 이 숫자 무리를 '벡터(Vector)'라고 하며 단어의 특징을 표현해서 사물함 주소처럼 사용합니다.",
      metaphor: "🎨 비유하자면, 단어만의 고유한 색상 배합표입니다. '주차장'과 '주차'는 엄청나게 비슷한 네이비빛 배합표 번호를 가지지만, '감자'는 혼자 노란색 배합표를 가져서 서로 다른 주소에 놓이게 됩니다."
    },
    attention: {
      title: "셀프-어텐션 (Self-Attention)",
      subtitle: "한 단어가 문맥 속 다른 단어들과 '눈빛을 주고받으며 맥락 파악하기'",
      explanation: "인공지능 모델이 문장을 해독할 때 각 단어가 외톨이로 동작하지 않게 만드는 대장 원리입니다. 단어 하나가 다른 모든 단어와 눈빛(가중치 점수)을 주고받으며 '내가 이번 주말에 수성못에 가려는데 주차는 어떻게 하나?'처럼 문맥상 가장 중요한 단어를 더 진하고 선명하게 쳐다봅니다.",
      metaphor: "👀 단어들이 교실 책상에 앉아 칠판(맥락)을 보면서, 가장 관련 깊은 단어 파트너를 손가락으로 가리키며 짝짜꿍 수다를 나누는 것과 비슷해요!"
    },
    logits: {
      title: "로짓스 (Logits / 원래 점수)",
      subtitle: "컴퓨터 필터가 채점판에 매긴 날것 가점",
      explanation: "도메인 분류가 시작될 때 모델 내부 수식 계산을 마치고 나온 정리되지 않은 날것(Raw) 그대로의 등수 점수입니다. 아직 비율 정리나 확률 백분율처리가 안 되어 있어서 점수값의 경계가 무한정 높거나 낮아질 수 있는 순수 데이터입니다.",
      metaphor: "📝 백분율 평가 전, 국어·수학 원점수(예: 85점, 140점)를 그대로 불러모은 시험 채점표의 점수들과 같습니다!"
    },
    softmax: {
      title: "소프트맥스 (Softmax)",
      subtitle: "원점수 야수 목록을 온순한 '백분율 확률 분포'로 정규화하는 마술",
      explanation: "날것의 점수(Logits)들을 모두 0%에서 100% 사이의 백분율 점수로 변경해 주며, 모든 카테고리 확률의 총합이 정확히 100%(1.0)가 되도록 규정하는 마술 필터입니다. 특히 1위 득점자 후보를 더 도드라지게 밀어주는 승자독식 연산 성향이 있습니다.",
      metaphor: "🍰 모양과 크기가 제각각인 빵 조각들의 불규칙한 원점수 무게를 잘 배분하여, 합쳐서 정확히 1판의 케이크(100%) 비율로 온순하게 가공하는 기술입니다."
    },
    slot: {
      title: "슬롯 템플릿 (Slot Template)",
      subtitle: "검색을 위해 마련된 '빈칸 채우기 가이드 종이'",
      explanation: "대화 분석이 '맛집 도메인' 혹은 '로컬 도메인'으로 결정되면 그 업무에 맞는 맞춤형 양식 서류철이 펼쳐집니다. 예를 들어 {장소}, {행위}, {수식 키워드} 등 서랍칸이 열리고 모델은 단어들 중 가장 어울리는 카드를 각 명판 서랍에 차곡차곡 넣어 완성합니다.",
      metaphor: "📋 은행에서 돈을 송금할 때 쓰는 '계좌번호 / 받는 이 / 금액' 칸이 인쇄된 투명 서류 양식지 같은 구조입니다."
    },
    bio: {
      title: "BIO 태깅 (Span BIO Classifier)",
      subtitle: "가위질할 단어에 부착하는 '시작(B)·진행(I)·비대상(O)' 견출지 라벨",
      explanation: "문맥 속에서 필요한 핵심 명사나 구절(Span)만 핀셋으로 도려내기 위해 각 단어 머리에 이름표를 부착하는 작업입니다. 명사가 시작되는 첫 단어에는 **B**(Begin), 내용이 연속되는 단어에는 **I**(Inside), 필요 없는 버려질 조사나 서술어에는 **O**(Outside) 딱지를 붙이고 오려냅니다.",
      metaphor: "🏷️ 옷가게에서 보관할 재고에 라벨 스티커를 붙이는 작업과 같아요. '수성(B) 못(I) 가려는데(O) 주차(B)는(O)' 형태로 딱 구분해 가위질할 곳을 지정합니다."
    },
    cosine: {
      title: "코사인 유사도 (Cosine Similarity / 각도 비교)",
      subtitle: "두 단어가 향하는 생각이 얼마나 꼬여 있는지 '나침반 각도 재기'",
      explanation: "두 개의 임베딩 벡터가 다차원 비밀 공간 속에서 가리키고 있는 고유 방향의 좁은 틈새 각도를 재는 수학 도구입니다. 완전히 똑같은 생각(방향)을 가리키면 점수가 1.0(최대 유사), 직각으로 다른 엉뚱한 뜻을 지향하면 0.0 인근으로 멀어집니다.",
      metaphor: "🧭 두 사람의 나침반 자침이 서로 같은 곳을 가리키는지 각도를 재는 원리입니다. '공영주차장'과 '주차장'은 나침반 바늘 각도가 아주 가깝게 겹칩니다."
    },
    beam: {
      title: "빔 서치 (Beam Search)",
      subtitle: "모든 길을 다 헤매지 않는 '우수 유망주 추적대'",
      explanation: "언어 모델이 단어를 한 자씩 출력하여 쿼리를 조립해 나갈 때, 뒤에 올 수 있는 엄청난 조합수를 전부 다 계산하면 컴퓨터 전력망이 마비돼요. 그래서 매 스텝마다 가장 그럴듯한 엘리트 후보 가설 몇 개(이 보관 개수를 Beam Width라고 합니다)만 들고 동행 탐사하는 절약 탐사법입니다.",
      metaphor: "🔦 어두운 야생 숲길에서 탐색원 3명(빔 크기=3)이 모여 각자 최고의 샛길만 등불로 비추며 조화롭게 줄지어 나아가는 합동 수색 작전입니다."
    },
    logp: {
      title: "로그 확률 (Log Probability - log P)",
      subtitle: "아주 미세한 소수점 확률들이 통째로 소멸하지 않도록 보호하는 수학적 구원자",
      explanation: "각 단어를 차례로 생성해 나갈 때 각 단어별 확률(예: 0.8, 0.7, 0.5)을 단순 곱셈(0.8 × 0.7 × 0.5)하다 보면 단어가 길어질 때 최종 확률이 0.0000000103처럼 극도로 작아져 컴퓨터가 연산 오차로 0으로 단정 짓는 '언더플로우' 현상이 발생합니다. 이를 극복하고자 자연로그(ln)를 씌웁니다. 이 조치 덕분에 '곱셈' 연산이 훨씬 쉽고 직관적인 '더하기'로 통일됩니다. 0과 1 사이의 소수에 로그를 씌우면 언제나 '음수'가 되며, 1.0(100%)에 가까울수록 log P는 0에 가까워지고, 확률이 낮아질수록 음수가 크고 깊어집니다(예: -10, -50).",
      metaphor: "⚖️ 각 단계의 곱하기(단어 생성 성공 확률)를 벌물 벌점(마이너스 감점)의 '더하기'로 번역하는 방식입니다! 감점을 차곡차곡 합산한 뒤, 최종적으로 벌점을 '가장 적게 낸 우등생(0에 가장 아슬아슬하게 가까운 음수)'을 우승자로 선택하는 평정심 가득한 채점법입니다."
    }
  };

  const STAGES_LIST = [
    { title: "토큰화 & 임베딩", subtitle: "텍스트 쪼개기", icon: Layers, desc: "텍스트를 기계 규격 어휘 블록인 토큰으로 절단하고 고유 벡터 좌표를 할당합니다." },
    { title: "Self-Attention", subtitle: "단어의 맥락 조율", icon: Cpu, desc: "단머들이 문맥 안에서 서로 연관도를 눈빛으로 조율해 참뜻을 파악합니다." },
    { title: "도메인 분류", subtitle: "대화 분류 필터", icon: Compass, desc: "[CLS] 중심 벡터를 기반으로 맛집, 로컬, 날씨 등 대주제를 정규화 확률로 연산합니다." },
    { title: "슬롯 구조 활용", subtitle: "서랍 채워 넣기", icon: Database, desc: "대분류에 맞게 선정된 {서랍 양식지}를 차례대로 알맞은 내용물로 충전합니다." },
    { title: "키워드 추출", subtitle: "핵심 스팬 수거", icon: Sliders, desc: "비핵심 사소어를 제외하고 B-I-O 라벨 등급을 매겨 주요 핵심 키워드만 수확합니다." },
    { title: "임베딩 유사도", subtitle: "유사 단어 합병", icon: GitPullRequest, desc: "오려낸 키워드들의 다차원 거리 각도를 계산하여 동질 대상은 OR로 영리하게 묶어냅니다." },
    { title: "쿼리 디코딩", subtitle: "빔 서치 쿼리 완성", icon: Search, desc: "유망주 빔 탐색 경로를 따라 오염과 환각이 배제된 가장 명쾌한 1등 제로쿼리를 도출합니다." }
  ];

  // Helper: Softmax Calculator based on base logit + offset
  const getSimulatedSoftmax = (domainLogits: DomainLogit[]) => {
    // apply user defined interactive modifications
    const modifiedLogits = domainLogits.map(d => {
      const offset = userLogitOffsets[d.name] || 0;
      return { ...d, activeLogit: d.logit + offset };
    });

    const exps = modifiedLogits.map(d => Math.exp(d.activeLogit));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    
    return modifiedLogits.map((d, i) => ({
      name: d.name,
      logit: d.activeLogit,
      prob: sumExps > 0 ? exps[i] / sumExps : 0
    })).sort((a, b) => b.prob - a.prob);
  };

  const currentSoftmaxList = getSimulatedSoftmax(activeScenario.domains);

  // Helper trigger glossary detail
  const openGlossary = (termKey: string) => {
    setSelectedGlossary(termKey);
  };

  return (
    <div className="min-h-screen bg-paper-bg text-ink flex flex-col selection:bg-brand-accent-soft selection:text-brand-accent-deep">
      
      {/* 1. TOP BAR */}
      <header className="bg-ink text-paper-bg px-5 py-4 flex flex-col sm:flex-row items-center justify-between border-b border-line-border z-10 gap-3" id="main-header">
        <div className="flex items-center gap-3">
          <span className="bg-brand-accent text-white px-2.5 py-0.5 rounded-full text-xs font-bold font-mono tracking-wide uppercase shadow-sm">
            Interactive Deep Dive
          </span>
          <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            <span>제로쿼리 추출 내부 작동 원리</span>
            <span className="text-zinc-400 font-normal">|</span>
            <span className="text-brand-accent font-medium text-xs sm:text-sm">어떻게 모델은 우리 대화에서 검색어를 꺼낼까?</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-brand-ok" /> 비전공자 특화 가이드 겸비</span>
          <span>7 STAGES EXPLAINER</span>
        </div>
      </header>

      {/* 2. HERO / EXPLANATION SECTION */}
      <section className="px-6 py-8 max-w-7xl mx-auto w-full border-b border-line-border" id="hero-banner">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 text-brand-accent-deep font-mono text-xs tracking-wider uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
              인공지능 모델의 내부 메커니즘을 시각화하다
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-ink mb-4">
              모델이 우리들의 대화를<br className="hidden sm:inline" />
              참뜻으로 해석해 낸다는 것은 <span className="text-brand-primary border-b-2 border-brand-accent pb-0.5">어떤 뜻인가.</span>
            </h2>
            <p className="text-sm sm:text-base text-ink-2 leading-relaxed mb-6">
              카카오톡이나 채팅 속 대화 한 세션을 입력받아 웹 사이트 검색 API 등에 집어넣을 수 있는 정교한 
              <strong> 제로쿼리(Zero-Query)</strong>로 가공해 내기까지, 인공지능 내부 필터망에서 벌어지는 
              7단계의 수학적 변환 시공간을 직접 투영해 드립니다. 
              <br />
              <span className="text-xs text-brand-primary font-medium mt-1 inline-block">
                💡 텍스트 내 밑줄 쳐진 전문 용어를 클릭하면 초보자용 친근한 요약 사전 카드가 즉각 제공됩니다.
              </span>
            </p>

            {/* SCENARIO SELECTOR */}
            <div className="bg-card-white border border-line-border rounded-xl p-4 shadow-sm">
              <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-text mb-3">
                STEP 0. 실습하고 싶은 카톡방 시나리오를 자유롭게 변경해 보세요:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    id={`btn-sc-${sc.id}`}
                    onClick={() => {
                      setActiveScenarioId(sc.id);
                    }}
                    className={`text-left p-3 rounded-lg border transition-all text-xs flex flex-col justify-between gap-1 cursor-pointer hover:border-ink ${
                      activeScenarioId === sc.id 
                        ? 'bg-ink border-ink text-white shadow-md' 
                        : 'bg-paper-bg border-line-border text-ink-2 hover:bg-line-soft'
                    }`}
                  >
                    <span className="font-bold">{sc.title}</span>
                    <span className={`text-[10px] ${activeScenarioId === sc.id ? 'text-brand-accent-soft' : 'text-muted-text'}`}>
                      {sc.domainName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: SELECTED DIALOGUE SHOWCASE */}
          <div className="lg:col-span-5 bg-card-white border border-line-border rounded-xl p-5 shadow-sm relative overflow-hidden" id="live-conversation-view">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent-soft/10 rounded-full blur-xl -mr-6 -mt-6"></div>
            <div className="flex items-center justify-between border-b border-line-soft pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-accent"></span>
                <span className="text-xs font-mono font-bold uppercase text-muted-text">분석 대상 카톡방 세션</span>
              </div>
              <span className="text-[10px] font-mono bg-paper-darker text-muted-text px-2 py-0.5 rounded">
                공통 고해상도 입력 데이터
              </span>
            </div>

            {/* DIALOGUE BUBBLES */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {activeScenario.dialogue.map((turn, i) => {
                const isMe = turn.sender === '나' || turn.sender === '지민';
                return (
                  <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-muted-text mb-0.5 font-bold px-1">{turn.sender}</span>
                    <span className={`text-xs px-3 py-2 rounded-2xl max-w-[85%] leading-relaxed ${
                      isMe 
                        ? 'bg-brand-primary text-white rounded-tr-none' 
                        : 'bg-paper-darker text-ink rounded-tl-none border border-line-border'
                    }`}>
                      {turn.text}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-line-soft flex items-center justify-between text-xs">
              <span className="text-muted-text">최종 의도 타깃:</span>
              <span className="font-mono bg-brand-accent-soft text-brand-accent-deep py-1 px-2.5 rounded font-extrabold flex items-center gap-1">
                <Search className="w-3 h-3" /> " {activeScenario.nbest[0].query} "
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STICKY VISUAL STEPPING TIMELINE NAVIGATION */}
      <div className="toc-wrap bg-paper-darker border-b border-line-border sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex items-center gap-1 py-3 whitespace-nowrap min-w-max">
            {STAGES_LIST.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = activeStageIndex === idx;
              return (
                <button
                  key={idx}
                  id={`btn-stage-${idx}`}
                  onClick={() => {
                    setActiveStageIndex(idx);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 text-xs rounded-full cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-ink text-white font-bold shadow' 
                      : 'bg-card-white border border-line-border text-muted-text hover:text-ink hover:border-muted-text'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[9px] ${
                    isActive ? 'bg-brand-accent text-white' : 'bg-paper-darker text-muted-text'
                  }`}>
                    0{idx + 1}
                  </span>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{stage.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. MAIN INTERACTIVE CONTENT GRID */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ACTIVE STAGE CONTENT COLUMN (8 cols on large screens) */}
        <section className="lg:col-span-8 flex flex-col gap-6 w-full">
          
          {/* HEADER OF THE CURRENT ACTIVE STAGE */}
          <div className="bg-card-white border border-line-border rounded-xl p-5 shadow-sm" id="stage-viewport-header">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-brand-accent-deep bg-brand-accent-soft px-3 py-1 rounded">
                STAGE 0{activeStageIndex + 1}
              </span>
              <span className="text-[11px] font-mono text-muted-text flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-brand-primary" /> 시나리오별 유동식 전환 활성화됨
              </span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-ink mb-2">
              {STAGES_LIST[activeStageIndex].title}
            </h3>
            <p className="text-sm text-ink-2 leading-relaxed">
              {STAGES_LIST[activeStageIndex].desc}
            </p>
          </div>

          {/* INTERACTIVE STAGE SWITCHBOARD STYLES */}

          {/* ============ STAGE 1: TOKENIZATION & EMBEDDINGS ============ */}
          {activeStageIndex === 0 && (
            <div id="section-view-1" className="bg-card-white border border-line-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
              
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-text mb-2 flex items-center gap-1.5">
                  <span>1.1 단어로 썰기 (토큰화)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-brand-accent cursor-pointer" onClick={() => openGlossary('token')} />
                </h4>
                <p className="text-xs text-ink-2 mb-4 leading-relaxed">
                  대화를 아래와 같이 잘게 조각냅니다. <strong>토큰 타일을 클릭해 보세요.</strong> 해당 단어만의 독특한
                  <span className="underline decoration-dotted cursor-pointer hover:text-brand-accent ml-1" onClick={() => openGlossary('embedding')}>임베딩 데이터 값</span>이 즉각 사물함 번호판처럼 시뮬레이션 표기됩니다.
                </p>

                {/* Tokens flex stream */}
                <div id="token-stream-react" className="flex flex-wrap gap-2 p-4 bg-paper-bg rounded-xl border border-line-soft">
                  {activeScenario.tokens.map((tok: TokenInfo, idx: number) => {
                    const isSelected = selectedTokenIndex === idx;
                    const styleClass = 
                      tok.type === 'special' ? 'bg-ink text-white font-mono' :
                      tok.type === 'subword' ? 'bg-brand-accent-soft text-brand-accent-deep border-brand-accent/20' :
                      'bg-card-white text-ink border-line-border';

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedTokenIndex(idx)}
                        className={`px-3 py-1.5 rounded-md border text-xs font-mono transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-1 ${styleClass} ${
                          isSelected ? 'ring-2 ring-brand-accent font-bold scale-105 shadow-md' : 'opacity-85'
                        }`}
                      >
                        {tok.t}
                        {isSelected && <MousePointer className="w-3 h-3 text-brand-accent" />}
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex flex-wrap gap-4 mt-2.5 text-[10px] text-muted-text px-1">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-ink"></span> 문장경계·화자지정 특수 토큰</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-brand-accent-soft border border-brand-accent/20"></span> 빈도 드문 가지 단축서브워드 (##)</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-card-white border border-line-border"></span> 일반 사상어 토큰</span>
                </div>
              </div>

              {/* Embedding Vector Inspection Display */}
              <div id="embedding-display-box" className="bg-paper-bg border border-line-border rounded-xl p-5">
                <div className="flex items-center justify-between border-b border-line-soft pb-3 mb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-muted-text block">
                      선택한 토큰의 특징 배합 지도 (8차원 가공 예시)
                    </span>
                    <span className="text-base font-extrabold text-brand-primary font-mono bg-brand-soft px-2.5 py-0.5 rounded mt-1 inline-block">
                      "{activeScenario.tokens[selectedTokenIndex]?.t}" 토큰
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-text bg-card-white border border-line-border px-2 py-1 rounded">
                    차원 크기 d_model = 768
                  </span>
                </div>

                {/* Render float coordinates blocks */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {activeScenario.tokens[selectedTokenIndex]?.embedding.map((val: number, i: number) => {
                    const intensity = Math.abs(val);
                    const isPositive = val >= 0;
                    const bgStyle = isPositive 
                      ? { backgroundColor: `rgba(107, 112, 92, ${0.15 + intensity * 0.85})` }
                      : { backgroundColor: `rgba(203, 153, 126, ${0.15 + intensity * 0.85})` };
                    
                    return (
                      <div 
                        key={i} 
                        style={bgStyle}
                        className="h-14 rounded-lg flex flex-col justify-between p-2 text-center text-white font-mono shadow-sm border border-black/5"
                      >
                        <span className="text-[8px] text-zinc-100 uppercase opacity-75">DIM {i}</span>
                        <span className="text-xs font-bold leading-none">{val.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 text-xs text-ink-2 leading-relaxed bg-card-white border border-line-soft p-3.5 rounded-lg flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-brand-primary">이 토큰 단어의 의미적 해석:</span>
                    <span className="text-xs">{activeScenario.tokens[selectedTokenIndex]?.meaning}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ============ STAGE 2: SELF-ATTENTION ============ */}
          {activeStageIndex === 1 && (
            <div id="section-view-2" className="bg-card-white border border-line-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-text mb-2 flex items-center gap-1.5">
                  <span>2.1 단어들의 양방향 시너지 조율 (눈빛 지도)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-brand-accent cursor-pointer" onClick={() => openGlossary('attention')} />
                </h4>
                <p className="text-xs text-ink-2 mb-4">
                  대화 안에 산재된 단어들이 문맥 속 다른 단어가 품은 힌트를 수집하는 단계입니다. 
                  <strong> 아래에서 토큰을 터치해보세요.</strong> 그 단어가 어떤 지점의 의미를 강하게 참고(Attention % 가중)하는지 색상의 농도로 투영됩니다. 
                </p>

                {/* Attention Head selection tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {[
                    "인공지능 시선 1 · 음식/행위 의미 연관",
                    "인공지능 시선 2 · 주변 위치·거리 수식",
                    "인공지능 시선 3 · 핵심 정보 덩어리 응집"
                  ].map((tabName, hIdx) => (
                    <button
                      key={hIdx}
                      onClick={() => setActiveHeadIndex(hIdx)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all whitespace-nowrap cursor-pointer ${
                        activeHeadIndex === hIdx 
                          ? 'bg-brand-primary border-brand-primary text-white font-bold' 
                          : 'bg-paper-bg border-line-border text-muted-text hover:text-ink'
                      }`}
                    >
                      {tabName}
                    </button>
                  ))}
                </div>

                {/* Active input token flex boxes */}
                <div className="border border-line-soft rounded-xl p-4 bg-paper-bg flex flex-wrap gap-2.5 justify-center">
                  {activeScenario.attentionTokens.map((tok: string, idx: number) => {
                    const isQuery = tok === selectedQueryToken;
                    const weights = activeScenario.attention[activeHeadIndex]?.[selectedQueryToken] || {};
                    const weight = weights[tok] || 0;
                    
                    // Style calculation
                    let bgStyle = {};
                    let textClass = 'text-ink';
                    let borderClass = 'border-line-border';

                    if (isQuery) {
                      bgStyle = { backgroundColor: '#4A4E4D' };
                      textClass = 'text-white font-extrabold';
                      borderClass = 'border-ink';
                    } else if (weight > 0) {
                      bgStyle = { backgroundColor: `rgba(107, 112, 92, ${Math.min(1.0, weight * 2.2)})` };
                      if (weight > 0.25) {
                        textClass = 'text-white font-bold';
                        borderClass = 'border-brand-primary';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedQueryToken(tok)}
                        style={bgStyle}
                        className={`px-3 py-2 rounded-lg border text-xs font-mono transition-all transform hover:-translate-y-0.5 cursor-pointer flex flex-col items-center gap-1 ${textClass} ${borderClass} ${
                          isQuery ? 'scale-105 shadow-md' : 'shadow-sm'
                        }`}
                      >
                        <span>{tok}</span>
                        {!isQuery && weight > 0 && (
                          <span className="text-[9px] font-mono opacity-80">
                            {(weight * 100).toFixed(0)}%
                          </span>
                        )}
                        {isQuery && <span className="text-[8px] uppercase tracking-wide text-brand-accent">QUERY</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic explanations bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-paper-bg border border-line-border rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-muted-text uppercase block mb-2">
                      인공지능 집중 분석 리포트
                    </span>
                    <h5 className="text-xs font-extrabold text-brand-primary mb-2">
                       "{selectedQueryToken}" (은/는) 누구를 가장 흥미롭게 쳐다보고 있나요?
                    </h5>
                    <p className="text-xs text-ink-2 leading-relaxed mb-4">
                      {selectedQueryToken === '주차' || selectedQueryToken === '공영주차장' ? (
                        "주요 목적 대상인 '수성못'과 직접 교호 작용을 형성했습니다. 수성못이라는 위치 정보와 주차 공간의 공급이 이뤄지고 있습니다."
                      ) : selectedQueryToken === '파스타' || selectedQueryToken === '레스토랑' ? (
                        "강남역 지리 위치 장치들과 직접 밀착하고 있습니다. 또한 서초나 신논현역 같은 구체적인 이탈리안 목적지를 강력하게 주의 집중합니다."
                      ) : selectedQueryToken === '실내' || selectedQueryToken === '미술관' || selectedQueryToken === '아쿠아리움' ? (
                        "피신할 목적지로서 협재, 제주 주변의 실내 관광 코스들인 미술관 및 아쿠아리움을 연계 지목합니다."
                      ) : (
                        "인접해 있는 장소 단어나 대조 어미 단어들을 거치며 대화 속 맥락의 조각들을 연결 지었습니다."
                      )}
                    </p>
                  </div>
                  <div className="text-[10px] text-muted-text font-mono border-t border-line-soft pt-2.5">
                    가장 관련성 두터운 파트너에게 큰 주의력을 던집니다.
                  </div>
                </div>

                <div className="bg-paper-bg border border-line-border rounded-xl p-4">
                  <span className="text-[10px] font-mono font-bold text-muted-text uppercase block mb-3">
                     TOP 5 집중도 비례 데이터
                  </span>
                  <div className="space-y-2.5">
                    {Object.entries(activeScenario.attention[activeHeadIndex]?.[selectedQueryToken] || {})
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([targetTok, weight]) => (
                        <div key={targetTok} className="flex items-center justify-between text-xs font-mono">
                          <span className="w-16 truncate font-bold text-ink-2">{targetTok}</span>
                          <div className="flex-1 mx-2.5 bg-line-soft h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-brand-primary h-full rounded-full transition-all duration-300"
                              style={{ width: `${weight * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-brand-primary font-bold w-8 text-right">{(weight * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ============ STAGE 3: DOMAIN CLASSIFIER ============ */}
          {activeStageIndex === 2 && (
            <div id="section-view-3" className="bg-card-white border border-line-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
              
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-text mb-2 flex items-center gap-1.5">
                  <span>3.1 대화 요약 벡터와 소프트맥스 변환</span>
                  <HelpCircle className="w-3.5 h-3.5 text-brand-accent cursor-pointer" onClick={() => openGlossary('softmax')} />
                </h4>
                <p className="text-xs text-ink-2 mb-4 leading-relaxed">
                  대화를 다 해석하면 앞서 언급한 특수 상자 <strong>[CLS]</strong>에 대화 전체의 내용 요약본이 들어찹니다. 
                  여기에 행렬 곱셈 가중치(W)를 집어넣어 구한 8가지 원점수(<strong className="underline decoration-dotted cursor-pointer" onClick={() => openGlossary('logits')}>Logit</strong>)를 가볍게 정규화시키는 과정입니다.
                </p>
              </div>

              {/* CLS summary representation */}
              <div className="bg-paper-bg rounded-xl border border-line-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-muted-text">
                     인공지능 대화 압축 카드 [CLS]
                  </span>
                  <span className="text-[10px] font-mono bg-ink text-white px-2 py-0.5 rounded">
                    d_model = 768
                  </span>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {[0.51, -0.22, 0.73, -0.42, 0.35, 0.81, -0.55, 0.18, 0.44, -0.19, 0.62, -0.38].map((v, i) => (
                    <div 
                      key={i} 
                      className={`h-7 px-2.5 rounded font-mono text-[10px] flex items-center justify-center text-white ${
                        v >= 0 ? 'bg-brand-primary' : 'bg-brand-accent'
                      }`}
                      style={{ opacity: 0.4 + Math.abs(v) * 0.6 }}
                    >
                      {v.toFixed(1)}
                    </div>
                  ))}
                  <div className="h-7 px-2.5 rounded font-mono text-[10px] flex items-center justify-center bg-zinc-400 text-white">
                    ... + 756 dims
                  </div>
                </div>
              </div>

              {/* Hands-on Interactive Softmax Calculator */}
              <div className="bg-paper-bg rounded-xl border border-line-border p-5">
                <div className="flex items-center justify-between border-b border-line-soft pb-3 mb-4">
                  <div>
                    <span className="text-xs font-bold text-brand-primary block">
                      🎛️ 직접 원점수(Logits) 미세 제어기
                    </span>
                    <span className="text-[10px] text-muted-text">
                      슬라이더를 움직여 다른 도메인의 점수를 인위적으로 높여보세요! 실시간으로 요리저리 요동치며 퍼센트(Softmax) 가중 분배가 일어나는 것을 목격할 수 있습니다.
                    </span>
                  </div>
                  <button 
                    onClick={() => setUserLogitOffsets({})}
                    className="text-[10px] font-bold bg-white text-ink border border-line-border px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer hover:bg-zinc-50"
                  >
                    <RefreshCw className="w-3 h-3 text-brand-accent" /> 점수 초기화
                  </button>
                </div>

                <div className="space-y-4">
                  {currentSoftmaxList.map((domain, index) => {
                    const originalRaw = activeScenario.domains.find(d => d.name === domain.name);
                    const baseLogitVal = originalRaw?.logit || 0;
                    const offsetVal = userLogitOffsets[domain.name] || 0;

                    const handleLogitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                      const newOffset = parseFloat(e.target.value) - baseLogitVal;
                      setUserLogitOffsets(prev => ({
                        ...prev,
                        [domain.name]: newOffset
                      }));
                    };

                    const isFirstChoice = index === 0;

                    return (
                      <div key={domain.name} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border ${
                        isFirstChoice ? 'bg-brand-accent-soft/20 border-brand-accent/30' : 'bg-white border-line-soft'
                      }`}>
                        
                        {/* Domain name text */}
                        <div className="w-full sm:w-44 shrink-0">
                          <span className={`text-xs font-bold flex items-center gap-1 ${
                            isFirstChoice ? 'text-brand-accent-deep' : 'text-ink-2'
                          }`}>
                            {isFirstChoice && <Sparkles className="w-3.5 h-3.5 text-brand-accent shrink-0 animate-bounce" />}
                            {domain.name}
                          </span>
                        </div>

                        {/* Interactive 원점수 slider input */}
                        <div className="flex-1 flex items-center gap-2.5">
                          <span className="text-[10px] font-mono text-muted-text w-9 text-right">
                            로짓 {domain.logit.toFixed(1)}
                          </span>
                          <input 
                            type="range"
                            min="-3"
                            max="8"
                            step="0.5"
                            value={domain.logit}
                            onChange={handleLogitChange}
                            className="flex-1 h-3 rounded-full accent-brand-accent cursor-pointer"
                          />
                        </div>

                        {/* Percent values output */}
                        <div className="w-20 shrink-0 text-right">
                          <span className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded ${
                            isFirstChoice ? 'bg-brand-accent text-white' : 'bg-paper-darker text-muted-text'
                          }`}>
                            {(domain.prob * 100).toFixed(1)}%
                          </span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ============ STAGE 4: SLOT STRUCTURES ============ */}
          {activeStageIndex === 3 && (
            <div id="section-view-4" className="bg-card-white border border-line-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
              
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-text mb-2 flex items-center gap-1.5">
                  <span>4.1 카테고리별 슬롯 템플릿 서랍 채우기</span>
                  <HelpCircle className="w-3.5 h-3.5 text-brand-accent cursor-pointer" onClick={() => openGlossary('slot')} />
                </h4>
                <p className="text-xs text-ink-2 mb-4">
                  선정된 카테고리에 맞는 전용 빈칸 카드집이 펼쳐집니다. 인공지능 탐사선은 각 빈칸 명칭 서랍칸을 채울
                  어울리는 고득점 단어 후보들을 모읍니다. 아래 서랍 구조에서 빈칸 단어를 확인해 보세요.
                </p>
              </div>

              <div className="bg-brand-primary text-white p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-brand-accent-soft" />
                  <span className="text-sm font-extrabold">활성화 서식:</span>
                  <span className="bg-white/10 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {activeScenario.slotsTemplate.domain} 템플릿
                  </span>
                </div>
                <span className="text-[10px] font-mono opacity-80 uppercase">Template Plate</span>
              </div>

              {/* Horizontal slots guide rendering */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 bg-paper-bg rounded-xl border border-line-soft">
                {activeScenario.slotsTemplate.slots.map((s, idx) => {
                  return (
                    <React.Fragment key={idx}>
                      <div className="flex flex-col items-center gap-1.5 bg-card-white border-2 border-dashed border-brand-accent p-4 rounded-xl shadow-sm text-center w-full max-w-[170px]">
                        <span className="text-[9px] font-mono text-brand-accent-deep font-bold bg-brand-accent-soft px-2 py-0.5 rounded">
                          {s.slotName} 슬롯
                        </span>
                        <span className="text-sm font-extrabold text-ink mt-1 font-mono">{s.value}</span>
                        <span className="text-[9px] text-brand-ok font-bold uppercase flex items-center gap-0.5 mt-1">
                          <Check className="w-2.5 h-2.5" /> 후보 확정자
                        </span>
                      </div>
                      {idx < activeScenario.slotsTemplate.slots.length - 1 && (
                        <span className="text-muted-text font-bold text-lg hidden sm:inline">＋</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Candidate Distribution rows */}
              <div className="space-y-4">
                <span className="block text-xs font-bold text-muted-text uppercase border-b border-line-soft pb-2">
                   각 슬롯별 대본 단어 후보 확률 분포
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeScenario.slotsTemplate.slots.map((sField, sIdx) => (
                    <div key={sIdx} className="bg-paper-bg border border-line-border rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <span className="block text-[10px] font-mono font-bold text-brand-accent-deep bg-brand-accent-soft/45 px-2 py-1 rounded text-center mb-3">
                          {sField.slotName} 슬롯 내부
                        </span>
                        
                        <div className="space-y-2.5">
                          {sField.candidates.map((cand, cIdx) => {
                            const isSelectedOption = cIdx === 0;
                            return (
                              <div key={cIdx} className="flex flex-col gap-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className={`font-mono truncate ${isSelectedOption ? 'font-extrabold text-brand-primary' : 'text-zinc-600'}`}>
                                    {cand.name}
                                  </span>
                                  <span className="font-mono text-[10px] font-bold">{(cand.prob * 100).toFixed(0)}%</span>
                                </div>
                                <div className="bg-line-soft h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      isSelectedOption ? 'bg-brand-primary' : 'bg-zinc-400'
                                    }`}
                                    style={{ width: `${cand.prob * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="text-[9px] text-muted-text font-mono border-t border-line-soft pt-2 mt-4 text-center">
                        최종 전방 출격어: <strong>"{sField.value}"</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ============ STAGE 5: SPAN EXTRACTION ============ */}
          {activeStageIndex === 4 && (
            <div id="section-view-5" className="bg-card-white border border-line-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
              
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-text mb-2 flex items-center gap-1.5">
                  <span>5.1 핵심 키워드 오려내기 (BIO Classification)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-brand-accent cursor-pointer" onClick={() => openGlossary('bio')} />
                </h4>
                <p className="text-xs text-ink-2 mb-4 leading-relaxed">
                  대화 안에 산발적으로 흩어진 조사, 접속사, 사담 등을 기계적으로 제외하고 가위질 명사구만 골라내기 위해 딱지(BIO)를 전개합니다. 
                  <strong> 아래 임계값 슬라이더를 마구 움직여보세요!</strong> 점수가 해당 수치 미만인 단어는 흐려지며 즉시 오려내기 검출망에서 사면 제외 탈락 처리됩니다!
                </p>
              </div>

              {/* Slider Controller */}
              <div className="bg-paper-bg rounded-xl border border-line-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-accent shrink-0" />
                  <span className="text-xs font-bold text-ink-2">
                     검출 거름 임계값 (Keyword Cutoff):
                  </span>
                </div>
                <div className="flex-1 w-full flex items-center gap-3">
                  <input 
                    type="range"
                    min="10"
                    max="95"
                    step="5"
                    value={bioThreshold * 100}
                    onChange={(e) => setBioThreshold(parseFloat(e.target.value) / 100)}
                    className="flex-1 h-3 rounded-full accent-brand-accent cursor-pointer"
                  />
                  <span className="bg-brand-accent text-white font-mono text-xs font-extrabold px-3 py-1.5 rounded-lg min-w-[64px] text-center shadow-sm">
                    {bioThreshold.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* BIO Tagged sentence stream visualization */}
              <div>
                <span className="block text-[10px] font-mono font-bold uppercase text-muted-text mb-2">
                  대사 어근별 BIO 배정 판독표 (마우스를 올리거나 터치하면 세부 상태가 표기됩니다)
                </span>
                
                <div className="flex flex-wrap gap-2.5 p-4 bg-paper-bg rounded-xl border border-line-soft leading-relaxed">
                  {activeScenario.spanTokens.map((tok, idx) => {
                    const isPassed = tok.score >= bioThreshold;
                    const isB = tok.bio === 'B';
                    const isI = tok.bio === 'I';
                    const isO = tok.bio === 'O';

                    let styleClass = 'opacity-40 bg-zinc-100 text-zinc-400 border-zinc-200';
                    if (isPassed) {
                      if (isB) styleClass = 'bg-brand-accent/25 text-brand-accent-deep border-brand-accent/40 font-bold';
                      else if (isI) styleClass = 'bg-brand-accent/10 text-brand-accent-deep border-brand-accent/20 border-dashed';
                      else styleClass = 'bg-card-white text-zinc-500 border-line-border';
                    }

                    return (
                      <div
                        key={idx}
                        className={`group relative px-2.5 py-1.5 rounded border text-xs font-mono transition-all ${styleClass}`}
                      >
                        <span>{tok.text}</span>
                        
                        {/* Interactive floating score badges */}
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-ink text-white text-[8px] font-mono px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                          {tok.bio} {tok.score.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Screen outcome lists */}
              <div className="space-y-3">
                <span className="block text-[10px] font-mono font-bold uppercase text-muted-text">
                   최종 가위판 가위질 오려내기 명단 (임계값 {bioThreshold.toFixed(2)} 기준)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {activeScenario.spanCandidates.map((cand) => {
                    const isAlive = cand.score >= bioThreshold;
                    return (
                      <div 
                        key={cand.name} 
                        className={`p-3 rounded-lg border flex flex-col justify-between gap-1.5 transition-all ${
                          isAlive 
                            ? 'bg-brand-accent-soft/20 border-brand-accent text-brand-accent-deep font-bold shadow-sm' 
                            : 'bg-zinc-100 border-zinc-200 text-zinc-400 line-through opacity-40'
                        }`}
                      >
                        <span className="text-xs truncate">{cand.name}</span>
                        <div className="flex items-center justify-between text-[9px] font-mono">
                          <span>점수 {cand.score.toFixed(2)}</span>
                          <span className={`font-bold uppercase ${isAlive ? 'text-brand-accent' : 'text-zinc-400'}`}>
                            {isAlive ? '합격' : '제외'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ============ STAGE 6: EMBEDDING SIMILARITY ============ */}
          {activeStageIndex === 5 && (
            <div id="section-view-6" className="bg-card-white border border-line-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
              
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-text mb-2 flex items-center gap-1.5">
                  <span>6.1 다차원 뜻풀이 공간과 유사도 연산</span>
                  <HelpCircle className="w-3.5 h-3.5 text-brand-accent cursor-pointer" onClick={() => openGlossary('cosine')} />
                </h4>
                <p className="text-xs text-ink-2 mb-4 leading-relaxed">
                  자른 단어들 중 뜻이 매우 근소하게 겹치는(유사도가 거장 높은) 단어가 있다면 
                  OR로 묶어야 합니다(예: '공영주차장'과 '주차장'). 
                  <strong> 좌측 2차원 공간 속 원 점을 클릭해 보세요.</strong> 우측 매트릭스 계산 결과표와 기계의 합치 판정이 연동되어 나타납니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* SVG Embedding coordinates scatter view */}
                <div className="md:col-span-7 bg-paper-bg border border-line-border rounded-xl p-4 overflow-hidden relative">
                  <div className="absolute top-2 left-2 text-[8px] uppercase tracking-wider text-muted-text font-mono bg-white px-2 py-0.5 border border-line-border rounded">
                     2D UMAP 차원 축소 평면
                  </div>

                  <svg viewBox="0 0 500 380" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
                    {/* Grid Lines */}
                    {[50, 100, 150, 200, 250, 300, 350, 400, 450].map(x => (
                      <line key={x} x1={x} y1={0} x2={x} y2={380} stroke="#D8D2CB" strokeWidth="1" />
                    ))}
                    {[50, 100, 150, 200, 250, 300, 350].map(y => (
                      <line key={y} x1={0} y1={y} x2={500} y2={y} stroke="#D8D2CB" strokeWidth="1" />
                    ))}

                    {/* Draw dotted clusters around slot locations */}
                    {activeScenario.embPoints.some(pt => pt.slot === '시설/서비스') && (
                      <g>
                        <ellipse cx="365" cy="145" rx="75" ry="65" fill="#CB997E" fillOpacity="0.06" stroke="#CB997E" strokeWidth="1.5" strokeDasharray="4 3" />
                        <text x="365" y="70" textAnchor="middle" fill="#CB997E" className="font-mono text-[9px] font-bold">{"{시설/서비스}"}</text>
                      </g>
                    )}
                    {activeScenario.embPoints.some(pt => pt.slot === '음식종류') && (
                      <g>
                        <ellipse cx="400" cy="135" rx="55" ry="45" fill="#CB997E" fillOpacity="0.06" stroke="#CB997E" strokeWidth="1.5" strokeDasharray="4 3" />
                        <text x="400" y="80" textAnchor="middle" fill="#CB997E" className="font-mono text-[9px] font-bold">{"{음식종류/메뉴}"}</text>
                      </g>
                    )}
                    {activeScenario.embPoints.some(pt => pt.slot === '시설/목적') && (
                      <g>
                        <ellipse cx="370" cy="120" rx="55" ry="45" fill="#CB997E" fillOpacity="0.06" stroke="#CB997E" strokeWidth="1.5" strokeDasharray="4 3" />
                        <text x="370" y="65" textAnchor="middle" fill="#CB997E" className="font-mono text-[9px] font-bold">{"{시설/목적}"}</text>
                      </g>
                    )}

                    {/* Nodes Scatter drawing */}
                    {activeScenario.embPoints.map((pt) => {
                      const isTarget = pt.name === selectedEmbPoint;
                      const getThemeColor = (c: string) => {
                        const l = c.toLowerCase();
                        if (l === '#2e5c8a') return '#6B705C';
                        if (l === '#5b86b3') return '#A5A58D';
                        if (l === '#d97757') return '#CB997E';
                        if (l === '#8a8a8a') return '#B7B7A4';
                        return c;
                      };
                      const ptColor = getThemeColor(pt.color);
                      return (
                        <g 
                          key={pt.name} 
                          onClick={() => setSelectedEmbPoint(pt.name)}
                          className="cursor-pointer group"
                        >
                          <circle 
                            cx={pt.x} 
                            cy={pt.y} 
                            r={isTarget ? 9 : 6} 
                            fill={ptColor} 
                            stroke="#ffffff" 
                            strokeWidth="2"
                            className="transition-all duration-300 transform group-hover:scale-125"
                          />
                          {isTarget && (
                            <circle 
                              cx={pt.x} 
                              cy={pt.y} 
                              r="15" 
                              fill="none" 
                              stroke={ptColor} 
                              strokeWidth="1.5" 
                              strokeDasharray="2 2"
                              className="animate-spin"
                            />
                          )}
                          <text 
                            x={pt.x + 11} 
                            y={pt.y + 4} 
                            className="font-mono text-[10px] font-semibold text-ink pointer-events-none fill-current select-none"
                          >
                            {pt.name}
                          </text>
                        </g>
                      );
                    })}

                    <text x="12" y="370" className="font-mono text-[9px] text-zinc-400">UMAP DIMENSION 1</text>
                    <text x="12" y="16" className="font-mono text-[9px] text-zinc-400">UMAP DIMENSION 2</text>
                  </svg>
                </div>

                {/* Similarity inspect matrices lists */}
                <div className="md:col-span-5 bg-paper-bg border border-line-border rounded-xl p-4 flex flex-col justify-between self-stretch">
                  <div>
                    <div className="border-b border-line-soft pb-2 mb-3">
                      <span className="text-[10px] font-mono font-bold text-brand-primary uppercase block">
                         코사인 의미 유사도 & 슬롯 매치
                      </span>
                      <span className="text-xs font-bold text-ink-2 mt-1">
                        선택된 기점어: <strong>"{selectedEmbPoint}"</strong>
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activeScenario.simPairs
                        .filter(pair => pair.a === selectedEmbPoint || pair.b === selectedEmbPoint)
                        .map((pair, pIdx) => {
                          const otherName = pair.a === selectedEmbPoint ? pair.b : pair.a;
                          return (
                            <div key={pIdx} className={`p-2 rounded flex items-center justify-between text-xs font-mono border ${
                              pair.yes ? 'bg-brand-ok-soft/30 border-brand-ok' : 'bg-white border-line-soft'
                            }`}>
                              <span className="font-bold text-ink-2">{otherName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-muted-text">cos {pair.cos.toFixed(2)}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                  pair.yes ? 'bg-brand-ok text-white' : 'bg-zinc-200 text-zinc-500'
                                }`}>
                                  {pair.yes ? 'OR 병합(✓)' : '분리'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div className="bg-card-white border border-line-soft p-3 rounded-lg text-[10px] leading-relaxed mt-4">
                    <span className="text-brand-accent font-bold block mb-1">💡 합병 성사 공식 가이드:</span>
                    뜻의 코사인 일치율이 <strong>0.75 이상</strong>이면서 양측 단어가 <strong>동일한 슬롯</strong>에 속하는 경우에만 OR(|)로 깔끔하게 묶어 불필요한 단어 나열을 막습니다!
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ============ STAGE 7: BEAM SEARCH / DECODING ============ */}
          {activeStageIndex === 6 && (
            <div id="section-view-7" className="bg-card-white border border-line-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
              
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-text mb-2 flex items-center gap-1.5">
                  <span>7.1 유망주 가지치기 디코더 트리 (Beam Search Visualizer)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-brand-accent cursor-pointer" onClick={() => openGlossary('beam')} />
                </h4>
                <p className="text-xs text-ink-2 mb-4 leading-relaxed">
                  자, 드디어 대미를 장식할 시간입니다! 디코더가 최종 검색어로 번역해 낼 때, 
                  매 순간 가장 유력한 상위 3가지 샛길(Beam=3)만 살리는 합리적인 나침반 구조를 한눈에 보여줍니다. 
                  가장 두껍고 진하게 엮인 <strong>주황색 하이라이트 코스</strong>가 최종 1등이자 우리의 목적지입니다.
                </p>
              </div>

              {/* Interactive SVG tree graph display */}
              <div className="bg-paper-bg border border-line-border rounded-xl p-4 overflow-x-auto">
                <svg viewBox="0 0 1000 380" className="w-[1000px] h-[380px] block" xmlns="http://www.w3.org/2000/svg">
                  {/* Drawing levels label headers */}
                  {activeScenario.beamLevels.map((lvl) => (
                    <g key={lvl.label}>
                      <text x={lvl.x} y={22} textAnchor="middle" className="font-mono text-[10px] fill-zinc-400 font-bold tracking-wider uppercase">
                        {lvl.label}
                      </text>
                      <line x1={lvl.x} y1={30} x2={lvl.x} y2={350} stroke="#D8D2CB" strokeWidth="1" strokeDasharray="2 2" />
                    </g>
                  ))}

                  {/* Draw connecting curves (Edges) */}
                  {activeScenario.beamLevels.slice(0, 3).map((lvl, lIdx) => {
                    const nextLevel = activeScenario.beamLevels[lIdx + 1];
                    return (
                      <g key={lIdx}>
                        {nextLevel.nodes.map((nextNode) => {
                          const parentNode = lvl.nodes.find(pn => pn.id === nextNode.parent);
                          if (!parentNode) return null;

                          const x1 = lvl.x + 55;
                          const y1 = parentNode.y + 16;
                          const x2 = nextLevel.x - 55;
                          const y2 = nextNode.y + 16;
                          const cpX = (x1 + x2) / 2;

                          const isHighlightedRoute = parentNode.top && nextNode.top;

                          return (
                            <path 
                              key={nextNode.id}
                              d={`M ${x1} ${y1} C ${cpX} ${y1}, ${cpX} ${y2}, ${x2} ${y2}`}
                              className="fill-none transition-all duration-300"
                              stroke={isHighlightedRoute ? '#CB997E' : '#D8D2CB'}
                              strokeWidth={isHighlightedRoute ? '3' : '1.5'}
                            />
                          );
                        })}
                      </g>
                    );
                  })}

                  {/* Nodes drawing */}
                  {activeScenario.beamLevels.map((lvl, lIdx) => {
                    const isFinalLevel = lIdx === 3;
                    const w = isFinalLevel ? 150 : 110;
                    const h = 32;

                    return (
                      <g key={lvl.label}>
                        {lvl.nodes.map((node) => {
                          return (
                            <g 
                              key={node.id} 
                              className={`transition-all duration-300 ${
                                node.top ? 'text-white' : 'text-zinc-500'
                              }`}
                            >
                              <rect 
                                x={lvl.x - w / 2} 
                                y={node.y} 
                                width={w} 
                                height={h} 
                                rx="6"
                                fill={node.top ? '#CB997E' : '#ffffff'}
                                stroke={node.top ? '#6B705C' : '#D8D2CB'}
                                strokeWidth="1.5"
                                className="shadow-sm"
                              />
                              
                              {/* Inside Title Text */}
                              <text 
                                x={lvl.x} 
                                y={node.y + 14} 
                                textAnchor="middle" 
                                className={`font-mono text-[10px] select-none ${
                                  node.top ? 'fill-white font-extrabold' : 'fill-zinc-800'
                                }`}
                              >
                                {node.text}
                              </text>

                              {/* Probe numeric log values */}
                              <text 
                                x={lvl.x} 
                                y={node.y + 26} 
                                textAnchor="middle" 
                                className={`font-mono text-[8px] select-none ${
                                  node.top ? 'fill-orange-100' : 'fill-zinc-400'
                                }`}
                              >
                                {isFinalLevel ? `Final 1st Rank` : `log P = ${node.prob.toFixed(2)}`}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Final N-Best Queries lists with visual ratios */}
              <div className="space-y-3">
                <span className="block text-[10px] font-mono font-bold uppercase text-muted-text">
                   최종 산출된 상위 5대 제로쿼리 리스트 (N-Best List)
                </span>

                <div className="space-y-2.5">
                  {activeScenario.nbest.map((item, idx) => {
                    const isTopOne = idx === 0;
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between p-3 rounded-lg border text-xs font-mono transition-all ${
                          isTopOne 
                            ? 'bg-brand-accent-soft/30 border-brand-accent shadow-sm' 
                            : 'bg-paper-bg border-line-soft'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                            isTopOne ? 'bg-brand-accent text-white' : 'bg-zinc-200 text-zinc-500'
                          }`}>
                            #{item.rank}
                          </span>
                          <span className={`font-mono ${isTopOne ? 'font-extrabold text-brand-accent-deep' : 'text-zinc-700'}`}>
                            {item.query}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-500 text-[10px]">확률 {item.prob.toFixed(2)}</span>
                          <span className="font-bold text-zinc-800">log P={item.logProb.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 7.2 로그 확률 (log P) 심층 해부 & 실시간 덧셈 체험기 */}
              <div className="border border-line-soft bg-paper-bg p-5 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-brand-primary text-white text-[10px] uppercase font-mono px-2 py-0.5 rounded font-black">
                     비전공자 수학 탐구
                  </span>
                  <h5 className="text-xs font-bold text-ink-2">
                     7.2 로그 확률(log P)의 정체와 탄생 비화
                  </h5>
                </div>
                
                <p className="text-xs text-zinc-650 leading-relaxed">
                  위 트리와 목록의 <strong>log P = -0.41</strong> 혹은 <strong>-1.94</strong> 같은 음수 점수들이 어떻게 도출되는지 궁금하셨나요?
                  언어 모델이 단어들을 연속으로 생성해 나갈 때, 각각의 단어가 나올 확률 $P$를 계속 <strong>곱해서</strong> 최종 시퀀스 확률을 구하고 이것으로 최적의 단어 조합 후보들을 줄 세웁니다.
                </p>

                {/* Interactive Slider Unit */}
                <div className="bg-white p-4 rounded-lg border border-line-soft space-y-4 shadow-sm">
                  <span className="block text-[11px] font-bold text-brand-primary">
                    🎛️ 단어별 확률($P$) 가상 조절 슬라이더
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Token 1 */}
                    <div className="space-y-1 bg-paper-bg/55 p-2 rounded border border-line-soft/45">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-zinc-600">첫 단어 P₁</span>
                        <span className="font-bold text-brand-primary">{(calcP1 * 100).toFixed(0)}% ({calcP1.toFixed(2)})</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.01" 
                        max="1.00" 
                        step="0.01"
                        value={calcP1} 
                        onChange={(e) => setCalcP1(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                      />
                      <div className="text-[10px] font-mono text-zinc-400 text-right">
                        log P₁ = {Math.log(calcP1).toFixed(2)}
                      </div>
                    </div>

                    {/* Token 2 */}
                    <div className="space-y-1 bg-paper-bg/55 p-2 rounded border border-line-soft/45">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-zinc-600">두번째 P₂</span>
                        <span className="font-bold text-brand-primary">{(calcP2 * 100).toFixed(0)}% ({calcP2.toFixed(2)})</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.01" 
                        max="1.00" 
                        step="0.01"
                        value={calcP2} 
                        onChange={(e) => setCalcP2(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                      />
                      <div className="text-[10px] font-mono text-zinc-400 text-right">
                        log P₂ = {Math.log(calcP2).toFixed(2)}
                      </div>
                    </div>

                    {/* Token 3 */}
                    <div className="space-y-1 bg-paper-bg/55 p-2 rounded border border-line-soft/45">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-zinc-600">세번째 P₃</span>
                        <span className="font-bold text-brand-primary">{(calcP3 * 100).toFixed(0)}% ({calcP3.toFixed(2)})</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.01" 
                        max="1.00" 
                        step="0.01"
                        value={calcP3} 
                        onChange={(e) => setCalcP3(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                      />
                      <div className="text-[10px] font-mono text-zinc-400 text-right">
                        log P₃ = {Math.log(calcP3).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Math calculation outcome comparison */}
                  <div className="mt-4 pt-3 border-t border-line-soft grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pure Multiplicative Case */}
                    <div className="p-3 bg-red-50/40 border border-red-100 rounded-lg space-y-1">
                      <div className="text-[10px] font-sans font-bold text-zinc-500 uppercase">
                        방식 ①: 표준 확률 연속 곱셈 연산
                      </div>
                      <div className="text-xs font-mono text-zinc-800">
                        {calcP1.toFixed(2)} × {calcP2.toFixed(2)} × {calcP3.toFixed(2)} =
                      </div>
                      <div className="text-base font-black text-brand-accent-deep">
                        {(calcP1 * calcP2 * calcP3).toFixed(4)} <span className="text-[10px] font-normal text-zinc-500">({((calcP1 * calcP2 * calcP3) * 100).toFixed(2)}%)</span>
                      </div>
                      <span className="block text-[10px] text-zinc-500 leading-snug">
                        ⚠️ 단어 수가 20~30개로 대폭 늘어나면 무조건적인 0과 1사이 소수 곱셈에 의해 최종값이 <strong>0.000000...</strong> 수준으로 찌그러져 컴퓨터 연산 오차로 유실되는 '언더플로우'에 직면합니다!
                      </span>
                    </div>

                    {/* Logarithmic Addition Case */}
                    <div className="p-3 bg-brand-soft/40 border border-brand-primary/20 rounded-lg space-y-1">
                      <div className="text-[10px] font-sans font-bold text-zinc-650 uppercase">
                        방식 ②: 로그 변환 덧셈 연산 (실제 사용)
                      </div>
                      <div className="text-xs font-mono text-zinc-800">
                        {Math.log(calcP1).toFixed(2)} + ({Math.log(calcP2).toFixed(2)}) + ({Math.log(calcP3).toFixed(2)}) =
                      </div>
                      <div className="text-base font-black text-brand-primary">
                        {(Math.log(calcP1) + Math.log(calcP2) + Math.log(calcP3)).toFixed(2)}
                      </div>
                      <span className="block text-[10px] text-zinc-650 leading-snug">
                        ✨ 로그 변형 공식에 따라 <strong>소수 곱셈이 음수의 덧셈 연산으로 변신</strong>하여 안정적인 연산이 가능합니다!
                        이 <strong>누적 로그 덧셈 결과치(log P)</strong>가 바로 위의 빔 탐색 트리에 각 노드 박스마다 기재되어 있는 등급 점수입니다!
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Math Explanation */}
                <div className="text-[11px] text-zinc-600 space-y-2 leading-relaxed bg-white/60 p-3.5 rounded-lg border border-line-soft">
                  <span className="font-bold text-ink block">📋 핵심 요약 및 기호 읽는 법</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[10px]">
                    <div className="p-2.5 bg-paper-bg rounded space-y-1">
                      <div className="font-bold text-brand-primary">1. 왜 항상 음수(-)가 나오나요?</div>
                      <p className="text-zinc-500 leading-snug font-sans font-medium">
                        언어 모델에서의 확률 P는 언제나 0과 1 사이 소수값입니다. 1보다 작은 수의 로그값은 수학 성질상 항상 음수로 연산되기 때문입니다.
                      </p>
                    </div>
                    <div className="p-2.5 bg-paper-bg rounded space-y-1">
                      <div className="font-bold text-brand-primary">2. 음수 점수 해독 밀도표</div>
                      <ul className="text-zinc-500 list-disc list-inside space-y-0.5 font-sans font-medium">
                        <li><strong>0.00</strong> = 확률 100% (완전한 확신)</li>
                        <li><strong>-0.69</strong> = 확률 50% (절반의 확률)</li>
                        <li><strong>-2.30</strong> = 확률 10% (다소 드문 가설)</li>
                        <li><strong>-4.61</strong> = 확률 1% (거의 불가능)</li>
                      </ul>
                    </div>
                  </div>
                  <p className="italic font-sans text-zinc-500 text-[10px] mt-2">
                    즉, 빔 서치는 최고 확률 단어 경로들을 조립할 때 계속해서 이 음수 감점 마일리지(log P)를 벌금처럼 더해 나가며 수색하다가, <strong>최종적으로 벌금이 가장 적은(0에 최대한 아슬아슬하게 가까운 최대값의 음수를 가진) 문장</strong>을 1등 당선작으로 수립하게 됩니다.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* GLOBAL INSIGHT PANEL - FOR HIGHLIGHTING STAGE LESSONS */}
          <div className="bg-ink text-paper-bg rounded-xl p-6 shadow-md" id="stage-insight-box">
            <span className="block text-[10px] font-mono tracking-wider font-bold text-brand-accent uppercase mb-3">
               STAGE 0{activeStageIndex + 1} 핵심 한 줄 정리:
            </span>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-200 leading-relaxed list-disc list-inside">
              <li>{activeScenario.insightList[activeStageIndex]}</li>
              {activeStageIndex === 0 && (
                <li>모델이 이해하는 영도 의미는 글자가 아닌 768개의 가중치 숫자로, 뜻이 겹칠수록 밀실 공간의 거리가 좁혀집니다.</li>
              )}
              {activeStageIndex === 2 && (
                <li>슬라이더를 통해 원점수를 바꾸면, 소프트맥스 필터가 전체 비율 합 100%를 무너지게 두지 않고 민첩하게 타협하는 모습을 볼 수 있습니다.</li>
              )}
              {activeStageIndex === 4 && (
                <li>임계값을 적정선(0.50 내외) 이하로 내리게 되면, 불필요한 사소한 어휘가 마구잡이로 검출되어 검색 쿼리가 가득 차서 어지러워집니다.</li>
              )}
            </ul>
          </div>

        </section>

        {/* SIDEBAR EXPLANATION COLUMN (4 cols on large screens) */}
        <aside className="lg:col-span-4 flex flex-col gap-6 w-full lg:sticky lg:top-[74px]">
          
          {/* SPECIAL DICTIONARY DRAWER / PANEL */}
          <div className="bg-card-white border border-line-border rounded-xl p-5 shadow-sm" id="glossary-explorer">
            <div className="flex items-center gap-2 mb-3 border-b border-line-soft pb-2.5">
              <BookOpen className="w-4.5 h-4.5 text-brand-accent shrink-0" />
              <h4 className="text-sm font-bold tracking-tight text-ink flex items-center justify-between w-full">
                <span>쉽게 풀어보는 용어 사전</span>
                <span className="text-[10px] font-mono text-brand-primary bg-brand-soft px-2 py-0.5 rounded">
                  Glossaries
                </span>
              </h4>
            </div>

            <p className="text-xs text-ink-2 mb-4 leading-relaxed">
              본 가이드 내부의 밑줄 혹은 의문 기호들을 터치해 보세요. 복잡해 보이는 기계학습의 어려운 개념을 친절하고 재밌는 비유와 함께 즉시 해부해 드립니다.
            </p>

            {/* Quick selectors list for and dictionary terms */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5 mb-5">
              {Object.keys(GLOSSARY_TERMS).map((key) => (
                <button
                  key={key}
                  onClick={() => openGlossary(key)}
                  className={`px-2.5 py-1.5 rounded text-[11px] font-mono border text-left truncate cursor-pointer transition-all ${
                    selectedGlossary === key 
                      ? 'bg-brand-accent-soft text-brand-accent-deep border-brand-accent font-bold' 
                      : 'bg-paper-bg border-line-soft text-zinc-600 hover:bg-line-soft hover:text-ink'
                  }`}
                >
                  {GLOSSARY_TERMS[key].title.split(' (')[0]}
                </button>
              ))}
            </div>

            {/* Selected glossary detail view */}
            {selectedGlossary ? (
              <div className="bg-brand-accent-soft/10 border border-brand-accent/20 rounded-xl p-4 transition-all">
                <span className="text-[9px] font-mono text-brand-accent-deep font-bold bg-brand-accent-soft px-2 py-0.5 rounded">
                  {GLOSSARY_TERMS[selectedGlossary].subtitle}
                </span>
                
                <h5 className="text-xs font-black text-ink mt-2">
                  {GLOSSARY_TERMS[selectedGlossary].title}
                </h5>

                <p className="text-xs text-ink-2 leading-relaxed mt-2.5">
                  {GLOSSARY_TERMS[selectedGlossary].explanation}
                </p>

                <div className="mt-3.5 pt-3.5 border-t border-brand-accent/25 bg-white p-2.5 rounded text-xs select-none">
                  <span className="font-extrabold text-brand-accent-deep block mb-1">📢 비전공자 전용 비유:</span>
                  <p className="text-xs leading-relaxed italic text-zinc-700">
                    {GLOSSARY_TERMS[selectedGlossary].metaphor}
                  </p>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-line-border rounded-xl p-6 text-center text-xs text-muted-text">
                <Info className="w-5 h-5 text-brand-primary mx-auto mb-2" />
                용어를 골라 유쾌한 해설을 확인해 보세요.
              </div>
            )}
          </div>

          {/* ENTIRE PIPELINE DIAGRAM OVERCOME */}
          <div className="bg-card-white border border-line-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-line-soft pb-2.5 mb-3">
              <Compass className="w-4 h-4 text-brand-primary" />
              <span className="text-xs font-bold text-ink">전체 변환 파이프라인 개요</span>
            </div>

            <div className="space-y-2 text-xs">
              {STAGES_LIST.map((lvl, index) => {
                const isActive = activeStageIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveStageIndex(index)}
                    className={`w-full text-left p-2.5 rounded border transition-all cursor-pointer flex items-center justify-between gap-2 border-dashed ${
                      isActive 
                        ? 'bg-brand-primary/15 border-brand-primary text-brand-primary font-bold shadow-sm' 
                        : 'bg-paper-bg border-line-border hover:bg-line-soft text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-white border border-line-border w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <span>{lvl.title}</span>
                    </div>
                    {isActive ? (
                      <span className="text-[9px] bg-brand-primary text-white font-mono px-1.5 py-0.5 rounded tracking-widest uppercase">
                        ACTIVE
                      </span>
                    ) : (
                      <ArrowRight className="w-3 h-3 text-zinc-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* EDUCATIONAL CREDITS / FOOTER CARDS */}
          <div className="bg-paper-darker border border-line-border rounded-xl p-4.5 text-xs text-zinc-600 leading-relaxed shadow-inner">
            <span className="font-bold block text-ink mb-1.5 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-brand-accent" /> 독자님을 위한 지질 조향 노트
            </span>
            인공지능 내부의 동작은 단순 신비가 아닙니다. 
            체계화된 수식 필터(토큰화, 어텐션 가중, 도메인 확률 벼리기, BIO 오려내기, 코사인 대각 비교 등)의 
            기계학적 약속 하에 가장 적절하고 환각이 제거된 실전 검색용 문장을 발굴해 드립니다.
          </div>

        </aside>

      </main>

      {/* 5. FOOTER */}
      <footer className="bg-white border-t border-line-border py-8 text-center text-xs text-muted-text font-mono mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>
            © 2026-05-28 · 제로쿼리 추출 Deep Dive 시각화 가이드
          </span>
          <div className="flex items-center gap-3">
            <span className="bg-paper-darker px-2 py-1 rounded text-zinc-500">
              비전공자 전용 특화 빌드
            </span>
            <span>All values simulated based on production LLM architecture</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
