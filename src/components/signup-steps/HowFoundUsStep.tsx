import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SignupData } from '../SignupSteps';
import { referralService } from '@/services/referralService';

interface HowFoundUsStepProps {
  data: SignupData;
  updateData: (updates: Partial<SignupData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const HOW_FOUND_OPTIONS = [
  { value: 'referral', label: 'Σύσταση' },
  { value: 'social', label: 'Social' },
  { value: 'google', label: 'Google' },
  { value: 'site', label: 'Site' },
  { value: 'passing_by', label: 'Πέρναγα απέξω' },
  { value: 'know_owner', label: 'Γνωρίζω τον ιδιοκτήτη' }
];

const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' }
];

export const HowFoundUsStep: React.FC<HowFoundUsStepProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onPrev 
}) => {
  const [referralInput, setReferralInput] = useState(data.referralCodeOrName || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [validationMessage, setValidationMessage] = useState('');

  // Production ready - χρησιμοποιεί πραγματικό API
  const MOCK_VALIDATION = false;

  const validateReferral = async (value: string) => {
    if (!value.trim()) {
      setValidationStatus('idle');
      return;
    }

    setIsValidating(true);
    try {
      if (MOCK_VALIDATION) {
        // Mock validation - accepts "JOHN123" or any name containing "John"
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const isValid = value.toUpperCase() === 'JOHN123' || 
                       value.toLowerCase().includes('john');
        
        if (isValid) {
          setValidationStatus('valid');
          setValidationMessage('Ο κωδικός είναι έγκυρος');
          updateData({ 
            referralCodeOrName: value,
            referralValidated: true,
            referrerId: isValid ? 123 : undefined // Mock referrer ID
          });
        } else {
          setValidationStatus('invalid');
          setValidationMessage('Δεν βρέθηκε πελάτης με αυτό το όνομα/κωδικό');
          updateData({ 
            referralCodeOrName: value,
            referralValidated: false,
            referrerId: undefined
          });
        }
      } else {
        // Real API call
        const result = await referralService.validateReferral(value);
        
        if (result.is_valid) {
          setValidationStatus('valid');
          setValidationMessage(result.message || 'Ο κωδικός είναι έγκυρος');
          updateData({ 
            referralCodeOrName: value,
            referralValidated: true,
            referrerId: result.referrer_id
          });
        } else {
          setValidationStatus('invalid');
          setValidationMessage(result.message || 'Δεν βρέθηκε πελάτης με αυτό το όνομα/κωδικό');
          updateData({ 
            referralCodeOrName: value,
            referralValidated: false,
            referrerId: undefined
          });
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationStatus('invalid');
      setValidationMessage('Σφάλμα κατά την επικύρωση');
    } finally {
      setIsValidating(false);
    }
  };

  const handleReferralChange = (value: string) => {
    setReferralInput(value);
    setValidationStatus('idle');
    updateData({ referralCodeOrName: value });
    
    // Debounce validation
    const timeoutId = setTimeout(() => {
      if (value.trim()) {
        validateReferral(value);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleNext = () => {
    if (!data.howFoundUs) {
      toast.error('Παρακαλώ επιλέξτε πώς μας βρήκατε');
      return;
    }

    if (data.howFoundUs === 'referral' && !referralInput.trim()) {
      toast.error('Παρακαλώ εισάγετε το κινητό τηλέφωνο του φίλου που σας σύστησε');
      return;
    }

    if (data.howFoundUs === 'referral' && validationStatus !== 'valid') {
      toast.error('Παρακαλώ εισάγετε έγκυρο κινητό τηλέφωνο');
      return;
    }

    if (data.howFoundUs === 'social' && !data.socialPlatform) {
      toast.error('Παρακαλώ επιλέξτε την πλατφόρμα social media');
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500" />
            Πώς μας βρήκατε;
          </CardTitle>
          <CardDescription>
            Βοηθήστε μας να καταλάβουμε πώς φτάσατε σε εμάς
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={data.howFoundUs || ''}
            onValueChange={(value) => {
              updateData({ 
                howFoundUs: value,
                // Reset conditional fields
                referralCodeOrName: '',
                referralValidated: false,
                socialPlatform: undefined
              });
              setReferralInput('');
              setValidationStatus('idle');
            }}
          >
            <div className="space-y-3">
              {HOW_FOUND_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {/* Referral Input */}
          {data.howFoundUs === 'referral' && (
            <div className="mt-4 space-y-4 pl-6 border-l-2 border-blue-200">
              <div className="space-y-2">
                <Label htmlFor="referralCode">
                  Κινητό τηλέφωνο του φίλου που σας σύστησε *
                </Label>
                <div className="relative">
                  <Input
                    id="referralCode"
                    type="tel"
                    value={referralInput}
                    onChange={(e) => handleReferralChange(e.target.value)}
                    placeholder="π.χ. 6912345678"
                    className={
                      validationStatus === 'valid' ? 'border-green-500' :
                      validationStatus === 'invalid' ? 'border-red-500' :
                      ''
                    }
                    maxLength={10}
                  />
                  {isValidating && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                  {!isValidating && validationStatus === 'valid' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                  {!isValidating && validationStatus === 'invalid' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
                {validationMessage && (
                  <p className={`text-sm ${
                    validationStatus === 'valid' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validationMessage}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Social Platform Selection */}
          {data.howFoundUs === 'social' && (
            <div className="mt-4 space-y-4 pl-6 border-l-2 border-blue-200">
              <Label>Επιλέξτε πλατφόρμα *</Label>
              <RadioGroup
                value={data.socialPlatform || ''}
                onValueChange={(value) => updateData({ socialPlatform: value })}
              >
                <div className="space-y-2">
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <div key={platform.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={platform.value} id={`social-${platform.value}`} />
                      <Label htmlFor={`social-${platform.value}`} className="cursor-pointer">
                        {platform.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between border-t pt-4">
        <Button variant="outline" onClick={onPrev}>
          Πίσω
        </Button>
        <Button onClick={handleNext}>
          Συνέχεια
        </Button>
      </div>
    </div>
  );
};