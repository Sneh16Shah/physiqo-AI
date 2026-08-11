import React, { useEffect } from 'react';

export interface GuideDetail {
  key: string;
  name: string;
  category: string;
  locationText: string;
  instructions: string[];
  tips: string[];
  diagramType: 'neck' | 'chest' | 'bicep_left' | 'bicep_right' | 'waist' | 'belly' | 'hips' | 'thigh_left' | 'thigh_right' | 'calf_left' | 'calf_right';
}

export const MEASUREMENT_GUIDES: Record<string, GuideDetail> = {
  neck: {
    key: 'neck',
    name: 'Neck',
    category: 'Upper Body',
    locationText: 'Just below the Adam\'s apple at the mid-neck level.',
    instructions: [
      'Stand upright looking straight ahead with your shoulders relaxed.',
      'Place the measuring tape around the middle of your neck, just below your Adam\'s apple (larynx).',
      'Keep the tape flat against your skin and parallel to the shoulders.',
      'Do not pull too tight—leave room for normal breathing.'
    ],
    tips: [
      'Keep your jaw level, not tilted up or down.',
      'Measure at the end of a normal breath.'
    ],
    diagramType: 'neck'
  },
  chest: {
    key: 'chest',
    name: 'Chest',
    category: 'Upper Body',
    locationText: 'Across the nipples/fullest part of the chest under armpits.',
    instructions: [
      'Stand erect with arms resting naturally at your sides.',
      'Wrap the tape under your armpits and across the fullest part of your chest (nipple line).',
      'Ensure the tape is flat and level across your back.',
      'Take the reading at the end of a normal exhalation.'
    ],
    tips: [
      'Ask a friend to help if tape slips around the back.',
      'Do not puff out your chest or hold your breath.'
    ],
    diagramType: 'chest'
  },
  leftBicep: {
    key: 'leftBicep',
    name: 'Left Bicep',
    category: 'Arms',
    locationText: 'Peak of the upper arm, halfway between shoulder and elbow.',
    instructions: [
      'Choose relaxed or flexed position (stick to the same method every time!).',
      'Wrap tape around the thickest part of your left upper arm.',
      'Keep tape perpendicular to your arm bone and flat against skin.',
      'Record the value to the nearest 0.1 cm.'
    ],
    tips: [
      'Flexed measurements track muscle gains best.',
      'Keep tape level without depressing the skin.'
    ],
    diagramType: 'bicep_left'
  },
  rightBicep: {
    key: 'rightBicep',
    name: 'Right Bicep',
    category: 'Arms',
    locationText: 'Peak of the upper arm, halfway between shoulder and elbow.',
    instructions: [
      'Choose relaxed or flexed position (keep consistent for all tracking).',
      'Wrap tape around the fullest part of your right upper arm.',
      'Ensure tape is snug around muscle without squeezing.',
      'Read measurement to the nearest 0.1 cm.'
    ],
    tips: [
      'Track right vs left balance over training cycles.',
      'Measure at the widest point of contraction.'
    ],
    diagramType: 'bicep_right'
  },
  waist: {
    key: 'waist',
    name: 'Waist',
    category: 'Core',
    locationText: 'Narrowest point of torso, usually 1-2 inches above navel.',
    instructions: [
      'Stand straight with feet hip-width apart.',
      'Find the narrowest part of your torso between your ribs and hips.',
      'Wrap tape level around your waist.',
      'Relax your stomach and measure at the end of normal exhalation.'
    ],
    tips: [
      'Do not suck in your belly.',
      'Keep tape parallel to the floor.'
    ],
    diagramType: 'waist'
  },
  belly: {
    key: 'belly',
    name: 'Belly (Abdomen)',
    category: 'Core',
    locationText: 'Directly across the belly button (navel level).',
    instructions: [
      'Stand relaxed with feet together.',
      'Wrap tape horizontally around your abdomen directly across your navel.',
      'Ensure tape is flat across your lower back.',
      'Keep abdomen relaxed and take reading on normal exhalation.'
    ],
    tips: [
      'Ideal for tracking visceral fat and abdominal circumference changes.',
      'Do not press tape tightly into abdomen.'
    ],
    diagramType: 'belly'
  },
  hips: {
    key: 'hips',
    name: 'Hips',
    category: 'Lower Body',
    locationText: 'Widest point of buttocks and hip structure.',
    instructions: [
      'Stand with feet together and glutes relaxed.',
      'Wrap tape around the widest, fullest part of your hips and buttocks.',
      'Ensure tape is completely level around front, sides, and back.',
      'Keep tape snug against skin.'
    ],
    tips: [
      'Use a mirror to verify tape is horizontal across glutes.',
      'Feet must be touching for consistent geometry.'
    ],
    diagramType: 'hips'
  },
  leftThigh: {
    key: 'leftThigh',
    name: 'Left Thigh',
    category: 'Legs',
    locationText: 'Thickest point of upper leg, just below gluteal fold.',
    instructions: [
      'Stand with weight evenly distributed on both feet.',
      'Wrap tape around the fullest part of your left upper thigh.',
      'Keep tape horizontal and perpendicular to your leg.',
      'Keep thigh muscle relaxed.'
    ],
    tips: [
      'Measure right under the glute fold for maximum circumference.',
      'Don\'t bend your knee while measuring.'
    ],
    diagramType: 'thigh_left'
  },
  rightThigh: {
    key: 'rightThigh',
    name: 'Right Thigh',
    category: 'Legs',
    locationText: 'Thickest point of upper leg, just below gluteal fold.',
    instructions: [
      'Stand with feet shoulder-width apart, weight balanced.',
      'Wrap tape around the widest part of your right upper thigh.',
      'Keep tape flat around the circumference.',
      'Read value with muscle relaxed.'
    ],
    tips: [
      'Compare left vs right thigh symmetry.',
      'Keep tape parallel to floor.'
    ],
    diagramType: 'thigh_right'
  },
  leftCalf: {
    key: 'leftCalf',
    name: 'Left Calf',
    category: 'Legs',
    locationText: 'Widest peak of calf muscle between knee and ankle.',
    instructions: [
      'Stand with weight balanced on both feet.',
      'Wrap tape around the thickest part of your left calf muscle.',
      'Ensure tape is horizontal all the way around.',
      'Keep leg relaxed and flat on floor.'
    ],
    tips: [
      'Slide tape slightly up and down to find the absolute widest point.',
      'Keep foot flat without raising heel.'
    ],
    diagramType: 'calf_left'
  },
  rightCalf: {
    key: 'rightCalf',
    name: 'Right Calf',
    category: 'Legs',
    locationText: 'Widest peak of calf muscle between knee and ankle.',
    instructions: [
      'Stand upright with feet planted flat.',
      'Wrap tape around the widest point of your right calf muscle.',
      'Ensure tape is level and snug against skin.',
      'Record measurement accurately.'
    ],
    tips: [
      'Track lower leg muscle development.',
      'Keep foot flat on floor.'
    ],
    diagramType: 'calf_right'
  }
};

