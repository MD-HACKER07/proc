import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, X, Calendar, BookOpen, Star, Crown } from 'lucide-react';
import signatureImg from '../assets/images/sign.png';

interface CertificateProps {
  studentName: string;
  subject: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: any;
  onClose: () => void;
}

const Certificate: React.FC<CertificateProps> = ({
  studentName,
  subject,
  score,
  totalQuestions,
  percentage,
  completedAt,
  onClose,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateValue: any): string => {
    try {
      let date: Date;
      if (!dateValue)
        return new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
      if (dateValue && typeof dateValue === 'object' && (dateValue.seconds || dateValue._seconds)) {
        const seconds = dateValue.seconds || dateValue._seconds;
        date = new Date(seconds * 1000);
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      } else if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      } else {
        date = new Date();
      }
      if (isNaN(date.getTime()))
        return new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
      return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A+', text: 'Outstanding' };
    if (percentage >= 80) return { grade: 'A', text: 'Excellent' };
    if (percentage >= 70) return { grade: 'B+', text: 'Very Good' };
    if (percentage >= 60) return { grade: 'B', text: 'Good' };
    if (percentage >= 50) return { grade: 'C', text: 'Pass' };
    return { grade: 'D', text: 'Keep Trying' };
  };

  const gradeInfo = getGrade();
  const formattedDate = formatDate(completedAt);

  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificate - ${studentName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Great+Vibes&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            @page { 
              size: A4 landscape; 
              margin: 0; 
            }
            html, body {
              width: 297mm;
              height: 210mm;
              margin: 0;
              padding: 0;
              overflow: hidden;
            }
            body { 
              font-family: 'Poppins', sans-serif; 
              background: #f8fafc;
              display: flex;
              justify-content: center;
              align-items: center;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .certificate {
              width: 297mm;
              height: 210mm;
              background: linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fef08a 100%);
              position: relative;
              overflow: hidden;
            }
            .gold-border {
              position: absolute;
              top: 8mm; left: 8mm; right: 8mm; bottom: 8mm;
              border: 3px solid #b8860b;
              pointer-events: none;
            }
            .gold-border-inner {
              position: absolute;
              top: 12mm; left: 12mm; right: 12mm; bottom: 12mm;
              border: 1px solid #daa520;
              pointer-events: none;
            }
            .corner {
              position: absolute;
              width: 50px;
              height: 50px;
              border: 3px solid #b8860b;
            }
            .corner-tl { top: 15mm; left: 15mm; border-right: none; border-bottom: none; }
            .corner-tr { top: 15mm; right: 15mm; border-left: none; border-bottom: none; }
            .corner-bl { bottom: 15mm; left: 15mm; border-right: none; border-top: none; }
            .corner-br { bottom: 15mm; right: 15mm; border-left: none; border-top: none; }
            .content {
              position: relative;
              z-index: 1;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 15mm 25mm;
              text-align: center;
            }
            .header-badge {
              background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
              color: #ffd700;
              padding: 8px 40px;
              font-size: 11px;
              letter-spacing: 4px;
              text-transform: uppercase;
              font-weight: 600;
              border-radius: 0 0 10px 10px;
              position: absolute;
              top: 0;
              left: 50%;
              transform: translateX(-50%);
            }
            .logo {
              font-family: 'Great Vibes', cursive;
              font-size: 36px;
              color: #1e3a5f;
              margin-bottom: 5px;
            }
            .title {
              font-family: 'Cinzel', serif;
              font-size: 48px;
              font-weight: 700;
              color: #1e3a5f;
              letter-spacing: 10px;
              margin: 8px 0;
              text-transform: uppercase;
            }
            .subtitle {
              color: #64748b;
              font-size: 14px;
              margin: 10px 0;
            }
            .student-name {
              font-family: 'Great Vibes', cursive;
              font-size: 44px;
              color: #1e3a5f;
              margin: 10px 0;
              border-bottom: 2px solid #b8860b;
              padding-bottom: 5px;
              display: inline-block;
            }
            .exam-info {
              color: #64748b;
              font-size: 13px;
              margin: 8px 0;
            }
            .exam-name {
              display: inline-block;
              background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
              color: white;
              padding: 10px 35px;
              border-radius: 25px;
              font-size: 16px;
              font-weight: 600;
              margin: 10px 0;
            }
            .score-row {
              display: flex;
              justify-content: center;
              gap: 30px;
              margin: 15px 0;
            }
            .score-box {
              background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
              color: white;
              padding: 15px 35px;
              border-radius: 12px;
              text-align: center;
            }
            .score-value {
              font-size: 28px;
              font-weight: 700;
            }
            .score-label {
              font-size: 10px;
              opacity: 0.9;
              letter-spacing: 2px;
              margin-top: 3px;
            }
            .date-text {
              color: #64748b;
              font-size: 12px;
              margin: 12px 0;
            }
            .signature-area {
              margin-top: 15px;
              text-align: center;
            }
            .signature-img {
              height: 70px;
              margin-bottom: 5px;
            }
            .signature-line {
              width: 180px;
              height: 2px;
              background: #b8860b;
              margin: 0 auto 8px;
            }
            .signature-title {
              font-size: 12px;
              color: #1e3a5f;
              font-weight: 600;
            }
            .quote-box {
              margin-top: 12px;
              padding: 10px 30px;
              background: rgba(30, 58, 95, 0.08);
              border-left: 3px solid #b8860b;
              border-radius: 5px;
              max-width: 500px;
            }
            .quote-text {
              font-style: italic;
              color: #1e3a5f;
              font-size: 11px;
              line-height: 1.5;
            }
            .seal {
              position: absolute;
              bottom: 20mm;
              right: 25mm;
              width: 60px;
              height: 60px;
              border: 3px solid #b8860b;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%);
            }
            .seal-text {
              font-size: 8px;
              color: #b8860b;
              font-weight: 700;
              text-align: center;
              line-height: 1.2;
            }
            @media print {
              html, body {
                width: 297mm;
                height: 210mm;
              }
              .certificate {
                width: 297mm;
                height: 210mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="gold-border"></div>
            <div class="gold-border-inner"></div>
            <div class="corner corner-tl"></div>
            <div class="corner corner-tr"></div>
            <div class="corner corner-bl"></div>
            <div class="corner corner-br"></div>
            
            <div class="header-badge">★ Certificate of Excellence ★</div>
            
            <div class="content">
              <div class="logo">SadiyaIgnite</div>
              <div class="title">Certificate</div>
              <div class="subtitle">This is to certify that</div>
              <div class="student-name">${studentName}</div>
              <div class="exam-info">has successfully completed the examination in</div>
              <div class="exam-name">${subject}</div>
              
              <div class="score-row">
                <div class="score-box">
                  <div class="score-value">${score}/${totalQuestions}</div>
                  <div class="score-label">SCORE</div>
                </div>
                <div class="score-box">
                  <div class="score-value">${percentage}%</div>
                  <div class="score-label">GRADE: ${gradeInfo.grade}</div>
                </div>
              </div>
              
              <div class="date-text">Awarded on ${formattedDate}</div>
              
              <div class="signature-area">
                <img src="${signatureImg}" alt="Signature" class="signature-img" />
                <div class="signature-line"></div>
                <div class="signature-title">Director, SadiyaIgnite</div>
              </div>
              
              <div class="quote-box">
                <div class="quote-text">"Success is the sum of small efforts, repeated day in and day out."</div>
              </div>
            </div>
            
            <div class="seal">
              <div class="seal-text">VERIFIED<br/>✓</div>
            </div>
          </div>
          <script>window.onload = function() { setTimeout(function() { window.print(); }, 300); }</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-yellow-500 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6" />
            Certificate of Excellence
          </h2>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2 bg-white text-amber-700 rounded-full font-semibold shadow-lg"
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-70px)] bg-gray-100">
          <motion.div
            ref={certificateRef}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 rounded-lg p-8 shadow-xl border-4 border-amber-600 relative"
          >
            {/* Inner border */}
            <div className="absolute top-3 left-3 right-3 bottom-3 border-2 border-amber-400 rounded pointer-events-none" />

            {/* Corners */}
            <Star className="absolute top-5 left-5 w-6 h-6 text-amber-600" />
            <Star className="absolute top-5 right-5 w-6 h-6 text-amber-600" />
            <Star className="absolute bottom-5 left-5 w-6 h-6 text-amber-600" />
            <Star className="absolute bottom-5 right-5 w-6 h-6 text-amber-600" />

            <div className="text-center py-6">
              <div className="inline-block bg-slate-800 text-amber-400 px-6 py-1 rounded-b-lg text-xs tracking-widest mb-4">
                ★ CERTIFICATE OF EXCELLENCE ★
              </div>

              <p className="text-3xl text-slate-800 mb-2" style={{ fontFamily: 'cursive' }}>
                SadiyaIgnite
              </p>

              <h1 className="text-4xl font-bold text-slate-800 tracking-widest mb-4">CERTIFICATE</h1>

              <p className="text-gray-600 mb-2">This is to certify that</p>

              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="w-6 h-6 text-amber-600" />
                <h2
                  className="text-3xl text-slate-800 border-b-2 border-amber-600 pb-1 px-4"
                  style={{ fontFamily: 'cursive' }}
                >
                  {studentName}
                </h2>
                <Crown className="w-6 h-6 text-amber-600" />
              </div>

              <p className="text-gray-600 mb-2">has successfully completed the examination in</p>

              <div className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-2 rounded-full mb-4">
                <BookOpen className="w-4 h-4" />
                <span className="font-semibold">{subject}</span>
              </div>

              <div className="flex justify-center gap-4 mb-4">
                <div className="bg-slate-800 text-white px-6 py-3 rounded-xl">
                  <p className="text-2xl font-bold">
                    {score}/{totalQuestions}
                  </p>
                  <p className="text-xs opacity-80">SCORE</p>
                </div>
                <div className="bg-slate-800 text-white px-6 py-3 rounded-xl">
                  <p className="text-2xl font-bold">{percentage}%</p>
                  <p className="text-xs opacity-80">GRADE: {gradeInfo.grade}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mb-4">
                <Calendar className="w-4 h-4" />
                <span>Awarded on {formattedDate}</span>
              </div>

              <div className="mt-4">
                <img src={signatureImg} alt="Signature" className="h-16 mx-auto mb-1" />
                <div className="w-40 h-0.5 bg-amber-600 mx-auto mb-1" />
                <p className="text-sm font-semibold text-slate-800">Director, SadiyaIgnite</p>
              </div>

              <div className="mt-4 max-w-md mx-auto bg-slate-100 p-3 rounded border-l-4 border-amber-600">
                <p className="text-xs italic text-slate-700">
                  "Success is the sum of small efforts, repeated day in and day out."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Certificate;
