import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { marked } from 'marked';
import { UploadCloud, File, X, Loader, Wand, Home, Calendar, CircleDollarSign, Wrench, MapPin, ArrowRight, ArrowLeft, Download, RefreshCw, Phone, Mail, Globe, Replace, Tags, CheckCircle, Eye, Clock, AlertCircle, ExternalLink } from 'lucide-react';

// --- Configuration ---
const API_BASE_URL = process.env.REACT_APP_API_URL || '';
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;
const CALENDLY_URL = process.env.REACT_APP_CALENDLY_URL || 'https://calendly.com/anne-marie/consult';

// --- GA4 Event Tracking ---
const trackEvent = (eventName, parameters = {}) => {
    if (window.gtag && GA_MEASUREMENT_ID) {
        window.gtag('event', eventName, parameters);
    }
};

// --- Request ID Logging ---
const logRequestId = (response) => {
    const requestId = response.headers.get('x-request-id');
    if (requestId) {
        console.info('Request-ID:', requestId);
        return requestId;
    }
    return null;
};

// --- Health Check Component ---
const ApiHealthIndicator = ({ isHealthy }) => {
    return (
        <div className="flex items-center text-xs">
            <div className={`w-2 h-2 rounded-full mr-2 ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} 
                 aria-label={isHealthy ? 'API Online' : 'API Offline'} />
            <span className="text-gray-400">API {isHealthy ? 'Online' : 'Offline'}</span>
        </div>
    );
};
const LeadCaptureModal = ({ isOpen, onClose, onSubmit, reportId }) => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [contactMe, setContactMe] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !phone) {
            setError('Please provide both email and phone number.');
            return;
        }
        
        setIsSubmitting(true);
        setError('');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/lead`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    phone,
                    contactMe,
                    reportId
                })
            });

            const requestId = logRequestId(response);
            if (!response.ok) {
                throw new Error('Failed to save contact information');
            }

            trackEvent('lead_captured', { report_id: reportId });
            onSubmit({ email, phone, contactMe });
        } catch (err) {
            setError('Failed to save your information. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        trackEvent('lead_skipped', { report_id: reportId });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#B91C1C' }}>
                    Get Your Full Report
                </h2>
                <p className="text-gray-600 mb-6">
                    Enter your contact information to download your personalized SnapValue report and receive expert guidance on maximizing your home's value.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-700 focus:border-red-700"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-700 focus:border-red-700"
                                placeholder="(555) 123-4567"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center">
                        <input
                            id="contact-me"
                            type="checkbox"
                            checked={contactMe}
                            onChange={(e) => setContactMe(e.target.checked)}
                            className="h-4 w-4 text-red-700 focus:ring-red-700 border-gray-300 rounded"
                        />
                        <label htmlFor="contact-me" className="ml-2 block text-sm text-gray-700">
                            Yes, I'd like Anne Marie to contact me about selling my home
                        </label>
                    </div>
                    
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-all"
                        >
                            Skip
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:bg-gray-400"
                            style={{ backgroundColor: isSubmitting ? '#6B7280' : '#B91C1C' }}
                        >
                            {isSubmitting ? 'Saving...' : 'Get Report'}
                        </button>
                    </div>
                </form>
                
                <p className="text-xs text-gray-500 mt-4 text-center">
                    Your information is secure and will only be used to provide you with your report and optional consultation.
                </p>
            </div>
        </div>
    );
};

