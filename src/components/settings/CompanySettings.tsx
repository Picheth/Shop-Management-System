import React, { useState, useEffect } from 'react';
import Placeholder from '../ui/Placeholder';
import FormInput from '../ui/FormInput';

interface CompanySettingsProps {
    currentLogo: string;
    onUpdateLogo: (file: File) => Promise<void>;
    companyName: string;
    address: string;
    onUpdateInfo: (name: string, address: string) => Promise<void>;
    currentSignature: string;
    onUpdateSignature: (file: File) => Promise<void>;
}

const CompanySettings: React.FC<CompanySettingsProps> = ({ 
    currentLogo, onUpdateLogo, companyName, address, onUpdateInfo,
    currentSignature, onUpdateSignature 
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const [sigPreviewUrl, setSigPreviewUrl] = useState<string | null>(null);
    const [selectedSigFile, setSelectedSigFile] = useState<File | null>(null);
    const [sigUploading, setSigUploading] = useState(false);

    const [infoForm, setInfoForm] = useState({
        name: companyName,
        address: address,
    });

    // Sync local state when props change (e.g., after initial fetch)
    useEffect(() => {
        setInfoForm({ name: companyName, address: address });
    }, [companyName, address]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        try {
            await onUpdateLogo(selectedFile);
            setSelectedFile(null);
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const handleSigFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedSigFile(file);
            setSigPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSigUpload = async () => {
        if (!selectedSigFile) return;
        setSigUploading(true);
        try {
            await onUpdateSignature(selectedSigFile);
            setSelectedSigFile(null);
            setSigPreviewUrl(null);
        } finally {
            setSigUploading(false);
        }
    };

    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdateInfo(infoForm.name, infoForm.address);
    };

    return (
        <Placeholder title="Company Settings">
            <div className="max-w-2xl space-y-8">
                {/* General Information Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">General Information</h3>
                    <form onSubmit={handleInfoSubmit} className="space-y-4">
                        <FormInput
                            label="Company Name"
                            value={infoForm.name}
                            onChange={(e: any) => setInfoForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter your company name"
                            required
                        />
                        <FormInput
                            label="Company Address"
                            isTextArea
                            value={infoForm.address}
                            onChange={(e: any) => setInfoForm(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Enter full physical address"
                            className="h-24"
                        />
                        <div className="flex justify-end">
                            <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                Save Company Details
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Branding Configuration</h3>
                    
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Company Logo
                        </label>
                        
                        <div className="flex items-center gap-8">
                            <div className="h-24 w-48 bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                                <img 
                                    src={previewUrl || currentLogo} 
                                    alt="Company Logo" 
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>

                            <div className="flex-1 space-y-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 dark:file:bg-sky-900/30 dark:file:text-sky-400"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Recommended size: 300x100px. Supports PNG, JPG, and SVG.
                                </p>
                            </div>
                        </div>

                        {selectedFile && (
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreviewUrl(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Save New Logo'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Placeholder>
    );
};

export default CompanySettings;