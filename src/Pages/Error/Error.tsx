import { XCircleFill } from 'react-bootstrap-icons';
const ErrorPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-center">
                <XCircleFill className="mx-auto h-16 w-16 text-red-500" />

                <h1 className="mt-6 text-3xl font-bold  text-gray-50">
                    For Fuck Sake!
                </h1>

                <p className="mt-4 text-lg text-gray-50 max-w-md mx-auto">
                    That wasnt meant to happen. We encountered an error while processing your request. Please try again later or contact support if the problem persists.
                </p>
                <p className="mt-2 text-md text-gray-50 ">Or go complain on a platform that works, coding is hard!</p>

                <div className="mt-8 space-x-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Try Again
                    </button>

                    <button
                        onClick={() => window.history.back()}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );

}

export default ErrorPage;