// --- Rate Limit Display Component ---
const RateLimitInfo = ({ headers }) => {
    if (!headers) return null;
    
    const hourLimit = headers['x-ratelimit-limit-hour'];
    const hourRemaining = headers['x-ratelimit-remaining-hour'];
    const dayLimit = headers['x-ratelimit-limit-day'];
    const dayRemaining = headers['x-ratelimit-remaining-day'];
    
    if (!hourLimit) return null;
    
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-blue-800">Usage Limits</p>
                    <p className="text-blue-700 mt-1">
                        Reports today: {dayLimit - dayRemaining} of {dayLimit} • 
                        This hour: {hourLimit - hourRemaining} of {hourLimit}
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---
export default function App() {
    // --- State Management ---
    const initialState = {
        step: 1,
        files: [], // { file: File, preview: string, tag: string, id: string }
        city: '',
        stateName: '',
        timeline: 'Within one month',
        budget: '',
        workPreference: 'A mix of DIY and Professional work',
        isLoading: false,
        report: null,
        reportId: null,
        error: '',
        rateLimitHeaders: null,
        showLeadModal: false,
        hasLeadInfo: false,
        lastRequestId: null,
        apiHealthy: true
    };
    
    const [state, setState] = useState(initialState);
    const { step, files, city, stateName, timeline, budget, workPreference, isLoading, report, reportId, error, rateLimitHeaders, showLeadModal, hasLeadInfo, lastRequestId, apiHealthy } = state;

    // --- Refs and state for image replacement & loading text ---
    const [replacingIndex, setReplacingIndex] = useState(null);
    const replaceImageInputRef = useRef(null);
    const [loadingMessage, setLoadingMessage] = useState("Analyzing your property...");

    const photoTags = ["Exterior", "Foyer", "Kitchen", "Bathroom", "Primary Bedroom", "Other Bedroom", "Living Room", "Rec Room", "Laundry Room", "Other"];

    useEffect(() => {
        const playfairFont = document.createElement('link');
        playfairFont.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;600&display=swap';
        playfairFont.rel = 'stylesheet';
        document.head.appendChild(playfairFont);
        
        // Track page view
        trackEvent('page_view');
        
        // Check API health
        checkApiHealth();
    }, []);
    
    // --- Effect for dynamic loading messages ---
    useEffect(() => {
        let interval;
        if (isLoading) {
            const messages = [
                "Analyzing kitchen layout for optimal flow...",
                "Assessing lighting conditions in the living room...",
                "Evaluating curb appeal from exterior shots...",
                "Cross-referencing improvements with local market data...",
                "Calculating potential return on investment...",
                "Finalizing your personalized recommendations..."
            ];
            let messageIndex = 0;
            setLoadingMessage(messages[messageIndex]);
            interval = setInterval(() => {
                messageIndex = (messageIndex + 1) % messages.length;
                setLoadingMessage(messages[messageIndex]);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const updateState = (newState) => setState(prevState => ({ ...prevState, ...newState }));

    // --- API Health Check ---
    const checkApiHealth = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/healthz`);
            const requestId = logRequestId(response);
            updateState({ apiHealthy: response.ok, lastRequestId: requestId });
        } catch (err) {
            updateState({ apiHealthy: false });
        }
    };

    // --- Enhanced Error Mapping ---
    const mapErrorMessage = (error, status) => {
        if (status === 429) {
            if (error.includes('cost_cap_exceeded')) {
                return 'Daily cost limit reached. Our team has been notified. Please try again tomorrow.';
            }
            return 'You have reached the rate limit. Please try again later.';
        }
        if (status === 503 || error.includes('provider_unavailable')) {
            return 'Our AI service is temporarily unavailable. Please try again in a few minutes.';
        }
        return error || 'An unexpected error occurred. Please try again.';
    };

    // --- Reset Logic ---
    const resetApp = () => {
        updateState(initialState);
        trackEvent('report_reset');
    };

    // --- Navigation Logic ---
    const nextStep = () => {
        if (step === 1 && files.length === 0) {
            updateState({ error: "Please upload at least one photo to continue." });
            return;
        }
        if (step === 2 && files.some(f => !f.tag)) {
            updateState({ error: "Please select a tag for every photo." });
            return;
        }
        if (step === 3 && (!city || !stateName || !budget)) {
            updateState({ error: "Please fill in all required fields to continue." });
            return;
        }
        updateState({ error: '', step: step + 1 });
        
        if (step === 1) trackEvent('wizard_step_2');
        if (step === 2) trackEvent('wizard_step_3');
        if (step === 3) trackEvent('wizard_step_4');
    };

    const prevStep = () => {
        updateState({ error: '', step: step - 1 });
    };

    // Convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    // --- File Dropzone Configuration ---
    const onDrop = useCallback(async (acceptedFiles) => {
        if (files.length + acceptedFiles.length > 8) {
            updateState({ error: "You can upload a maximum of 8 photos." });
            return;
        }
        let errorMsg = '';

        const newFiles = [];
        const existingFileIds = new Set(files.map(f => f.id));

        for (const file of acceptedFiles) {
            const fileId = `${file.name}-${file.size}`;
            if (!existingFileIds.has(fileId)) {
                existingFileIds.add(fileId);
                try {
                    const base64 = await fileToBase64(file);
                    newFiles.push({
                        file: file,
                        preview: base64,
                        tag: '',
                        id: fileId
                    });
                } catch (err) {
                    console.error('Error converting file to base64:', err);
                    errorMsg = `Failed to process "${file.name}"`;
                }
            } else {
                errorMsg = `Duplicate photo "${file.name}" was ignored.`;
            }
        }
        
        updateState({ files: [...files, ...newFiles], error: errorMsg });
    }, [files]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': [], 'image/png': [] },
        maxFiles: 8,
        maxSize: 10 * 1024 * 1024 // 10MB per file
    });

    const removeFile = (idToRemove) => {
        updateState({ files: files.filter(f => f.id !== idToRemove) });
    };

    const handleTagChange = (index, tag) => {
        const newFiles = [...files];
        newFiles[index].tag = tag;
        updateState({ files: newFiles });
    };
    
    // --- Image Replacement Logic ---
    const handleChangePhotoClick = (index) => {
        setReplacingIndex(index);
        replaceImageInputRef.current.click();
    };

    const handleReplaceFile = async (e) => {
        const file = e.target.files[0];
        if (file && replacingIndex !== null) {
            try {
                const fileId = `${file.name}-${file.size}`;
                const base64 = await fileToBase64(file);
                const newFiles = [...files];
                const oldTag = newFiles[replacingIndex].tag;
                newFiles[replacingIndex] = {
                    file: file,
                    preview: base64,
                    tag: oldTag,
                    id: fileId
                };
                updateState({ files: newFiles });
                setReplacingIndex(null);
            } catch (err) {
                console.error('Error converting replacement file to base64:', err);
                updateState({ error: `Failed to process "${file.name}"` });
            }
        }
        e.target.value = null;
    };
    
    // --- Download PDF Report ---
    const downloadPDF = async () => {
        if (!reportId) return;
        
        trackEvent('pdf_download_attempt', { report_id: reportId });
        
        if (!hasLeadInfo) {
            updateState({ showLeadModal: true });
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/report/${reportId}/pdf`);
            const requestId = logRequestId(response);
            
            if (!response.ok) throw new Error('Failed to generate PDF');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SnapValue-Report-${reportId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            trackEvent('pdf_downloaded', { report_id: reportId });
        } catch (err) {
            updateState({ error: 'Failed to download PDF. Please try again.' });
        }
    };
    
    // --- Backend API Call for Report Generation ---
    const generateReport = async () => {
        if (files.length === 0 || files.some(f => !f.tag) || !city || !stateName || !budget || !timeline || !workPreference) {
            updateState({ error: "Something went wrong. Please ensure all information is provided." });
            return;
        }
        
        updateState({ error: '', isLoading: true, report: null, reportId: null });
        trackEvent('report_started');

        try {
            // Prepare JSON payload with base64 images
            const payload = {
                images: files.map(fileObj => ({
                    data: fileObj.preview, // This is now base64
                    tag: fileObj.tag
                })),
                city: city,
                state: stateName,
                timeline: timeline,
                budget: budget,
                workPreference: workPreference
            };

            const response = await fetch(`${API_BASE_URL}/api/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            // Log request ID
            const requestId = logRequestId(response);
            updateState({ lastRequestId: requestId });

            // Extract rate limit headers
            const headers = {};
            ['x-ratelimit-limit-hour', 'x-ratelimit-remaining-hour', 'x-ratelimit-limit-day', 'x-ratelimit-remaining-day'].forEach(header => {
                headers[header] = response.headers.get(header);
            });
            updateState({ rateLimitHeaders: headers });

            if (response.status === 429 || response.status === 503) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(mapErrorMessage(errorData.error, response.status));
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(mapErrorMessage(errorData.error || 'Failed to generate report', response.status));
            }

            const data = await response.json();
            
            if (data.reportId && data.report) {
                updateState({ 
                    report: data.report, 
                    reportId: data.reportId,
                    step: 5 
                });
                trackEvent('report_generated', { report_id: data.reportId });
            } else {
                throw new Error('Invalid response from server');
            }

        } catch (err) {
            console.error('Report generation error:', err);
            updateState({ error: err.message || "An error occurred while generating the report. Please try again." });
            trackEvent('report_error', { error: err.message });
        } finally {
            updateState({ isLoading: false });
        }
    };
    
    // --- Lead Modal Handlers ---
    const handleLeadSubmit = (leadData) => {
        updateState({ hasLeadInfo: true, showLeadModal: false });
        // Proceed with PDF download
        downloadPDF();
    };
    
    const handleLeadModalClose = () => {
        updateState({ showLeadModal: false });
    };
    
    // --- Privacy/Delete Request ---
    const requestDataDeletion = async () => {
        if (!reportId || !hasLeadInfo) return;
        
        const leadId = prompt('Please enter your email address to confirm deletion:');
        if (!leadId) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/privacy/delete/${encodeURIComponent(leadId)}`, {
                method: 'DELETE'
            });
            
            const requestId = logRequestId(response);
            
            if (response.ok) {
                alert('Your data has been deleted successfully.');
                resetApp();
            } else {
                alert('Failed to delete data. Please contact support.');
            }
        } catch (err) {
            alert('Failed to delete data. Please contact support.');
        }
    };
    
    const ReportStyles = () => (
        <style>{`
          .prose-report { color: #374151; }
          .prose-report h1, .prose-report h2, .prose-report h3, .prose-report h4 { color: #111827; font-weight: 600; }
          .prose-report h1 { font-size: 1.875rem; margin-bottom: 1rem; }
          .prose-report h2 { font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; }
          .prose-report h3 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.75rem; }
          .prose-report h4 { font-size: 1rem; color: #6b7280; font-weight: 400; margin-bottom: 1rem; }
          .prose-report p { line-height: 1.625; margin-bottom: 1.25em; }
          .prose-report ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25em; }
          .prose-report li { margin-bottom: 0.5em; }
          .prose-report strong { color: #1f2937; font-weight: 600; }
          .prose-report hr { border-color: #d1d5db; margin-top: 2.5rem; margin-bottom: 2.5rem; }
        `}</style>
    );
    
    const ProgressBar = () => {
        const steps = [
            { number: 1, title: 'Upload', description: 'Add Photos' },
            { number: 2, title: 'Tag', description: 'Label Rooms' },
            { number: 3, title: 'Details', description: 'Add Info' },
            { number: 4, title: 'Review', description: 'Confirm & Go' }
        ];
        return (
            <div className="mb-8">
                <ol className="grid grid-cols-4 gap-2">
                    {steps.map((item, index) => (
                        <li key={item.title} className="text-center">
                            <div className={`flex items-center justify-center w-10 h-10 mx-auto rounded-full lg:h-12 lg:w-12 shrink-0 ${index + 1 <= step ? 'bg-red-700 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {index + 1 < step ? <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6" /> : <span className="font-semibold">{item.number}</span>}
                            </div>
                            <h3 className={`font-semibold text-sm mt-2 ${index + 1 <= step ? 'text-red-700' : 'text-gray-600'}`}>{item.title}</h3>
                            <p className="text-xs text-gray-400">{item.description}</p>
                        </li>
                    ))}
                </ol>
            </div>
        );
    };
    
    const RecommendationCard = ({ recommendation }) => {
        return (
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 not-prose">
                {recommendation.filePreview && (
                     <img src={recommendation.filePreview} alt={recommendation.tag} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                     <p className="text-sm font-semibold uppercase" style={{color: '#B91C1C'}}>{recommendation.tag}</p>
                    <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Eye className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-700">{recommendation.observation}</p>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mt-4 mb-3">{recommendation.title}</h3>
                    <p className="text-gray-600 mb-2"><strong>Action:</strong> {recommendation.action}</p>
                     <p className="text-gray-600 mb-4"><strong>Rationale:</strong> {recommendation.rationale}</p>
                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center">
                            <CircleDollarSign className="w-5 h-5 mr-2 text-gray-500" />
                            <div>
                                <p className="font-semibold text-gray-800">DIY: {recommendation.diyCost}</p>
                                <p className="font-semibold text-gray-800">Pro: {recommendation.profCost}</p>
                            </div>
                        </div>
                        <div className="flex items-center col-span-2">
                             <Clock className="w-5 h-5 mr-2 text-gray-500" />
                             <p className="font-semibold text-gray-800">{recommendation.timeframe}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <ReportStyles />
            <input type="file" ref={replaceImageInputRef} onChange={handleReplaceFile} className="hidden" accept="image/jpeg, image/png" />
            
            <LeadCaptureModal 
                isOpen={showLeadModal}
                onClose={handleLeadModalClose}
                onSubmit={handleLeadSubmit}
                reportId={reportId}
            />
            
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center py-4">
                        <img src="https://storage.googleapis.com/attachment-prod-e2ad/488025/ctgu3vvdldus777bt4u0.png" alt="Atria Logo" className="h-10 mr-4"/>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                            Atria Real Estate Group <span style={{ fontFamily: "'Playfair Display', serif", color: '#B91C1C' }} className="font-bold">SnapValue</span>
                        </h1>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                { !report && (<>
                 <p className="text-center text-gray-600 max-w-3xl mx-auto text-lg">
                    Instantly discover ways to boost your home's value before you sell.
                </p>
                <div className="text-center bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-inner my-8 border border-gray-200 max-w-4xl mx-auto">
                    <h2 className="text-xl font-semibold mb-2" style={{color: '#B91C1C'}}>Unlock the Hidden Potential in Every Room</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Get instant, expert-backed recommendations to boost your home's market value—just by uploading a few photos. SnapValue uses smart image analysis to pinpoint simple, high-impact improvements like decluttering, lighting upgrades, curb appeal enhancements, and more. No guesswork, no expensive remodels—just clear, actionable steps to make your home listing-ready and irresistible to buyers.
                    </p>
                </div>
                 <div className="text-center bg-gray-100 p-6 rounded-lg my-8 border border-gray-200 max-w-4xl mx-auto">
                    <p className="text-gray-700 italic leading-relaxed">"SnapValue found three simple fixes that I believe added $15,000 to my sale price. Invaluable."</p>
                    <p className="mt-2 font-semibold text-gray-800">- J. Doe, Woodbury, MN</p>
                </div>
                </>)}

                <div className="grid grid-cols-1 gap-8">
                    {/* Input Area */}
                    {!report && (
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto w-full">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-center">Your Path to a Higher Home Value</h2>
                                <p className="text-sm text-gray-500 text-center">Follow these four simple steps to generate your personalized report.</p>
                            </div>
                            <ProgressBar />
                            
                            {rateLimitHeaders && (
                                <div className="mb-4">
                                    <RateLimitInfo headers={rateLimitHeaders} />
                                </div>
                            )}
                            
                            <div className="mt-8">
                                {step === 1 && (
                                    <div>
                                        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-red-700 bg-red-50' : 'border-gray-300 hover:border-red-600'}`}>
                                            <input {...getInputProps()} />
                                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                                            <p className="mt-2 text-gray-600">Drag & drop files here, or <span className="font-semibold" style={{color: '#B91C1C'}}>browse</span></p>
                                            <p className="text-xs text-gray-500 mt-1">Up to 8 images (JPG, PNG, max 10MB each)</p>
                                        </div>
                                        {files.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                {files.map(fileObj => (
                                                    <div key={fileObj.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                                                        <div className="flex items-center truncate">
                                                            <File className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0"/>
                                                            <span className="text-sm font-medium truncate">{fileObj.file.name}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => removeFile(fileObj.id)} 
                                                            className="text-gray-500 hover:text-red-600 ml-2"
                                                            aria-label={`Remove ${fileObj.file.name}`}
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {step === 2 && (
                                    <div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {files.map((fileObj, index) => (
                                                <div key={fileObj.id} className="space-y-2">
                                                    <img src={fileObj.preview} alt={`preview ${index}`} className="w-full h-40 object-cover rounded-lg"/>
                                                    <div className="relative">
                                                        <Tags className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                        <select value={fileObj.tag} onChange={(e) => handleTagChange(index, e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-700 focus:border-red-700 appearance-none">
                                                            <option value="">Select a tag...</option>
                                                            {photoTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {step === 3 && (
                                    <div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-4 max-w-xl mx-auto">
                                            <div className="md:col-span-1"><label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input id="city" type="text" placeholder="e.g., Woodbury" value={city} onChange={e => updateState({ city: e.target.value })} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-700 focus:border-red-700" /></div></div>
                                            <div className="md:col-span-1"><label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input id="state" type="text" placeholder="e.g., Minnesota" value={stateName} onChange={e => updateState({ stateName: e.target.value })} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-700 focus:border-red-700" /></div></div>
                                            <div className="md:col-span-1"><label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">Selling Timeline</label><div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><select id="timeline" value={timeline} onChange={e => updateState({ timeline: e.target.value })} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-700 focus:border-red-700 appearance-none"><option>Within one month</option><option>1-3 months</option><option>3-6 months</option><option>Just curious</option></select></div></div>
                                            <div className="md:col-span-1"><label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">Improvement Budget ($)</label><div className="relative"><CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input id="budget" type="number" placeholder="e.g., 1000" value={budget} onChange={e => updateState({ budget: e.target.value })} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-700 focus:border-red-700" /></div></div>
                                            <div className="md:col-span-2"><label htmlFor="work-preference" className="block text-sm font-medium text-gray-700 mb-1">Work Preference</label><div className="relative"><Wrench className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><select id="work-preference" value={workPreference} onChange={e => updateState({ workPreference: e.target.value })} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-700 focus:border-red-700 appearance-none"><option>A mix of DIY and Professional work</option><option>DIY only</option><option>Professional work only</option></select></div></div>
                                        </div>
                                    </div>
                                )}
                                {step === 4 && (
                                    <div>
                                        <div className="space-y-4"><div><h3 className="font-semibold text-gray-700 mb-2">Uploaded Photos:</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{files.map((fileObj, index) => (<div key={fileObj.id} className="relative group"><img src={fileObj.preview} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-lg"/><div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-opacity rounded-lg">                                                                <button 
                                                                    onClick={() => handleChangePhotoClick(index)} 
                                                                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-black bg-opacity-60 px-2 py-1 rounded-md text-xs"
                                                                    aria-label={`Change photo ${index + 1}`}
                                                                >
                                                                    <Replace className="w-3 h-3 mr-1" aria-hidden="true" />Change
                                                                </button></div></div>))}</div></div>
                                            <div className="bg-gray-50 p-4 rounded-lg border">
                                                <h3 className="font-semibold text-gray-700">Location:</h3><p className="text-gray-600 text-sm">{city}, {stateName}</p>
                                                <h3 className="font-semibold text-gray-700 mt-2">Timeline:</h3><p className="text-gray-600 text-sm">{timeline}</p>
                                                <h3 className="font-semibold text-gray-700 mt-2">Budget:</h3><p className="text-gray-600 text-sm">${budget}</p>
                                                <h3 className="font-semibold text-gray-700 mt-2">Work Preference:</h3><p className="text-gray-600 text-sm">{workPreference}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                             <div className="mt-8">
                                 {error && (
                                    <div className="flex items-start text-red-500 text-sm mb-4">
                                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                                        <p>{error}</p>
                                        {lastRequestId && (
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(lastRequestId)}
                                                className="ml-2 text-xs underline hover:text-red-700"
                                                title="Copy request ID for support"
                                            >
                                                (ID: {lastRequestId.slice(0, 8)}...)
                                            </button>
                                        )}
                                    </div>
                                 )}
                                 <div className="flex gap-4">
                                    {step > 1 && (<button onClick={prevStep} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all"><ArrowLeft className="h-5 w-5 mr-2" />Back</button>)}
                                    {step < 4 && (<button onClick={nextStep} className="w-full text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all" style={{backgroundColor: '#B91C1C'}}>Next<ArrowRight className="h-5 w-5 ml-2" /></button>)}
                                    {step === 4 && (
                                         <button onClick={generateReport} disabled={isLoading} className="w-full text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all disabled:bg-gray-400" style={{backgroundColor: '#B91C1C'}}>
                                            {isLoading ? (<><Loader className="animate-spin h-5 w-5 mr-3" />Generating Report...</>) : (<><Wand className="h-5 w-5 mr-3" />Generate Report</>)}
                                        </button>
                                    )}
                                 </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Report Viewer */}
                    {(report || isLoading) && (
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-semibold mb-4 text-center">Your SnapValue Report</h2>
                            {isLoading && (<div className="flex flex-col items-center justify-center min-h-[400px]"><Loader className="animate-spin h-16 w-16" style={{color: '#B91C1C'}} /><p className="mt-4 text-gray-600 text-center">{loadingMessage}</p></div>)}
                            {report && (
                                 <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Priority Improvements</h2>
                                    {report.priority && report.priority.map((rec, index) => <RecommendationCard key={index} recommendation={rec} />)}
                                    {report.general && (
                                        <div className="prose-report max-w-none" dangerouslySetInnerHTML={{ __html: marked(report.general) }}/>
                                    )}
                                    <div className="bg-white rounded-lg shadow-lg mt-8 p-6 border border-gray-200">
                                        <h2 className="text-xl font-semibold mb-1 text-green-600">Report Complete!</h2>
                                        <p className="text-gray-600 mb-4 text-sm">Download your professional PDF report or schedule a consultation.</p>
                                        <div className="space-y-4">
                                            <button onClick={downloadPDF} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all">
                                                <Download className="h-5 w-5 mr-2" />Download PDF Report
                                            </button>
                                            <a 
                                                href={CALENDLY_URL} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all"
                                                onClick={() => trackEvent('calendly_clicked', { report_id: reportId })}
                                            >
                                                <Calendar className="h-5 w-5 mr-2" />Schedule Consultation
                                                <ExternalLink className="h-4 w-4 ml-1" />
                                            </a>
                                            <button onClick={resetApp} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all">
                                                <RefreshCw className="h-5 w-5 mr-2" />Start New Report
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <footer className="bg-gray-800 text-white mt-12">
                <div className="container mx-auto py-12 px-6">
                    <div className="text-center">
                        <h3 className="text-3xl font-bold mb-4" style={{fontFamily: "'Playfair Display', serif"}}>Ready for a Professional Consultation?</h3>
                        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">This AI report is a great starting point. For a detailed market analysis and a personalized strategy to sell your home for top dollar, contact me today.</p>
                        <a 
                            href="mailto:Anne@Velte.com" 
                            className="inline-block text-white font-bold py-3 px-6 rounded-lg transition-all text-lg hover:opacity-90" 
                            style={{backgroundColor: '#B91C1C'}}
                            aria-label="Email Anne Marie Velte for consultation"
                        >
                            Contact Anne Marie Velte
                        </a>
                    </div>
                    <div className="mt-10 border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-center text-center">
                        <div className="mb-4 md:mb-0 md:mr-8">
                            <p className="font-bold text-lg">Anne Marie Velte, REALTOR®</p>
                            <p className="text-gray-400">Atria Real Estate Group</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-2 text-sm">
                            <a href="tel:612-940-6337" className="flex items-center hover:text-red-500 transition-colors">
                                <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
                                <span>(612) 940-6337</span>
                            </a>
                            <a href="mailto:Anne@Velte.com" className="flex items-center hover:text-red-500 transition-colors">
                                <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
                                <span>Anne@Velte.com</span>
                            </a>
                            <a href="http://www.atriarealestategroup.kw.com" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-red-500 transition-colors">
                                <Globe className="w-4 h-4 mr-2" aria-hidden="true" />
                                <span>atriarealestategroup.kw.com</span>
                            </a>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-500">
                        <ApiHealthIndicator isHealthy={apiHealthy} />
                        <span className="text-gray-600">•</span>
                        <button 
                            onClick={requestDataDeletion} 
                            className="hover:text-white underline"
                            aria-label="Request deletion of your personal data"
                        >
                            Request Data Deletion
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}