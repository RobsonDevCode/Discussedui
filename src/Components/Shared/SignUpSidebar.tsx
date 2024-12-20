import './SignUpSideBar.css'
const SignUpSidebar = () => {
    return (
        <div className="side-bar">
        <aside className="h-screen w-[450px]">
            <nav className="h-full flex flex-col bg-white border-r drop-shadow-lg">
                {/* Top Section */}
                <div className="p-4 pb-6 flex justify-between items-center"> 
                    <img src="https://img.logoipsum.com/287.svg" className="w-32" alt="Logo" />
                </div>

                {/* Main Content */}
                <div className="flex-1 font-mono text-center px-4 overflow-y-auto">
                    <p className="text-lg font-bold mb-4">Welcome to Discussed</p>
                    <p className="text-base mb-4">
                        Dive into the conversation that matters. Every day, you'll receive one thought-provoking, controversial topic to consider.
                    </p>
                    <p className="text-base mb-4">
                        <span className="font-semibold">No, it's not a Twitter clone.</span> You only get <span className="font-semibold">one chance to comment</span> and <span className="font-semibold">one reply to engage</span>—no more, no less.
                    </p>
                    <p className="text-base mb-4">
                        This isn’t about endless scrolling or impulsive replies. It’s about taking a moment to reflect, craft your perspective, and engage in meaningful, intense discussions.
                    </p>
                    <p className="text-base font-semibold">
                        Challenge your thoughts. Shape the discourse. Join Discussed today.
                    </p>
                </div>

                {/* Footer Section */}
                <div className="border-t p-3">
                    <p className="text-base text-gray-500">© 2025 Discussed. All rights reserved.</p>
                </div>
            </nav>
        </aside>
        </div>
    );
}

export default SignUpSidebar;

