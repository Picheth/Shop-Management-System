import React, { useState } from 'react';
import { MasterAttribute } from '../../types';

interface BulkGeneratorProps {
    processors: MasterAttribute[];
    rams: MasterAttribute[];
    colors: MasterAttribute[];
    regions: MasterAttribute[];
    conditions: MasterAttribute[];
    onGenerate: (selections: {
        processors: string[];
        rams: string[];
        colors: string[];
        regions: string[];
        conditions: string[];
    }) => void;
}

const BulkGenerator: React.FC<BulkGeneratorProps> = ({
    processors, rams, colors, regions, conditions, onGenerate
}) => {
    const [selectedProcessors, setSelectedProcessors] = useState<string[]>([]);
    const [selectedRams, setSelectedRams] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

    const toggle = (id: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(list.includes(id) ? list.filter(i => i !== id) : [...list, id]);
    };

    const AttributeGroup = ({ label, items, selected, setter }: { label: string, items: MasterAttribute[], selected: string[], setter: any }) => (
        <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">{label}</label>
            <div className="flex flex-wrap gap-2">
                {items.map(item => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => toggle(item.id, selected, setter)}
                        className={`px-3 py-1 text-xs rounded-md border transition-all ${
                            selected.includes(item.id) 
                            ? 'bg-sky-100 border-sky-500 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' 
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-sky-400'
                        }`}
                    >
                        {item.name}
                    </button>
                ))}
            </div>
        </div>
    );

    const handleRun = () => {
        onGenerate({
            processors: selectedProcessors,
            rams: selectedRams,
            colors: selectedColors,
            regions: selectedRegions,
            conditions: selectedConditions
        });
    };

    return (
        <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Bulk Matrix Configuration</p>
                <button 
                    type="button"
                    onClick={handleRun}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 underline"
                >
                    Generate Combinations
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AttributeGroup label="Processors" items={processors} selected={selectedProcessors} setter={setSelectedProcessors} />
                <AttributeGroup label="RAM Options" items={rams} selected={selectedRams} setter={setSelectedRams} />
                <AttributeGroup label="Colors" items={colors} selected={selectedColors} setter={setSelectedColors} />
                <AttributeGroup label="Regions" items={regions} selected={selectedRegions} setter={setSelectedRegions} />
                <AttributeGroup label="Condition" items={conditions} selected={selectedConditions} setter={setSelectedConditions} />
            </div>
        </div>
    );
};

export default BulkGenerator;