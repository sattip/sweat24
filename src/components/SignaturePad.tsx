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
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                className: 'w-full h-48 touch-none',
                style: { width: '100%', height: '192px' }
              }}
              backgroundColor="white"
              penColor="black"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex items-center gap-2"
            >
              <Eraser className="h-4 w-4" />
              Καθαρισμός
            </Button>
            
            {onSave && (
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Αποθήκευση
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;