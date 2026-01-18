import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const RETURN_REASONS = [
  { value: '0', label: 'Defective' },
  { value: '1', label: 'Wrong Item' },
  { value: '2', label: 'Not As Described' },
  { value: '3', label: 'Changed Mind' },
  { value: '4', label: 'Other' },
];

export function ReturnRequestModal({ bookingId, onRequestReturn, onClose, isPending }) {
  const [reason, setReason] = useState('0');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!description.trim()) {
      return;
    }
    onRequestReturn(bookingId, BigInt(reason), description);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl bg-slate-800 border-red-500/30">
        <CardHeader className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-b border-red-500/20">
          <CardTitle className="text-xl font-bold text-red-300 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Request Return - Order #{bookingId}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4 bg-slate-800">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Return Reason</label>
            <Select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full"
            >
              {RETURN_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <Input
              placeholder="Please describe why you want to return this item..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isPending || !description.trim()}
              className="flex-1 gradient-primary text-white"
            >
              {isPending ? 'Submitting...' : 'Submit Return Request'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

