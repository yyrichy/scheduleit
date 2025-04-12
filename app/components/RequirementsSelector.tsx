'use client';

import { useState } from 'react';
import { GenEdRequirements } from '../types/schedule';
import React from "react";

interface RequirementsSelectorProps {
  onRequirementsChange: (requirements: GenEdRequirements) => void;
}

export default function RequirementsSelector({ onRequirementsChange }: RequirementsSelectorProps) {
  const [requirements, setRequirements] = useState<GenEdRequirements>({
    DSHS: 0, DSHU: 0, DSNS: 0, DSNL: 0,
    DSSP: 0, DVCC: 0, DVUP: 0, SCIS: 0
  });

  const genEdLabels = {
    DSHS: "History and Social Sciences",
    DSHU: "Humanities",
    DSNS: "Natural Sciences",
    DSNL: "Natural Sciences Lab",
    DSSP: "Scholarship in Practice",
    DVCC: "Cultural Competence",
    DVUP: "Understanding Plural Societies",
    SCIS: "I-Series"
  };

  const handleChange = (category: keyof GenEdRequirements, value: number) => {
    const newRequirements = { ...requirements, [category]: value };
    setRequirements(newRequirements);
    onRequirementsChange(newRequirements);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">General Education Requirements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(genEdLabels).map(([category, label]) => (
          <div key={category} className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                min="0"
                max="5"
                value={requirements[category as keyof GenEdRequirements]}
                onChange={(e) => handleChange(category as keyof GenEdRequirements, parseInt(e.target.value) || 0)}
                className="w-20 p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">courses</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}