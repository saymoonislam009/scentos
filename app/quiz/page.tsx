'use client';
import { useState } from 'react';
import Link from 'next/link';

const QUESTIONS = [
  { id: 'occasion', q: 'When do you wear fragrance most?', options: [{ v:'office',l:'Office & daily' },{ v:'date-night',l:'Evenings & dates' },{ v:'casual',l:'Weekends & casual' },{ v:'formal',l:'Special occasions' }] },
  { id: 'climate', q: 'Your climate?', options: [{ v:'hot-humid',l:'Hot & humid' },{ v:'hot-dry',l:'Hot & dry' },{ v:'temperate',l:'Mild & temperate' },{ v:'cold',l:'Cold & winter' }] },
  { id: 'family', q: 'Which scent family calls to you?', options: [{ v:'fresh',l:'Fresh & aquatic' },{ v:'oriental',l:'Warm & oriental' },{ v:'woody',l:'Woody & earthy' },{ v:'floral',l:'Floral & romantic' }] },
  { id: 'projection', q: 'How bold do you want your presence?', options: [{ v:'intimate',l:'Just for me' },{ v:'moderate',l:"Arm's length" },{ v:'strong',l:'Fills the room' },{ v:'beast-mode',l:'Turns heads everywhere' }] },
  { id: 'budget', q: 'Budget per bottle?', options: [{ v:'50',l:'Under $50' },{ v:'100',l:'$50–$100' },{ v:'200',l:'$100–$200' },{ v:'500',l:'No limit' }] },
  { id: 'mood', q: 'What feeling do you want to project?', options: [{ v:'confident',l:'Confident & powerful' },{ v:'elegant',l:'Elegant & refined' },{ v:'playful',l:'Playful & fun' },{ v:'mysterious',l:'Dark & mysterious' }] },
];

type Profile = { title: string; desc: string; tags: string[]; advisorQuery: string };

function buildProfile(answers: Record<string,string>): Profile {
  const profiles: Record<string,Profile> = {
    'fresh-office': { title:'The Modern Professional', desc:'Clean aquatics and citrus that project just enough for the workplace. Versatile, crowd-pleasing, and always appropriate.', tags:['Fresh','Aquatic','Versatile'], advisorQuery:'fresh aquatic office masculine' },
    'oriental-date-night': { title:'The Night Operator', desc:'Rich orientals and ouds that make an entrance. Complex, seductive, and unforgettable in a dark room.', tags:['Oriental','Oud','Seductive'], advisorQuery:'oriental oud date night' },
    'woody-casual': { title:'The Understated Signature', desc:'Warm woods and musks that live close to your skin — a personal signature that only those near you will catch.', tags:['Woody','Musk','Personal'], advisorQuery:'woody sandalwood skin scent' },
    'floral-formal': { title:'The Elegant Classic', desc:'Refined florals with depth — timeless compositions that belong in formal settings and on important occasions.', tags:['Floral','Elegant','Classic'], advisorQuery:'floral elegant formal' },
    'fresh-casual': { title:'The Easy Charmer', desc:'Light and approachable — perfect for everyday wear. People notice without knowing why.', tags:['Fresh','Easy-wear','Likeable'], advisorQuery:'fresh casual everyday' },
    'oriental-formal': { title:'The Grand Occasion', desc:'Imposing, opulent, unforgettable. Reserved for moments that deserve the best.', tags:['Opulent','Grand','Statement'], advisorQuery:'oriental opulent formal occasion' },
    'woody-office': { title:'The Quiet Authority', desc:'Earthy sophistication that commands respect without demanding attention. The scent of someone who has nothing to prove.', tags:['Woody','Sophisticated','Earthy'], advisorQuery:'woody vetiver sophisticated office' },
    'floral-casual': { title:'The Effortless One', desc:'Breezy, natural, and instantly likeable. The kind of fragrance that makes people ask "what are you wearing?"', tags:['Floral','Natural','Cheerful'], advisorQuery:'floral fresh casual cheerful' },
  };
  const key = `${answers.family}-${answers.occasion}`;
  return profiles[key] ?? { title:'The Individual', desc:'Your preferences combine into something unique. Let the AI Advisor find exactly what fits you.', tags:['Unique','Personal'], advisorQuery:Object.values(answers).join(' ') };
}

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [result, setResult] = useState<Profile|null>(null);

  function pick(value: string) {
    const q = QUESTIONS[step];
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) { setStep(s => s + 1); }
    else { setResult(buildProfile(next)); }
  }

  if (result) return (
    <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 text-center">
      <p className="section-label mb-4">Your scent profile</p>
      <h1 className="font-display text-5xl text-bone">{result.title}</h1>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {result.tags.map(t => <span key={t} className="badge border border-gold/30 bg-gold/10 text-gold">{t}</span>)}
      </div>
      <p className="mx-auto mt-8 max-w-md leading-relaxed text-ash">{result.desc}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/advisor" className="btn-gold">Get AI Recommendations →</Link>
        <Link href="/database" className="btn-ghost">Browse Catalog</Link>
      </div>
      <button onClick={() => { setStep(0); setAnswers({}); setResult(null); }} className="mt-10 font-mono text-2xs text-ash hover:text-bone underline underline-offset-2">Retake quiz</button>
    </div>
  );

  const q = QUESTIONS[step];
  const pct = Math.round((step / QUESTIONS.length) * 100);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <p className="section-label mb-4">Find Your Scent Profile</p>
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="font-mono text-2xs text-ash">{step + 1} / {QUESTIONS.length}</span>
          <span className="font-mono text-2xs text-gold">{pct}%</span>
        </div>
        <div className="h-0.5 rounded-full bg-bone/10">
          <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <h2 className="font-display text-3xl text-bone">{q.q}</h2>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {q.options.map(o => (
          <button key={o.v} onClick={() => pick(o.v)}
            className="card group p-5 text-left transition-all active:scale-95 hover:border-gold/30">
            <p className="text-bone">{o.l}</p>
            <span className="mt-2 block font-mono text-2xs text-ash opacity-0 group-hover:opacity-100 transition-opacity">Select →</span>
          </button>
        ))}
      </div>
      {step > 0 && <button onClick={() => setStep(s => s - 1)} className="mt-8 font-mono text-2xs text-ash hover:text-bone">← Previous</button>}
    </div>
  );
}
