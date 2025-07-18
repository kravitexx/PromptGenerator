'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ClarifyingQuestion } from '@/types';
import { 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  X
} from 'lucide-react';

interface ClarifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: ClarifyingQuestion[];
  onAnswersSubmit: (answers: Record<string, unknown>) => void;
  title?: string;
  description?: string;
}

export function ClarifyModal({ 
  isOpen, 
  onClose, 
  questions, 
  onAnswersSubmit,
  title = "Improve Your Prompt",
  description = "Answer these questions to enhance your prompt with more specific details."
}: ClarifyModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [textInputs, setTextInputs] = useState<Record<string, string>>({});

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTextInputs({});
    }
  }, [isOpen]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnsweredCurrent = currentQuestion && (
    answers[currentQuestion.id] !== undefined || 
    (currentQuestion.type === 'text' && textInputs[currentQuestion.id]?.trim())
  );

  const handleSelectAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMultiSelectAnswer = (questionId: string, value: string) => {
    setAnswers(prev => {
      const currentAnswers = (prev[questionId] as string[]) || [];
      const isSelected = currentAnswers.includes(value);
      
      return {
        ...prev,
        [questionId]: isSelected 
          ? currentAnswers.filter(v => v !== value)
          : [...currentAnswers, value]
      };
    });
  };

  const handleTextAnswer = (questionId: string, value: string) => {
    setTextInputs(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Update answers with debounced text
    setAnswers(prev => ({
      ...prev,
      [questionId]: value.trim()
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Filter out empty answers
    const filteredAnswers = Object.entries(answers).reduce((acc, [key, value]) => {
      if (value && (
        (typeof value === 'string' && value.trim()) ||
        (Array.isArray(value) && value.length > 0) ||
        (typeof value !== 'string' && !Array.isArray(value))
      )) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);

    onAnswersSubmit(filteredAnswers);
    onClose();
  };

  const handleSkipAll = () => {
    onClose();
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(key => {
      const value = answers[key];
      return value && (
        (typeof value === 'string' && value.trim()) ||
        (Array.isArray(value) && value.length > 0)
      );
    }).length;
  };

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'select':
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option) => (
              <Button
                key={option}
                variant={answers[currentQuestion.id] === option ? 'default' : 'outline'}
                className="w-full justify-start h-auto p-3 text-left"
                onClick={() => handleSelectAnswer(currentQuestion.id, option)}
              >
                <div className="flex items-center gap-2">
                  {answers[currentQuestion.id] === option && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  <span>{option}</span>
                </div>
              </Button>
            ))}
          </div>
        );

      case 'multiselect':
        const selectedOptions = (answers[currentQuestion.id] as string[]) || [];
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-3">
              Select all that apply:
            </p>
            {currentQuestion.options?.map((option) => {
              const isSelected = selectedOptions.includes(option);
              return (
                <Button
                  key={option}
                  variant={isSelected ? 'default' : 'outline'}
                  className="w-full justify-start h-auto p-3 text-left"
                  onClick={() => handleMultiSelectAnswer(currentQuestion.id, option)}
                >
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    <span>{option}</span>
                  </div>
                </Button>
              );
            })}
            {selectedOptions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {selectedOptions.map((option) => (
                  <Badge key={option} variant="secondary" className="text-xs">
                    {option}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                      onClick={() => handleMultiSelectAnswer(currentQuestion.id, option)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <Textarea
              value={textInputs[currentQuestion.id] || ''}
              onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
              placeholder="Enter your answer..."
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500">
              Be as specific as possible for better results.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen || questions.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            {title}
          </DialogTitle>
          <p className="text-sm text-gray-600">{description}</p>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-gray-600">
              {getAnsweredCount()} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current question */}
        {currentQuestion && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium text-lg mb-2">
                      {currentQuestion.question}
                    </h3>
                    <Badge variant="outline" className="text-xs mb-4">
                      {currentQuestion.category}
                    </Badge>
                  </div>
                </div>
                
                {renderQuestionContent()}
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleSkipAll}
              className="text-gray-600"
            >
              Skip All
            </Button>
            {currentQuestionIndex > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleNext}
              disabled={!hasAnsweredCurrent && currentQuestion?.type !== 'text'}
              className="min-w-[100px]"
            >
              {isLastQuestion ? (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Apply Changes
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}