"use client"

import React, { useState } from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

const DocFeedback: React.FC<{ docId: string }> = () => {
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleFeedback = async (type: 'helpful' | 'not-helpful') => {
    setFeedback(type);
    
    // In a real implementation, you might want to send this feedback to your backend
    // For now, we'll just simulate a submission
    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // If no comment is needed, mark as submitted
      if (type === 'helpful') {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const submitComment = async () => {
    if (!comment.trim()) return;
    
    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitted) {
    return (
      <div className="mt-12 p-4 bg-blue-50 border border-blue-100 rounded-lg text-center">
        <p className="text-blue-800">Thank you for your feedback!</p>
      </div>
    );
  }
  
  return (
    <div className="mt-12 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-medium mb-4">Was this documentation helpful?</h3>
      
      <div className="flex gap-4">
        <button
          onClick={() => handleFeedback('helpful')}
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            feedback === 'helpful'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <FaThumbsUp />
          Yes
        </button>
        
        <button
          onClick={() => handleFeedback('not-helpful')}
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            feedback === 'not-helpful'
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <FaThumbsDown />
          No
        </button>
      </div>
      
      {feedback === 'not-helpful' && (
        <div className="mt-4">
          <label htmlFor="feedback-comment" className="block text-sm font-medium text-gray-700 mb-2">
            How can we improve this documentation?
          </label>
          <textarea
            id="feedback-comment"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Please provide your suggestions..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            onClick={submitComment}
            disabled={isSubmitting || !comment.trim()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DocFeedback;