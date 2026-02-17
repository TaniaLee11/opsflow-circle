import { C, getCardGradient, getCardBorder, cardBaseStyles } from "./theme";
import { Lock, BookOpen } from "lucide-react";

interface LockedPageScreenProps {
  title: string;
  description: string;
  unlocksWhen: string;
  course?: {
    title: string;
    path: string;
  };
}

export function LockedPageScreen({ title, description, unlocksWhen, course }: LockedPageScreenProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 64px)',
      padding: 32,
    }}>
      <div style={{
        background: getCardGradient(C.accent),
        border: getCardBorder(C.accent),
        ...cardBaseStyles,
        maxWidth: 560,
        textAlign: 'center',
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `rgba(8,145,178,0.2)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Lock size={36} color={C.accent} />
        </div>
        
        <h1 style={{ color: C.text1, fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          {title} is Locked
        </h1>
        
        <p style={{ color: C.text2, fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
          {description}
        </p>
        
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 10,
          padding: 16,
          marginBottom: 24,
        }}>
          <div style={{ color: C.text3, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>
            Unlocks When
          </div>
          <div style={{ color: C.text1, fontSize: 14, fontWeight: 500 }}>
            {unlocksWhen}
          </div>
        </div>
        
        {course && (
          <div>
            <div style={{ color: C.text2, fontSize: 13, marginBottom: 12 }}>
              Learn about this feature:
            </div>
            <button
              onClick={() => window.location.href = course.path}
              style={{
                background: C.accent,
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <BookOpen size={16} />
              {course.title}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
