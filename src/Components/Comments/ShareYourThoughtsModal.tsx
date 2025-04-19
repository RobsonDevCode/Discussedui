import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { X, AlertCircle, Clock } from "lucide-react";
import { Toaster, toast } from "sonner";

interface ShareThoughtsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
  userId: string;
  topicTitle: string;
  commentCli: {
    validate: (userId: string, jwt: string | null) => Promise<boolean>;
  };
  jwt: string | null;
}

const ShareThoughtsModal: React.FC<ShareThoughtsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  userId,
  topicTitle,
  commentCli,
  jwt
}) => {
  const [newComment, setNewComment] = useState<string>("");
  const [canComment, setCanComment] = useState<boolean>(true);
  const [isValidating, setIsValidating] = useState<boolean>(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Function to count words in a string
  const countWords = (text: string): number => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  // Calculate word count
  const wordCount = countWords(newComment);

  // Check if user can comment when the modal opens
  useEffect(() => {
    if (isOpen && userId) {
      setIsValidating(true);
      commentCli.validate(userId, jwt)
        .then(canComment => {
          setCanComment(canComment);
        })
        .catch(error => {
          console.error("Error validating comment eligibility:", error);
          toast.error("Couldn't verify your comment eligibility. Please try again later.");
          setCanComment(false);
        })
        .finally(() => {
          setIsValidating(false);
        });
    }
  }, [isOpen, userId, commentCli]);

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
    
    if (newComment.trim() === "" || !canComment) return;
    
    onSubmit(newComment);
    setNewComment(""); // Clear the input
    onClose(); // Close the modal
    
    toast.success("Your comment was submitted successfully!", {
      duration: 3000,
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Close the modal when clicking the backdrop
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Render a message when the user can't comment
  const renderCommentRestriction = () => {
    return (
      <div className="flex items-center p-3 bg-indigo-900/50 border border-indigo-800 rounded-lg mb-4">
        <div className="flex items-center justify-center flex-shrink-0 mr-2">
          <Clock size={20} className="text-yellow-300" />
        </div>
        <div className="flex items-center">
          <p className="text-yellow-200 text-sm leading-5 my-auto">
            You've already shared your thoughts today. Please return tomorrow to comment again.
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div 
        className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(30, 30, 30, 0.15)' }} 
        onClick={handleBackdropClick}
      >
        <div 
          className="bg-slate-950 rounded-xl w-full max-w-3xl mx-4 border border-gray-700 shadow-xl"
          style={{ backgroundColor: 'rgb(0, 0, 0)' }} 
          onClick={(e) => e.stopPropagation()} 
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Share your thoughts</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
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

            {/* Show restriction message if user can't comment */}
            {!canComment && !isValidating && renderCommentRestriction()}

            <form onSubmit={handleSubmit} className="w-full">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0 mt-3"></div>
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={newComment}
                      onChange={handleInputChange}
                      placeholder={canComment ? "Share your thoughts on this topic..." : "You can comment again tomorrow..."}
                      className={`w-full bg-gray-800 rounded-lg p-3 text-white placeholder-gray-500 border-none outline-none resize-none overflow-y-auto ${!canComment ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ 
                        maxHeight: wordCount > 250 ? '400px' : 'auto'
                      }}
                      rows={4}
                      autoFocus={canComment}
                      disabled={!canComment || isValidating}
                    />
                  </div>
                  <div className="flex justify-end items-center mt-4">
                    <button
                      type="submit"
                      className={`${canComment && !isValidating ? 'bg-violet-700 hover:bg-violet-800' : 'bg-gray-700 cursor-not-allowed'} text-white font-bold px-6 py-2 rounded-full transition-colors duration-200`}
                      disabled={newComment.trim() === "" || !canComment || isValidating}
                    >
                      {isValidating ? 'Checking...' : 'Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareThoughtsModal;