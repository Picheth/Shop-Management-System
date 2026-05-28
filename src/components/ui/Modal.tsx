import React, { useEffect, useRef } from 'react';

interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
    title,
    onClose,
    children,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Prevent body scroll without layout shift
    useEffect(() => {
        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;

        // Apply styles to body
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, []);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
            onClick={handleOverlayClick}
        >
            <div
                className="
                    w-full
                    max-w-2xl
                    rounded-xl
                    bg-white
                    shadow-2xl
                    dark:bg-gray-800
                    max-h-[90vh]
                    overflow-y-auto
                "
                ref={modalRef}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
                    <h2
                        id="modal-title"
                        className="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                        {title}
                    </h2>

                    <button
                        onClick={onClose}
                        className="
                            rounded-md
                            p-1
                            text-gray-400
                            transition
                            hover:bg-gray-100
                            hover:text-gray-600
                            dark:hover:bg-gray-700
                            dark:hover:text-gray-200
                        "
                        aria-label="Close modal"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;