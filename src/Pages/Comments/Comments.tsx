import { ChangeEvent, useState } from "react";
import { Comment } from "../../models/Comments/Comment";
import { UserInteractions } from "../../models/Comments/UserInteractions"
import { Sidebar } from "lucide-react";
import SideNav from "../../Components/Navigation/SideNav";

const Comments: React.FC = () => {
    const interaction: UserInteractions = {
        user_id: "fdkfjdklflk-34rkjkle-5",
        likes: 10,
        reply_count: 5,
        reposts: 4,
        last_interaction: new Date()
    }
    const newinteraction: UserInteractions = {
        user_id: "fdkfjdklflk-34rkjkle-5",
        likes: 0,
        reply_count: 0,
        reposts: 0,
        last_interaction: new Date()
    }
    const [comments, setComments] = useState<Comment[]>([
        {
            id: "gudidiiwuediwe-3748394-34jhfnjdkhf",
            topic_id: "Test Topic",
            user_id: "fdkfjdklflk-34rkjkle-5",
            user_name: "TestUser",
            content: "Hey this is the first comment to appear on Discussed!",
            user_interactions: interaction,
            created_at: new Date(),
            updated_at: new Date()
        }
    ]);


    const [newComment, setNewComment] = useState<string>("");
    // Handle comment submission with proper event typing
    const handleSubmitComment = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        if (newComment.trim() === "") return;

        // Create new comment object that satisfies our Comment interface
        const comment: Comment = {
            id: "gudidiiwuediwe-3748394-34jhfnjdkhf",
            topic_id: "Test Topic",
            user_id: "fdkfjdklflk-34rkjkle-5",
            user_name: "TestUser",
            content: "Hey this is the Second comment to appear on Discussed!",
            user_interactions: newinteraction,
            created_at: new Date(),
            updated_at: new Date()
        };

        // Add new comment to comments array
        setComments([...comments, comment]);

        // Clear input field
        setNewComment("");
    };

    // Format date to readable string
    const formatDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    function handleInputChange(e: ChangeEvent<HTMLTextAreaElement>): void {
        setNewComment(e.target.value);
    }

    return (
        <div className="w-full">
            <div>
                <div className="bg-b rounded-b-lg border border-2 border-solid border-gray-1 shadow-lg p-6 mx-auto max-w-2xl">
                    <h1 className="text-3xl font-bold text-white text-center">Today's topic:</h1>
                    <p className="text-lg font-bold text-white text-center">Test topic</p>
                </div>
            </div>
            <div>
            </div>
            <div className="columns-3 max-w-3xl mx-auto p-4  border border-2 border-solid border-gray-2 rounded-lg shadow max-w-6xl">
                <h2 className="text-xl font-bold mb-6  text-white"> Comments</h2>
            </div>
        </div>
    );
}

export default Comments;