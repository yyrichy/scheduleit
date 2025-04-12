'use client';

import { useState } from 'react';
import { queryModel } from '../utils/modelService';
import { CourseRecommendation } from '../types';
import React from "react";

interface Props {
  onRecommendation: (rec: CourseRecommendation) => void;
}

export default function PreferenceInput({ onRecommendation }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await queryModel(input);
      const recommendations = JSON.parse(response);
      onRecommendation(recommendations);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">What courses are you interested in?</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-3 border rounded-md mb-4"
          rows={4}
          placeholder="Example: I want to take AI classes and avoid morning classes"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Getting Recommendations...' : 'Get Course Recommendations'}
        </button>
      </form>
    </div>
  );
}
