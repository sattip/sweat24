import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

interface SignatureData {
  id: number;
  signature_data: string;
  ip_address: string;
  signed_at: string;
  document_type: string;
  document_version: string;
}

interface SignatureDisplayProps {
  signatures: SignatureData[];
}

const SignatureDisplay: React.FC<SignatureDisplayProps> = ({ signatures }) => {
  if (!signatures || signatures.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ψηφιακές Υπογραφές</CardTitle>
          <CardDescription>Δεν υπάρχουν καταγεγραμμένες υπογραφές</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Ψηφιακές Υπογραφές</h3>
      {signatures.map((signature) => (
        <Card key={signature.id}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {signature.document_type === 'terms_and_conditions' ? 'Όροι Χρήσης' : signature.document_type}
              <span className="text-sm text-muted-foreground">(v{signature.document_version})</span>
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(signature.signed_at), 'dd MMMM yyyy, HH:mm', { locale: el })}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                IP: {signature.ip_address}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-2 bg-gray-50">
              <img 
                src={signature.signature_data} 
                alt="Υπογραφή" 
                className="max-h-32 w-auto mx-auto"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SignatureDisplay;