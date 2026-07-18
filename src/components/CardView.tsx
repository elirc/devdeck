import type { ReactNode } from 'react';
import type {
  Card,
  ClozeCard,
  Grade,
  MCQCard,
  PredictOutputCard,
  QACard,
  ReviewState,
  WorkedExampleCard,
} from '../types';
import { CARD_TYPE_LABELS } from '../types';
import { CodeBlock } from './CodeBlock';
import { GradeBar } from './GradeBar';
import { RichText } from './RichText';

const CLOZE_RE = /\{\{c\d+::([\s\S]*?)\}\}/g;

export function clozeHidden(code: string): string {
  return code.replace(CLOZE_RE, '___');
}

export function clozeRevealed(code: string): string {
  return code.replace(CLOZE_RE, '$1');
}

export function clozeAnswers(code: string): string[] {
  const re = new RegExp(CLOZE_RE.source, 'g');
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) out.push(m[1]);
  return out;
}

export interface CardViewProps {
  card: Card;
  state: ReviewState;
  revealed: boolean;
  stepIdx: number;
  mcqChoice: number | null;
  onReveal: () => void;
  onNextStep: () => void;
  onChoose: (index: number) => void;
  onGrade: (grade: Grade) => void;
}

function TypeChip({ card }: { card: Card }) {
  return <span className="type-chip">{CARD_TYPE_LABELS[card.type]}</span>;
}

function Explanation({ text }: { text: string }) {
  return (
    <p className="explanation">
      <RichText text={text} />
    </p>
  );
}

function PredictOutputView({
  card,
  revealed,
}: {
  card: PredictOutputCard;
  revealed: boolean;
}) {
  return (
    <>
      <p className="card-prompt">What does this output?</p>
      <CodeBlock code={card.code} language={card.language} />
      {revealed && (
        <div className="answer-area">
          <pre className="answer-block">{card.answer}</pre>
          <Explanation text={card.explanation} />
        </div>
      )}
    </>
  );
}

function ClozeView({ card, revealed }: { card: ClozeCard; revealed: boolean }) {
  return (
    <>
      <p className="card-prompt">Fill in the blank</p>
      <CodeBlock
        code={revealed ? clozeRevealed(card.code) : clozeHidden(card.code)}
        language={card.language}
      />
      {revealed && (
        <div className="answer-area">
          <div className="cloze-answers">
            {clozeAnswers(card.code).map((a, i) => (
              <code key={i} className="cloze-answer">
                {a}
              </code>
            ))}
          </div>
          <Explanation text={card.explanation} />
        </div>
      )}
    </>
  );
}

function WorkedExampleView({
  card,
  stepIdx,
}: {
  card: WorkedExampleCard;
  stepIdx: number;
}) {
  return (
    <>
      <h2 className="card-title">{card.title}</h2>
      <p className="card-prompt">
        <RichText text={card.prompt} />
      </p>
      {card.steps.slice(0, stepIdx + 1).map((step, i) => (
        <div key={i} className="we-step">
          <span className="we-step-num">Step {i + 1}</span>
          {step.code !== undefined && (
            <CodeBlock code={step.code} language={card.language} />
          )}
          <p className="we-step-text">
            <RichText text={step.text} />
          </p>
        </div>
      ))}
      {stepIdx >= card.steps.length - 1 && (
        <p className="we-selfgrade">How well did you predict the steps?</p>
      )}
    </>
  );
}

function QAView({ card, revealed }: { card: QACard; revealed: boolean }) {
  return (
    <>
      <p className="card-question">
        <RichText text={card.question} />
      </p>
      {revealed && (
        <div className="answer-area">
          <p className="qa-answer">
            <RichText text={card.answer} />
          </p>
        </div>
      )}
    </>
  );
}

function MCQView({
  card,
  choice,
  onChoose,
}: {
  card: MCQCard;
  choice: number | null;
  onChoose: (index: number) => void;
}) {
  return (
    <>
      <p className="card-question">
        <RichText text={card.question} />
      </p>
      {card.code !== undefined && card.language !== undefined && (
        <CodeBlock code={card.code} language={card.language} />
      )}
      <div className="mcq-choices">
        {card.choices.map((c, i) => {
          let cls = 'mcq-choice';
          if (choice !== null) {
            if (i === card.correctIndex) cls += ' correct';
            else if (i === choice) cls += ' incorrect';
            else cls += ' dimmed';
          }
          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={choice !== null}
              onClick={() => onChoose(i)}
            >
              <RichText text={c} />
            </button>
          );
        })}
      </div>
      {choice !== null && (
        <div className="answer-area">
          <p className={choice === card.correctIndex ? 'mcq-result right' : 'mcq-result wrong'}>
            {choice === card.correctIndex ? 'Correct' : 'Not quite'}
          </p>
          <Explanation text={card.explanation} />
        </div>
      )}
    </>
  );
}

/** True once the user can grade this card (answer is visible). */
export function isGradable(
  card: Card,
  revealed: boolean,
  stepIdx: number,
  mcqChoice: number | null
): boolean {
  switch (card.type) {
    case 'worked-example':
      return stepIdx >= card.steps.length - 1;
    case 'mcq':
      return mcqChoice !== null;
    default:
      return revealed;
  }
}

export function CardView(props: CardViewProps) {
  const { card, state, revealed, stepIdx, mcqChoice, onReveal, onNextStep, onChoose, onGrade } =
    props;

  const gradable = isGradable(card, revealed, stepIdx, mcqChoice);
  const suggested: Grade | undefined =
    card.type === 'mcq' && mcqChoice !== null
      ? mcqChoice === card.correctIndex
        ? 2
        : 0
      : undefined;

  let body: ReactNode = null;
  switch (card.type) {
    case 'predict-output':
      body = <PredictOutputView card={card} revealed={revealed} />;
      break;
    case 'cloze':
      body = <ClozeView card={card} revealed={revealed} />;
      break;
    case 'worked-example':
      body = <WorkedExampleView card={card} stepIdx={stepIdx} />;
      break;
    case 'qa':
      body = <QAView card={card} revealed={revealed} />;
      break;
    case 'mcq':
      body = <MCQView card={card} choice={mcqChoice} onChoose={onChoose} />;
      break;
  }

  let footer: ReactNode = null;
  if (gradable) {
    footer = <GradeBar state={state} onGrade={onGrade} suggested={suggested} />;
  } else if (card.type === 'worked-example') {
    footer = (
      <button type="button" className="primary-btn" onClick={onNextStep}>
        {stepIdx < 0 ? 'Start' : 'Next step'}
      </button>
    );
  } else if (card.type === 'mcq') {
    footer = <p className="footer-hint">Pick an answer</p>;
  } else {
    footer = (
      <button type="button" className="primary-btn" onClick={onReveal}>
        Reveal
      </button>
    );
  }

  return (
    <div className="card-view">
      <div className="card-body" onClick={!gradable && card.type !== 'mcq' && card.type !== 'worked-example' ? onReveal : undefined}>
        <TypeChip card={card} />
        {body}
      </div>
      <div className="card-footer">{footer}</div>
    </div>
  );
}