const BodyDiagramSvg: React.FC<{ diagramType: string }> = ({ diagramType }) => {
  const tapeColor = '#f59e0b'; // amber tape measure

  const isNeck = diagramType === 'neck';
  const isChest = diagramType === 'chest';
  const isBicepL = diagramType === 'bicep_left';
  const isBicepR = diagramType === 'bicep_right';
  const isWaist = diagramType === 'waist';
  const isBelly = diagramType === 'belly';
  const isHips = diagramType === 'hips';
  const isThighL = diagramType === 'thigh_left';
  const isThighR = diagramType === 'thigh_right';
  const isCalfL = diagramType === 'calf_left';
  const isCalfR = diagramType === 'calf_right';

  return (
    <div className="w-full h-40 sm:h-44 bg-surface-950 rounded-xl border border-surface-800 flex items-center justify-center p-2 relative overflow-hidden shrink-0">
      <svg className="h-full max-h-40 text-gray-700" viewBox="0 0 200 360" fill="none" stroke="currentColor" strokeWidth="2">
        {/* Head & Neck */}
        <circle cx="100" cy="38" r="20" className="fill-surface-900 stroke-surface-700" />
        <path d="M90 56 L90 70 M110 56 L110 70" className="stroke-surface-700" strokeWidth="3" />
        
        {/* Neck Highlight */}
        {isNeck && (
          <>
            <line x1="86" y1="64" x2="114" y2="64" stroke={tapeColor} strokeWidth="5" strokeDasharray="3 2" />
            <circle cx="100" cy="64" r="4" fill={tapeColor} />
          </>
        )}

        {/* Shoulders & Torso */}
        <path d="M60 85 C75 72 85 70 100 70 C115 70 125 72 140 85 L135 180 C125 210 120 220 100 220 C80 220 75 210 65 180 Z" className="fill-surface-900 stroke-surface-700" strokeWidth="2.5" />

        {/* Chest Line & Tape */}
        {isChest && (
          <>
            <line x1="64" y1="105" x2="136" y2="105" stroke={tapeColor} strokeWidth="5" strokeDasharray="4 2" />
            <rect x="90" y="100" width="20" height="10" rx="3" fill={tapeColor} />
          </>
        )}

        {/* Waist Line & Tape */}
        {isWaist && (
          <>
            <line x1="68" y1="145" x2="132" y2="145" stroke={tapeColor} strokeWidth="5" strokeDasharray="4 2" />
            <rect x="90" y="140" width="20" height="10" rx="3" fill={tapeColor} />
          </>
        )}

        {/* Belly / Navel Line & Tape */}
        {isBelly && (
          <>
            <circle cx="100" cy="165" r="3" fill="#ef4444" />
            <line x1="66" y1="165" x2="134" y2="165" stroke={tapeColor} strokeWidth="5" strokeDasharray="4 2" />
            <rect x="90" y="160" width="20" height="10" rx="3" fill={tapeColor} />
          </>
        )}

        {/* Hips Line & Tape */}
        {isHips && (
          <>
            <line x1="63" y1="195" x2="137" y2="195" stroke={tapeColor} strokeWidth="5" strokeDasharray="4 2" />
            <rect x="90" y="190" width="20" height="10" rx="3" fill={tapeColor} />
          </>
        )}

        {/* Left Arm */}
        <path d="M60 85 L42 160 L35 200" className="stroke-surface-700" strokeWidth="12" strokeLinecap="round" />
        {isBicepL && (
          <>
            <line x1="33" y1="130" x2="55" y2="130" stroke={tapeColor} strokeWidth="5" strokeDasharray="3 2" />
            <circle cx="44" cy="130" r="4" fill={tapeColor} />
          </>
        )}

        {/* Right Arm */}
        <path d="M140 85 L158 160 L165 200" className="stroke-surface-700" strokeWidth="12" strokeLinecap="round" />
        {isBicepR && (
          <>
            <line x1="145" y1="130" x2="167" y2="130" stroke={tapeColor} strokeWidth="5" strokeDasharray="3 2" />
            <circle cx="156" cy="130" r="4" fill={tapeColor} />
          </>
        )}

        {/* Left Leg */}
        <path d="M82 215 L78 280 L76 340" className="stroke-surface-700" strokeWidth="18" strokeLinecap="round" />
        {isThighL && (
          <>
            <line x1="66" y1="245" x2="92" y2="245" stroke={tapeColor} strokeWidth="5" strokeDasharray="3 2" />
            <circle cx="79" cy="245" r="4" fill={tapeColor} />
          </>
        )}
        {isCalfL && (
          <>
            <line x1="66" y1="305" x2="88" y2="305" stroke={tapeColor} strokeWidth="5" strokeDasharray="3 2" />
            <circle cx="77" cy="305" r="4" fill={tapeColor} />
          </>
        )}

        {/* Right Leg */}
        <path d="M118 215 L122 280 L124 340" className="stroke-surface-700" strokeWidth="18" strokeLinecap="round" />
        {isThighR && (
          <>
            <line x1="108" y1="245" x2="134" y2="245" stroke={tapeColor} strokeWidth="5" strokeDasharray="3 2" />
            <circle cx="121" cy="245" r="4" fill={tapeColor} />
          </>
        )}
        {isCalfR && (
          <>
            <line x1="112" y1="305" x2="134" y2="305" stroke={tapeColor} strokeWidth="5" strokeDasharray="3 2" />
            <circle cx="123" cy="305" r="4" fill={tapeColor} />
          </>
        )}
      </svg>

      <div className="absolute bottom-2 right-2 bg-surface-900/90 border border-surface-800 px-2 py-0.5 rounded text-[10px] text-amber-400 font-mono flex items-center gap-1 shadow">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse"></span>
        Tape Placement
      </div>
    </div>
  );
};

