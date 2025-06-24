import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import './reports-page.css';
import { useAuthFetch } from '../../hooks/authFetch';
import { FaPrint, FaFileAlt } from 'react-icons/fa';
import MonthPicker from '../../components/datePicker/MonthPicker';
import { marked } from 'marked';
import LargeButton from '../../components/buttons/LargeButton';
import FullColorSelect from '../../components/dropdowns/FullColorSelect';

export default function ReportsPage() {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const authFetch = useAuthFetch();

    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState('');
    const [mode, setMode] = useState('analytical');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [year, setYear] = useState();
    const [month, setMonth] = useState();

    const PROMPT_MODES = [
        { id: 'professional', name: 'Professional' },
        { id: 'friendly', name: 'Friendly' },
        { id: 'analytical', name: 'Analytical' },
        { id: 'bullet', name: 'Bullet Points' },
    ];

    // function formatSummary(summaryText) {
    //     return summaryText
    //         .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")  // bold markdown
    //         .replace(/\n/g, "<br />");                         // newlines
    // }

    function formatSummary(summaryText) {
        return marked.parse(summaryText);
    }

    useEffect(() => {
        setYear(selectedDate.getFullYear());
        setMonth(String(selectedDate.getMonth() + 1).padStart(2, '0'));
    }, [selectedDate]);

    const fetchSummary = async () => {
        setLoading(true);

        const dateFrom = `${year}-${month}-01`;
        const dateTo = new Date(year, selectedDate.getMonth() + 1, 0).toISOString().split('T')[0];

        try {
            const res = await authFetch(
                `${API_BASE_URL}/api/analytics/summary/?mode=${mode}&from=${dateFrom}&to=${dateTo}`
            );
            if (res.summary) {
                setSummary(formatSummary(res.summary));
            } else {
                setSummary('No summary returned.');
            }
        } catch (err) {
            console.error('Failed to load summary:', err);
            setSummary('An error occurred while generating the summary.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>Spending Summary</title></head>
                    <body style="font-family: sans-serif; padding: 2rem;">
                    <h1>📊 AI Spending Summary</h1>
                    ${summary}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handleExportText = () => {
        const plainText = summary
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, ''); // Strip all HTML tags

        const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `spending-summary-${year}-${month}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    return (
        <AppLayout>
            <div className='reports-container'>
                <h1>Spending Overview</h1>
                <div className="report-controls">
                    <div>
                        <label>
                            <span>Month: </span>
                            <MonthPicker
                                value={selectedDate}
                                onChange={setSelectedDate}
                                isClearable={false}
                            />
                        </label>
                        <LargeButton onClick={fetchSummary} className="generate-button">
                            Generate Summary
                        </LargeButton>
                    </div>
                    <div>
                        <label>
                            <span>Style: </span>
                            <FullColorSelect
                                value={PROMPT_MODES.find((modeOption) => modeOption.id === mode)}
                                onChange={(selected) => {
                                    setMode(selected?.id );
                                }}
                                options={PROMPT_MODES}
                                required={false}
                                isInt={false}
                            />
                        </label>
                    </div>
                </div>

                <div className="summary-report-box">
                    <h2>📊 AI Spending Summary</h2>
                    {loading ? (
                        <p>Generating summary...</p>
                    ) : (
                        <div
                            style={{ textAlign: "justify" }}
                            dangerouslySetInnerHTML={{ __html: formatSummary(summary) }}
                        />
                    )}
                </div>
                {summary && (
                    <div style={{ marginTop: '1rem', width: "100%", display: 'flex', justifyContent: "center", gap: '1rem' }}>
                        <LargeButton onClick={handlePrint} className="generate-button">{FaPrint && <FaPrint />} Print</LargeButton>
                        <LargeButton onClick={handleExportText} className="generate-button">{FaFileAlt && <FaFileAlt />} Export as Text</LargeButton>
                    </div>
                )}
            </div>

        </AppLayout>
    );
}