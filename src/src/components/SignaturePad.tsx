import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eraser, Save } from 'lucide-react';

interface SignaturePadProps {
  onSave?: (signature: string) => void;
  title?: string;
  description?: string;
}

export interface SignaturePadRef {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onSave, title = "Ψηφιακή Υπογραφή", description = "Παρακαλώ υπογράψτε στο παρακάτω πλαίσιο" }, ref) => {
    const sigCanvas = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        sigCanvas.current?.clear();
      },
      isEmpty: () => {
        return sigCanvas.current?.isEmpty() ?? true;
      },
      toDataURL: () => {
        return sigCanvas.current?.toDataURL() || '';
      }
    }));

    const handleClear = () => {
      sigCanvas.current?.clear();
    };

    const handleSave = () => {
      if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
        const signature = sigCanvas.current.toDataURL();
        onSave?.(signature);
      }
    };

    return (
      <div className="w-full space-y-3">
        <div>
          <h4 className="font-medium text-sm mb-1">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-1 bg-white touch-none">
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: 'w-full touch-none select-none',
              style: { 
                width: '100%', 
                height: 'clamp(120px, 20vh, 200px)',
                touchAction: 'none'
              }
            }}
            backgroundColor="white"
            penColor="black"
            velocityFilterWeight={0.7}
            minWidth={1}
            maxWidth={3}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Eraser className="h-4 w-4" />
            Καθαρισμός
          </Button>
          
          {onSave && (
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Save className="h-4 w-4" />
              Αποθήκευση
            </Button>
          )}
        </div>
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;