interface Props {
  guideKey: string | null;
  onClose: () => void;
}

export const MeasurementGuideModal: React.FC<Props> = ({ guideKey, onClose }) => {
  // Listen for ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!guideKey || !MEASUREMENT_GUIDES[guideKey]) return null;

  const guide = MEASUREMENT_GUIDES[guideKey];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-xs flex justify-center items-start p-3 sm:p-6"
      onClick={onClose}
    >
      <div 
        className="relative my-auto bg-surface-900 border border-surface-700/80 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Absolute Top-Right Close Button */}
        <button
          onClick={onClose}
          aria-label="Close guide"
          className="absolute top-3.5 right-3.5 z-20 w-9 h-9 text-gray-300 hover:text-white bg-surface-800/90 hover:bg-surface-700 rounded-full border border-surface-600 transition-all flex items-center justify-center font-bold text-base shadow-lg cursor-pointer"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 pr-14 border-b border-surface-800 bg-surface-900 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-400">
                {guide.category}
              </span>
              <span className="text-xs text-gray-400">Guide</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">How to Measure {guide.name}</h3>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 custom-scrollbar">
          {/* Visual Diagram */}
          <BodyDiagramSvg diagramType={guide.diagramType} />

          {/* Location Landmark */}
          <div className="bg-surface-950 p-3 rounded-xl border border-surface-800">
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block mb-0.5">
              Exact Landmark Location
            </span>
            <p className="text-xs sm:text-sm font-medium text-white">{guide.locationText}</p>
          </div>

          {/* Step-by-Step Instructions */}
          <div>
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Step-by-Step Instructions
            </h4>
            <ol className="space-y-1.5 text-xs sm:text-sm text-gray-300">
              {guide.instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 bg-surface-950 p-2.5 rounded-lg border border-surface-800/80">
                  <span className="w-5 h-5 rounded-full bg-brand-600/20 text-brand-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Pro Tips */}
          <div>
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              💡 Pro Tips for Accuracy
            </h4>
            <ul className="space-y-1 text-xs text-gray-400">
              {guide.tips.map((tip, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-amber-400">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-3.5 px-5 border-t border-surface-800 bg-surface-900 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/20 transition-all cursor-pointer"
          >
            Got It! Close
          </button>
        </div>
      </div>
    </div>
  );
};
