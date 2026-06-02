import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    className?: string;
}

export const DashboardIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

export const ProductIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

export const AttributesIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
);

export const PurchaseIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

export const SaleIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const TransferIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
);

export const InventoryIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

export const EditIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const MultiDeleteIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v10m0-10L13 17m-9-4h8m-8 0v10m0-10L11 23" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const BackIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

export const PrintIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 01-2-2H5a2 2 0 01-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
);

export const LinkIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.103-1.103" />
    </svg>
);

export const EmailIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

export const WhatsAppIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.397-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.197 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414zM12.004 20c-1.99 0-3.951-.533-5.67-1.542l-.406-.24-4.212 1.105 1.125-4.106-.264-.42A9.85 9.85 0 013.064 9.88C3.064 4.428 7.488 0 12.94 0 14.639 0 16.248.659 17.448 1.859a9.85 9.85 0 012.852 7.441C20.3 14.75 15.875 19.178 10.422 19.178c-.015 0-.03 0-.046 0z" />
    </svg>
);

export const TelegramIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.69-.88-.48-1.38-.78-2.23-1.11-1-.38-.35-1.11.22-1.62.15-.14 2.72-2.47 2.77-2.6.01-.01.01-.06 0-.08-.01-.02-.04-.01-.06-.01-.03 0-.48.1-1.36.43-.88.33-1.68.61-2.48.91l-1.8-.56c-.39-.12-.4-.39.08-.56l7.03-2.73c.32-.12.61.02.58.41z"/>
    </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
    </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

export const PdfIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h1m1 0h1m-3 4h4m-4 4h4" />
    </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ size = 14, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const ExportIcon: React.FC<IconProps> = ({ size = 14, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const ScannerIcon: React.FC<IconProps> = ({ size = 12, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>
);

export const ImageIcon: React.FC<IconProps> = ({ size = 96, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const LoadingIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" {...props}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);