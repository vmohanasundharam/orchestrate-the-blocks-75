
import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { RotateCcw, Settings } from 'lucide-react';
import { ConditionConfigModal } from '../ConditionConfigModal';

export const LoopNode = memo(({ data, id }: { data: any; id: string }) => {
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleConditionSave = (condition: string) => {
    // Update the node data with the new condition
    if (data.onConfigChange) {
      data.onConfigChange(id, { condition });
    }
  };

  return (
    <>
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-orange-500 min-w-[120px]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-orange-500 text-white">
            <RotateCcw className="w-3 h-3" />
          </div>
          <div className="text-sm font-medium">Loop</div>
          <button
            onClick={() => setShowConfigModal(true)}
            className="ml-auto p-1 hover:bg-gray-100 rounded"
          >
            <Settings className="w-3 h-3 text-gray-500" />
          </button>
        </div>
        {data.config?.condition && (
          <div className="text-xs text-gray-600 mt-1 truncate">
            {data.config.condition}
          </div>
        )}
        {data.config?.executionMode && (
          <div className="text-xs text-gray-500 mt-1">
            {data.config.executionMode === 'checkThenExecute' ? 'Check → Execute' : 'Execute → Check'}
          </div>
        )}
        
        <Handle type="target" position={Position.Top} className="w-3 h-3" />
        <Handle type="source" position={Position.Bottom} id="loop" className="w-3 h-3" style={{ left: '30%' }} />
        <Handle type="source" position={Position.Bottom} id="exit" className="w-3 h-3" style={{ left: '70%' }} />
      </div>

      <ConditionConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={handleConditionSave}
        initialCondition={data.config?.condition || ''}
        title="Configure Loop Condition"
      />
    </>
  );
});
