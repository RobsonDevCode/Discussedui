import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Comment } from "../../models/Comments/Comment";

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, commentId: string) => void;
  userId: string;
  parentComment: Comment | null;
 
}

const ReplyModal: React.FC<ReplyModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  userId,
  parentComment
}) => {
  const [replyContent, setReplyContent] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Function to count words in a string
  const countWords = (text: string): number => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  // Calculate word count
  const wordCount = countWords(replyContent);

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
  }, [replyContent, wordCount]);

  // Reset reply content when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setReplyContent("");
      // Focus the textarea when the modal opens
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen || !parentComment) return null;

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setReplyContent(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    if (replyContent.trim() === "") return;
    
    onSubmit(replyContent, parentComment.id);
    setReplyContent(""); // Clear the input
    onClose(); // Close the modal
  };

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div 
     className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-xl w-full max-w-2xl mx-4 border border-gray-700 shadow-xl"
        style={{ backgroundColor: 'rgb(0, 0, 0)' }} 
        onClick={(e) => e.stopPropagation()} // Prevent clicks from reaching the backdrop
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Reply to {parentComment.user_name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-700 bg-gray-800 bg-opacity-50">
          {/* Parent Comment */}
          <div className="flex space-x-3">
            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-transparent flex-shrink-0"></div>
            <div className="flex-1">
              {/* User Info and Comment Time */}
              <div className="flex items-center space-x-1">
                <span className="font-bold text-white">{parentComment.user_name}</span>
                <span className="text-gray-400">@{parentComment.user_name.toLowerCase()}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-400 text-sm">{formatDate(parentComment.created_at)}</span>
              </div>
              {/* Comment Content */}
              <div className="mt-1">
                <p className="text-white">{parentComment.content}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={replyContent}
                    onChange={handleInputChange}
                    placeholder={`Reply to ${parentComment.user_name}...`}
                    className="w-full p-2 bg-gray-800 bg-opacity-50 rounded-md text-white placeholder-gray-500 border-none outline-none resize-none overflow-y-auto"
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
                    disabled={replyContent.trim() === ""}
                  >
                    Reply
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

export default ReplyModal;