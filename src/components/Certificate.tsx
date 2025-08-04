import React, { useRef } from 'react';
import { useQuiz } from '../context/QuizContext';
import { Award, Download, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateProps {
  username: string;
  score: number;
  maxScore: number;
  certificationLevel: string;
}

const Certificate: React.FC<CertificateProps> = ({ 
  username, 
  score, 
  maxScore, 
  certificationLevel 
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const percentage = Math.round((score / maxScore) * 100);
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const downloadPDF = async () => {
    if (!certificateRef.current) return;
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${username.replace(/\s+/g, '_')}_${certificationLevel.toLowerCase()}_certificate.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const printCertificate = () => {
    const printWindow = window.open('', '', 'height=650,width=900');
    if (!printWindow || !certificateRef.current) return;
    
    printWindow.document.write('<html><head><title>Certificate</title>');
    printWindow.document.write('<style>body { margin: 0; padding: 20px; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(certificateRef.current.outerHTML);
    printWindow.document.write('</body></html>');
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="my-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md mb-4">
        <div 
          ref={certificateRef} 
          className="certificate-container bg-white text-gray-800 p-8 rounded-lg border-8 border-double border-green-600 relative overflow-hidden"
          style={{ minHeight: '500px' }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 z-0 opacity-5">
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-repeat" 
                 style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBzdHJva2U9IiMyMjIiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjAiLz48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxMCIvPjxwYXRoIGQ9Ik0zMCwxMCB2LTEwIE01MCwzMCBoMTAgTTMwLDUwIHYxMCBNMTAsMzAgaC0xMCIvPjwvZz48L3N2Zz4=')" }}>
            </div>
          </div>

          {/* Certificate Content */}
          <div className="relative z-10 text-center">
            {/* Header */}
            <div className="mb-6">
              <div className="text-green-700 text-xl font-bold mb-1">CERTIFICATE OF ACHIEVEMENT</div>
              <div className="text-3xl font-serif font-bold text-gray-900 mb-1">Innovation Cell</div>
              <div className="text-sm text-gray-600">{certificationLevel} Certification</div>
            </div>
            
            {/* Award Icon */}
            <div className="mb-4 flex justify-center">
              <div className="bg-green-50 p-3 rounded-full">
                <Award className="h-16 w-16 text-green-600" />
              </div>
            </div>
            
            {/* Main Text */}
            <div className="mb-8">
              <div className="text-lg text-gray-600 mb-2">This is to certify that</div>
              <div className="text-3xl font-bold text-gray-900 font-serif mb-2">{username}</div>
              <div className="text-lg text-gray-600 mb-4">has successfully completed the {certificationLevel} Quiz with a score of</div>
              <div className="flex justify-center items-center gap-2 mb-2">
                <span className="text-4xl font-bold text-green-700">{score}</span>
                <span className="text-xl text-gray-800">out of</span>
                <span className="text-4xl font-bold text-gray-800">{maxScore}</span>
              </div>
              <div className="text-2xl font-bold mb-4 text-green-700">{percentage}%</div>
              <div className="inline-block border-2 border-green-600 px-4 py-1 rounded-full text-green-800 font-medium">
                {certificationLevel}
              </div>
            </div>
            
            {/* Date & Signature */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-left">
                <div className="text-sm text-gray-600 mb-1">Date of Issuance:</div>
                <div className="text-md font-medium text-gray-800">{date}</div>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <img 
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAAqCAYAAABRCaLsAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTA0LTIzVDE0OjE5OjA1KzA1OjMwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMy0wNC0yM1QxNDoyMDoyMSswNTozMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wNC0yM1QxNDoyMDoyMSswNTozMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1NmY0MmFmMS04NGJl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" 
                    alt="Signature" 
                    className="h-12 mx-auto" 
                  />
                </div>
                <div className="text-sm text-gray-600">Authorized by:</div>
                <div className="text-md font-medium text-gray-800">MD ABU SHALEM ALAM</div>
              </div>
            </div>
            
            {/* Certificate ID */}
            <div className="text-xs text-gray-500 mt-4">
              Certificate ID: {Math.random().toString(36).substring(2, 12).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button 
          onClick={downloadPDF}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <Download className="h-5 w-5 mr-2" />
          Download PDF
        </button>
        
        <button 
          onClick={printCertificate}
          className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <Printer className="h-5 w-5 mr-2" />
          Print Certificate
        </button>
      </div>
    </div>
  );
};

export default Certificate;