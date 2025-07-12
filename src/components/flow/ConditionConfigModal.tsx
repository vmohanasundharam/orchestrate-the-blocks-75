
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useGlobalVariables } from '@/contexts/GlobalVariablesContext';

interface Tag {
  id: string;
  key: string;
  value: string;
  type: string;
}

interface ConditionRule {
  id: string;
  field: string;
  fieldType: string;
  operator: string;
  value: string;
}

interface ConditionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (condition: string) => void;
  initialCondition?: string;
  title: string;
}

const mockTags: Tag[] = [
  { id: '1', key: 'environment', value: 'production', type: 'String' },
  { id: '2', key: 'version', value: '1.2.3', type: 'String' },
  { id: '3', key: 'region', value: 'us-east-1', type: 'String' },
  { id: '4', key: 'debug', value: 'false', type: 'Boolean' },
  { id: '5', key: 'timestamp', value: '1234567888', type: 'Number' },
  { id: '6', key: 'user_id', value: 'user123', type: 'String' },
  { id: '7', key: 'feature_flag', value: 'true', type: 'Boolean' },
  { id: '8', key: 'max_connections', value: '100', type: 'Number' },
  { id: '9', key: 'timeout_seconds', value: '30', type: 'Number' },
];

const getOperatorsByType = (type: string) => {
  switch (type) {
    case 'String':
      return [
        { value: 'is', label: 'Is' },
        { value: 'isnt', label: "Isn't" },
        { value: 'contains', label: 'Contains' },
        { value: 'doesnt_contain', label: "Doesn't contain" },
        { value: 'starts_with', label: 'Starts with' },
        { value: 'ends_with', label: 'Ends with' },
        { value: 'is_empty', label: 'Is empty' },
        { value: 'is_not_empty', label: 'Is not empty' },
      ];
    case 'Number':
      return [
        { value: '>', label: '>' },
        { value: '<', label: '<' },
        { value: '=', label: '=' },
        { value: '!=', label: '!=' },
        { value: '>=', label: '>=' },
        { value: '<=', label: '<=' },
        { value: 'between', label: 'Between' },
        { value: 'not_between', label: 'Not between' },
        { value: 'empty', label: 'Empty' },
        { value: 'not_empty', label: 'Not empty' },
      ];
    case 'Boolean':
      return [
        { value: 'is', label: 'Is' },
      ];
    default:
      return [];
  }
};

export const ConditionConfigModal: React.FC<ConditionConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCondition = '',
  title
}) => {
  const { variables } = useGlobalVariables();
  const [rules, setRules] = useState<ConditionRule[]>([]);
  const [logicOperator, setLogicOperator] = useState<'AND' | 'OR'>('AND');

  const allFields = [
    ...mockTags.map(tag => ({ name: `#${tag.key}`, type: tag.type, category: 'tag' })),
    ...variables.map(variable => ({ name: `$${variable.name}`, type: variable.type, category: 'variable' }))
  ];

  useEffect(() => {
    if (isOpen && !initialCondition) {
      setRules([{
        id: Date.now().toString(),
        field: '',
        fieldType: '',
        operator: '',
        value: ''
      }]);
    }
  }, [isOpen, initialCondition]);

  const addRule = () => {
    setRules([...rules, {
      id: Date.now().toString(),
      field: '',
      fieldType: '',
      operator: '',
      value: ''
    }]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const updateRule = (id: string, updates: Partial<ConditionRule>) => {
    setRules(rules.map(rule => {
      if (rule.id === id) {
        const updatedRule = { ...rule, ...updates };
        // Reset operator when field changes
        if (updates.field !== undefined) {
          const selectedField = allFields.find(f => f.name === updates.field);
          updatedRule.fieldType = selectedField?.type || '';
          updatedRule.operator = '';
          updatedRule.value = '';
        }
        return updatedRule;
      }
      return rule;
    }));
  };

  const handleSave = () => {
    const validRules = rules.filter(rule => rule.field && rule.operator);
    if (validRules.length === 0) return;

    let conditionString = '';
    if (validRules.length === 1) {
      const rule = validRules[0];
      conditionString = `${rule.field} ${rule.operator} ${rule.value}`;
    } else {
      const ruleStrings = validRules.map(rule => `${rule.field} ${rule.operator} ${rule.value}`);
      conditionString = `(${ruleStrings.join(` ${logicOperator} `)})`;
    }

    onSave(conditionString);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <div className="space-y-4">
            {rules.map((rule, index) => (
              <div key={rule.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500 min-w-[20px]">{index + 1}</span>
                  {index > 0 && (
                    <Select value={logicOperator} onValueChange={(value: 'AND' | 'OR') => setLogicOperator(value)}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                  {/* Field Selection */}
                  <Select value={rule.field} onValueChange={(value) => updateRule(rule.id, { field: value })}>
                    <SelectTrigger className="min-w-[200px]">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500">Tags</div>
                      {allFields.filter(f => f.category === 'tag').map((field) => (
                        <SelectItem key={field.name} value={field.name}>
                          <div className="flex items-center gap-2">
                            <span>{field.name}</span>
                            <span className={`text-xs px-1 rounded ${
                              field.type === 'String' ? 'bg-blue-100 text-blue-800' :
                              field.type === 'Number' ? 'bg-green-100 text-green-800' :
                              field.type === 'Boolean' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {field.type}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 border-t mt-1 pt-2">Variables</div>
                      {allFields.filter(f => f.category === 'variable').map((field) => (
                        <SelectItem key={field.name} value={field.name}>
                          <div className="flex items-center gap-2">
                            <span>{field.name}</span>
                            <span className={`text-xs px-1 rounded ${
                              field.type === 'String' ? 'bg-blue-100 text-blue-800' :
                              field.type === 'Number' ? 'bg-green-100 text-green-800' :
                              field.type === 'Boolean' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {field.type}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Operator Selection */}
                  <Select 
                    value={rule.operator} 
                    onValueChange={(value) => updateRule(rule.id, { operator: value })}
                    disabled={!rule.fieldType}
                  >
                    <SelectTrigger className="min-w-[150px]">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOperatorsByType(rule.fieldType).map((operator) => (
                        <SelectItem key={operator.value} value={operator.value}>
                          {operator.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Value Input */}
                  <div className="min-w-[150px]">
                    {rule.fieldType === 'Boolean' ? (
                      <Select value={rule.value} onValueChange={(value) => updateRule(rule.id, { value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={rule.value}
                        onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                        placeholder="Value"
                        disabled={['is_empty', 'is_not_empty', 'empty', 'not_empty'].includes(rule.operator)}
                      />
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRule(rule.id)}
                    disabled={rules.length === 1}
                    className="text-red-600 hover:text-red-700 min-w-[40px]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button onClick={addRule} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Condition
          </Button>
        </div>
      </div>
    </div>
  );
};
