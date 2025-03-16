import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface ShareThoughtsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
  userId: string;
  topicTitle: string; // Add topic title prop
}

const ShareThoughtsModal: React.FC<ShareThoughtsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  userId,
  topicTitle
}) => {
  const [newComment, setNewComment] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Function to count words in a string
  const countWords = (text: string): number => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  // Calculate word count
  const wordCount = countWords(newComment);

  // Update textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      
      // Default rows
      let rows = 4;
      
      if (wordCount > 60) {
        if (wordCount <= 250) {
          // Gradually increase rows based on word count, up to 250 words
          const additionalRows = Math.min((wordCount - 60) / 10, 12);
          rows += Math.floor(additionalRows);
        } else {
          // Max expansion at 250 words
          rows = 16; // 4 base rows + 12 additional = max expansion at 250 words
        }
      }
      
      textareaRef.current.rows = rows;
    }
  }, [newComment, wordCount]);

  if (!isOpen) return null;

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setNewComment(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    if (newComment.trim() === "") return;
    
    onSubmit(newComment);
    setNewComment(""); // Clear the input
    onClose(); // Close the modal
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Close the modal when clicking the backdrop
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(30, 30, 30, 0.15)' }} // Translucent gray backdrop
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-slate-950 rounded-xl w-full max-w-3xl mx-4 border border-gray-700 shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent clicks from reaching the backdrop
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Share your thoughts</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          {/* Topic reminder */}
          <div className="mb-4 bg-gray-800 rounded-lg p-2.5">
            <p className="text-sm text-gray-400">Commenting on topic:</p>
            <p className="text-white font-medium">{topicTitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={newComment}
                    onChange={handleInputChange}
                    placeholder="Share your thoughts on this topic..."
                    className="w-full bg-gray-800 rounded-lg p-3 text-white placeholder-gray-500 border-none outline-none resize-none overflow-y-auto"
                    style={{ 
                      maxHeight: wordCount > 250 ? '400px' : 'auto'
                    }}
                    rows={4}
                    autoFocus
                  />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex space-x-2 text-blue-400">
                    {/* Icons could go here */}
                  </div>
                  <button
                    type="submit"
                    className="bg-violet-700 hover:bg-violet-800 text-white font-bold px-6 py-2 rounded-full"
                    disabled={newComment.trim() === ""}
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShareThoughtsModal;