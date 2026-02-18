import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PageThemeToggle } from "@/components/ui/page-theme-toggle";
import { cn } from "@/lib/utils";
import { EmailCaptureModal } from "@/components/EmailCaptureModal";
import { useHealthCheckIntegration } from "@/hooks/health-check-integration";

interface Question {
  id: string;
  text: string;
  options: { value: string; label: string; points: number }[];
}

const questions: Question[] = [
  {
    id: "revenue",
    text: "How predictable is your revenue month to month?",
    options: [
      { value: "a", label: "Highly unpredictable — varies wildly", points: 0 },
      { value: "b", label: "Somewhat predictable — occasional surprises", points: 10 },
      { value: "c", label: "Mostly stable — minor fluctuations", points: 15 },
      { value: "d", label: "Very predictable — clear visibility", points: 20 },
    ],
  },
  {
    id: "dependency",
    text: "If you stepped away for 30 days, what would happen?",
    options: [
      { value: "a", label: "Everything would stop", points: 0 },
      { value: "b", label: "Major disruptions, some things would continue", points: 8 },
      { value: "c", label: "Minor hiccups, most things would continue", points: 15 },
      { value: "d", label: "Business would run smoothly", points: 20 },
    ],
  },
  {
    id: "financial",
    text: "How quickly can you access accurate financial data?",
    options: [
      { value: "a", label: "I don't have clear financial data", points: 0 },
      { value: "b", label: "Takes days to compile", points: 8 },
      { value: "c", label: "Within a day", points: 15 },
      { value: "d", label: "Real-time or near real-time", points: 20 },
    ],
  },
  {
    id: "processes",
    text: "Are your core operations documented?",
    options: [
      { value: "a", label: "Nothing is written down", points: 0 },
      { value: "b", label: "Some notes exist, mostly in my head", points: 8 },
      { value: "c", label: "Key processes are documented", points: 15 },
      { value: "d", label: "Comprehensive documentation exists", points: 20 },
    ],
  },
  {
    id: "capacity",
    text: "How often do you feel overwhelmed by operations?",
    options: [
      { value: "a", label: "Constantly — it's my default state", points: 0 },
      { value: "b", label: "Frequently — most weeks", points: 8 },
      { value: "c", label: "Occasionally — during busy periods", points: 15 },
      { value: "d", label: "Rarely — I have capacity to spare", points: 20 },
    ],
  },
];

const getScoreLabel = (score: number): string => {
  if (score <= 39) return "At Risk";
  if (score <= 69) return "Unstable";
  if (score <= 85) return "Stable but Strained";
  return "Structurally Strong";
};

const getInterpretation = (score: number): string => {
  if (score <= 39) {
    return "Your score suggests the business relies heavily on you and lacks financial visibility.";
  }
  if (score <= 69) {
    return "The foundation is present, but key systems are under strain.";
  }
  if (score <= 85) {
    return "Core operations are functional, though some areas need reinforcement.";
  }
  return "Your business demonstrates strong operational foundations and financial clarity.";
};

export default function BusinessHealthCheck() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const { isModalOpen, captureEmail, submitEmail, closeModal } = useHealthCheckIntegration();

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const calculateScore = (): number => {
    return questions.reduce((total, question) => {
      const answer = answers[question.id];
      const option = question.options.find((o) => o.value === answer);
      return total + (option?.points ?? 0);
    }, 0);
  };

  const allAnswered = questions.every((q) => answers[q.id]);
  const score = calculateScore();
  const scoreLabel = getScoreLabel(score);
  const interpretation = getInterpretation(score);

  const handleSubmit = () => {
    if (allAnswered) {
      // Show email capture modal BEFORE showing results
      captureEmail();
    }
  };

  const handleEmailSubmit = async (email: string, firstName?: string) => {
    const success = await submitEmail(email, firstName);
    if (success) {
      // Show results after email is captured
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <>
      <Helmet>
        <title>Business Health Check | Virtual OPS Assist</title>
        <meta
          name="description"
          content="Measure the health, strength, and sustainability of your business with a quick diagnostic assessment."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Page Theme Toggle */}
        <div className="fixed top-4 right-4 z-40">
          <PageThemeToggle className="px-0 py-0" />
        </div>
        
        <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
          {/* Header */}
          <header className="mb-12 text-center">
            <h1 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              Business Health Check
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              This takes less than a minute.
            </p>
          </header>

          {!submitted ? (
            /* Assessment Form */
            <Card className="border-border/50 bg-card/50 p-6 md:p-8">
              <div className="space-y-8">
                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-4">
                    <p className="text-sm font-medium text-foreground">
                      {index + 1}. {question.text}
                    </p>
                    <RadioGroup
                      value={answers[question.id] || ""}
                      onValueChange={(value) => handleAnswer(question.id, value)}
                      className="space-y-2"
                    >
                      {question.options.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-start space-x-3"
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={`${question.id}-${option.value}`}
                            className="mt-0.5 border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                          />
                          <Label
                            htmlFor={`${question.id}-${option.value}`}
                            className="cursor-pointer text-sm leading-relaxed text-muted-foreground"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}

                <div className="pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className="w-full"
                  >
                    See My Score
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            /* Results */
            <Card className="border-border/50 bg-card/50 p-6 md:p-8">
              <div className="space-y-8 text-center">
                {/* Score Display */}
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Your Business Health Score
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-light tracking-tight text-foreground md:text-6xl">
                      {score}
                    </span>
                    <span className="text-xl text-muted-foreground">/100</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mx-auto max-w-xs">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Score Label */}
                <div className="space-y-2">
                  <p
                    className={cn(
                      "text-lg font-medium",
                      score <= 39 && "text-destructive",
                      score > 39 && score <= 69 && "text-warning",
                      score > 69 && score <= 85 && "text-muted-foreground",
                      score > 85 && "text-success"
                    )}
                  >
                    {scoreLabel}
                  </p>
                  <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
                    {interpretation}
                  </p>
                </div>

                {/* CTA */}
                <div className="space-y-3 pt-4">
                  <Button className="w-full" size="lg">
                    Strengthen the Foundation
                  </Button>
                  <button
                    onClick={handleReset}
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Take again
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleEmailSubmit}
        title="Get Your Detailed Report"
        description="Enter your email to receive your personalized business health report and recommendations."
        submitButtonText="Get My Report"
      />
    </>
  );
}
