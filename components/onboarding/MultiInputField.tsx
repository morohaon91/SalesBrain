'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

interface MultiInputFieldProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  maxItems?: number;
  minItems?: number;
  addButtonText?: string;
}

export default function MultiInputField({
  values,
  onChange,
  placeholder,
  maxItems = 10,
  minItems = 0,
  addButtonText = 'Add Item',
}: MultiInputFieldProps) {
  const [currentInput, setCurrentInput] = useState('');

  const handleAdd = () => {
    if (currentInput.trim() && values.length < maxItems) {
      onChange([...values, currentInput.trim()]);
      setCurrentInput('');
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      {values.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={value}
            onChange={(e) => {
              const newValues = [...values];
              newValues[index] = e.target.value;
              onChange(newValues);
            }}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleRemove(index)}
            disabled={values.length <= minItems}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {values.length < maxItems && (
        <div className="flex items-center gap-2">
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!currentInput.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            {addButtonText}
          </Button>
        </div>
      )}

      <p className="text-xs text-gray-500">
        {values.length} / {maxItems} items
        {minItems > 0 && ` (minimum ${minItems} required)`}
      </p>
    </div>
  );
}
