import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface UniversityMatch {
  name: string;
  location: string;
  ranking?: string;
  tuition: string;
  acceptance_rate: string;
  difficulty: 'Low' | 'Moderate' | 'High' | 'Very High';
  student_body: number;
  description: string;
  programs: string[];
  school_scholarships: {
    merit_scholarships: Array<{
      name: string;
      amount: string;
      eligibility: string;
    }>;
  };
  website?: string;
  personalized_summary: string;
}

interface ScholarshipMatch {
  name: string;
  sponsor: string;
  amount: string;
  deadline: string;
  match_score: number;
  difficulty: string;
  requirements: string[];
  essays_required: number;
  application_link?: string;
  tips: string;
}

interface HousingRecommendation {
  name: string;
  address?: string;
  rent: string;
  distance: string;
  type: string;
  amenities: string[];
  pros: string[];
  cons: string[];
  contact: string;
  match_score: number;
  rating?: number;
}

// Typography and layout constants
const TYPOGRAPHY = {
  TITLE_SIZE: 18,
  HEADER_SIZE: 14,
  BODY_SIZE: 11,
  SMALL_SIZE: 9,
  LINE_SPACING: 1.2,
  FONT_FAMILY: 'helvetica' as const,
} as const;

const MARGINS = {
  TOP: 25.4,
  BOTTOM: 25.4,
  LEFT: 25.4,
  RIGHT: 25.4,
} as const;

const PAGE = {
  WIDTH: 210, // A4 width in mm
  HEIGHT: 297, // A4 height in mm
  USABLE_WIDTH: 210 - MARGINS.LEFT - MARGINS.RIGHT,
} as const;

export class DynamicPDFGenerator {
  private doc: jsPDF;
  private currentY: number = MARGINS.TOP;
  private pageHeight: number = PAGE.HEIGHT - MARGINS.BOTTOM;
  private leftMargin: number = MARGINS.LEFT;
  private rightMargin: number = PAGE.WIDTH - MARGINS.RIGHT;
  private reportTitle: string = '';

  constructor() {
    this.doc = new jsPDF();
  }

  private addPage() {
    this.doc.addPage();
    this.currentY = MARGINS.TOP;
    this.addPageHeader();
  }

  private addPageHeader() {
    if (this.reportTitle && this.doc.getCurrentPageInfo().pageNumber > 1) {
      const currentPage = this.doc.getCurrentPageInfo().pageNumber;
      this.doc.setFontSize(TYPOGRAPHY.SMALL_SIZE);
      this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'italic');
      this.doc.text(this.reportTitle, this.leftMargin, MARGINS.TOP - 10);
      this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'normal');
    }
  }

  private checkPageBreak(height: number = 10) {
    if (this.currentY + height > this.pageHeight) {
      this.addPage();
    }
  }

  private addTitle(title: string) {
    this.reportTitle = title;
    this.doc.setFontSize(TYPOGRAPHY.TITLE_SIZE);
    this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'bold');
    this.doc.text(title, this.leftMargin, this.currentY);
    this.currentY += TYPOGRAPHY.TITLE_SIZE * TYPOGRAPHY.LINE_SPACING;
    
    // Add a horizontal line
    this.doc.setLineWidth(0.5);
    this.doc.line(this.leftMargin, this.currentY, this.rightMargin, this.currentY);
    this.currentY += 10;
  }

  private addSubtitle(subtitle: string) {
    this.checkPageBreak(15);
    this.doc.setFontSize(TYPOGRAPHY.HEADER_SIZE);
    this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'bold');
    this.doc.text(subtitle, this.leftMargin, this.currentY);
    this.currentY += TYPOGRAPHY.HEADER_SIZE * TYPOGRAPHY.LINE_SPACING;
  }

  private addText(text: string, fontSize: number = TYPOGRAPHY.BODY_SIZE, style: 'normal' | 'bold' = 'normal', indent: number = 0) {
    this.checkPageBreak(8);
    this.doc.setFontSize(fontSize);
    this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, style);
    
    // Process and clean text
    const processedText = this.processRichText(text);
    const splitText = this.doc.splitTextToSize(processedText, this.rightMargin - this.leftMargin - indent);
    this.doc.text(splitText, this.leftMargin + indent, this.currentY);
    this.currentY += (splitText.length * (fontSize * TYPOGRAPHY.LINE_SPACING)) + 3;
  }

  private processRichText(text: string): string {
    if (!text) return '';
    
    let processed = text;
    
    // Remove HTML tags
    processed = processed.replace(/<[^>]*>/g, '');
    
    // Remove markdown bold
    processed = processed.replace(/\*\*(.*?)\*\*/g, '$1');
    
    // Remove markdown italic
    processed = processed.replace(/\*(.*?)\*/g, '$1');
    
    // Remove markdown headers
    processed = processed.replace(/^#+\s+/gm, '');
    
    // Convert HTML entities
    processed = processed.replace(/&nbsp;/g, ' ');
    processed = processed.replace(/&amp;/g, '&');
    processed = processed.replace(/&lt;/g, '<');
    processed = processed.replace(/&gt;/g, '>');
    processed = processed.replace(/&quot;/g, '"');
    processed = processed.replace(/&#39;/g, "'");
    
    // Clean up smart quotes and special characters
    processed = processed.replace(/[\u2018\u2019]/g, "'");
    processed = processed.replace(/[\u201C\u201D]/g, '"');
    processed = processed.replace(/\u2013/g, '-');
    processed = processed.replace(/\u2014/g, '--');
    
    // Normalize line breaks
    processed = processed.replace(/\\n/g, '\n');
    processed = processed.replace(/\r\n/g, '\n');
    processed = processed.replace(/\r/g, '\n');
    
    // Remove all emojis and special symbols
    processed = processed.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
    processed = processed.replace(/[\u{2600}-\u{26FF}]/gu, '');
    processed = processed.replace(/[\u{2700}-\u{27BF}]/gu, '');
    processed = processed.replace(/[📊🏢🔬💼🌟💰📋📅🌐📍🎯📏🏠⭐✅❌⚠️❗🚨🔗⏰]/g, '');
    
    return processed.trim();
  }

  private addFormattedSection(title: string, content: string, useColonFormat: boolean = true) {
    this.checkPageBreak(15);
    
    // Add section title in bold
    this.doc.setFontSize(TYPOGRAPHY.BODY_SIZE);
    this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'bold');
    const titleText = useColonFormat ? `${title}:` : title;
    this.doc.text(titleText, this.leftMargin, this.currentY);
    this.currentY += TYPOGRAPHY.BODY_SIZE * TYPOGRAPHY.LINE_SPACING;
    
    // Add content in normal weight
    if (content) {
      this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'normal');
      const processedContent = this.processRichText(content);
      const splitContent = this.doc.splitTextToSize(processedContent, this.rightMargin - this.leftMargin);
      this.doc.text(splitContent, this.leftMargin, this.currentY);
      this.currentY += (splitContent.length * (TYPOGRAPHY.BODY_SIZE * TYPOGRAPHY.LINE_SPACING)) + 5;
    }
  }

  private addClickableLink(text: string, url: string) {
    this.checkPageBreak(8);
    this.doc.setFontSize(TYPOGRAPHY.BODY_SIZE);
    this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'normal');
    this.doc.setTextColor(0, 0, 255);
    
    try {
      this.doc.textWithLink(text, this.leftMargin, this.currentY, { url: url });
    } catch {
      this.doc.text(text, this.leftMargin, this.currentY);
    }
    
    this.doc.setTextColor(0, 0, 0);
    this.currentY += TYPOGRAPHY.BODY_SIZE * TYPOGRAPHY.LINE_SPACING;
  }

  private addBulletPoint(text: string) {
    this.checkPageBreak(8);
    this.doc.setFontSize(TYPOGRAPHY.BODY_SIZE);
    this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'normal');
    
    const processedText = this.processRichText(text);
    const bulletText = `• ${processedText}`;
    const splitText = this.doc.splitTextToSize(bulletText, this.rightMargin - this.leftMargin - 5);
    this.doc.text(splitText, this.leftMargin + 5, this.currentY);
    this.currentY += (splitText.length * (TYPOGRAPHY.BODY_SIZE * TYPOGRAPHY.LINE_SPACING)) + 2;
  }

  private addScoreChart(matches: Array<{name: string, match_score?: number, acceptance_rate?: string}>) {
    if (!matches || matches.length === 0) {
      return;
    }
    
    this.checkPageBreak(60);
    
    const chartX = this.leftMargin;
    const chartY = this.currentY;
    const chartWidth = 160;
    const chartHeight = Math.min(50, 10 + (matches.length * 10));
    
    if (chartWidth > 0 && chartHeight > 0) {
      this.doc.setLineWidth(1);
      this.doc.rect(chartX, chartY, chartWidth, chartHeight);
      
      const spacing = 8;
      
      matches.slice(0, 5).forEach((match, index) => {
        const itemY = chartY + 8 + (index * spacing);
        
        this.doc.setFontSize(8);
        this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'normal');
        const shortName = match.name.length > 25 ? match.name.substring(0, 25) + '...' : match.name;
        this.doc.text(shortName, chartX + 5, itemY);
        
        if (match.match_score !== undefined) {
          const barWidth = Math.max(1, (match.match_score / 100) * (chartWidth - 100));
          this.doc.setFillColor(59, 130, 246);
          this.doc.rect(chartX + 90, itemY - 2, barWidth, 4, 'F');
          this.doc.text(`${match.match_score}%`, chartX + 90 + barWidth + 5, itemY);
        } else if (match.acceptance_rate) {
          this.doc.text(`${match.acceptance_rate}`, chartX + 90, itemY);
        }
      });
    }
    
    this.currentY = chartY + chartHeight + 10;
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Page number (bottom right)
      this.doc.setFontSize(TYPOGRAPHY.SMALL_SIZE);
      this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'normal');
      const pageText = `Page ${i} of ${pageCount}`;
      this.doc.text(pageText, this.rightMargin - 20, PAGE.HEIGHT - 10);
      
      // Disclaimer (bottom left, italic)
      this.doc.setFontSize(TYPOGRAPHY.SMALL_SIZE);
      this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'italic');
      const disclaimerText = 'This report is generated by AI. Please verify details on official websites.';
      this.doc.text(disclaimerText, this.leftMargin, PAGE.HEIGHT - 10);
    }
  }

  generateUniversityPDF(data: any, userAnswers?: any, userProfile?: any) {
    this.addTitle('Your Personalized University Matches');
    
    this.doc.setFontSize(12);
    this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'italic');
    const subtitle = 'Based on your preferences, here are universities that best fit your profile';
    const splitSubtitle = this.doc.splitTextToSize(subtitle, this.rightMargin - this.leftMargin);
    this.doc.text(splitSubtitle, this.leftMargin, this.currentY);
    this.currentY += (splitSubtitle.length * 7) + 5;
    
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    this.doc.setFontSize(TYPOGRAPHY.BODY_SIZE);
    this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'normal');
    this.doc.text(`Generated on: ${today}`, this.leftMargin, this.currentY);
    this.currentY += 8;
    
    const userName = userProfile?.display_name || 
                    userProfile?.username || 
                    userAnswers?.name || 
                    userAnswers?.user_name || 
                    data?.user_name;
    if (userName) {
      this.doc.text(`Prepared for: ${userName}`, this.leftMargin, this.currentY);
      this.currentY += 8;
    }
    
    this.currentY += 10;
    
    if (userAnswers) {
      this.addSubtitle('Your Profile');
      this.addText(`Academic Level: ${userAnswers.academic_level || 'Not specified'}`);
      this.addText(`Field of Study: ${userAnswers.field_of_study || 'Not specified'}`);
      this.addText(`Budget Range: ${userAnswers.budget || 'Not specified'}`);
      this.addText(`Preferred Location: ${userAnswers.location || 'Not specified'}`);
      this.addText(`GPA: ${userAnswers.gpa || 'Not specified'}`);
      this.addText(`Test Scores: ${userAnswers.test_scores || 'Not specified'}`);
      this.currentY += 5;
    }
    
    if (data.matches && data.matches.length > 0) {
      this.addSubtitle('Match Score Overview');
      this.addScoreChart(data.matches);
    }
    
    this.addSubtitle('Your University Matches');
    
    data.matches?.slice(0, 10).forEach((university: any, index: number) => {
      this.checkPageBreak(100);
      
      this.doc.setFontSize(16);
      this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'bold');
      this.doc.text(university.name, this.leftMargin, this.currentY);
      this.currentY += 15;
      
      this.doc.setFontSize(TYPOGRAPHY.BODY_SIZE);
      this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'normal');
      let locationRankingLine = `Location: ${university.location}`;
      if (university.ranking) {
        locationRankingLine += ` | Ranking: ${university.ranking}`;
      }
      this.doc.text(locationRankingLine, this.leftMargin, this.currentY);
      this.currentY += 8;
      
      const tuitionLine = `Tuition: ${university.tuition} | Acceptance Rate: ${university.acceptance_rate} (Difficulty: ${university.difficulty})`;
      this.doc.text(tuitionLine, this.leftMargin, this.currentY);
      this.currentY += 8;
      
      if (university.student_body) {
        this.doc.text(`Students: ${university.student_body.toLocaleString()}`, this.leftMargin, this.currentY);
        this.currentY += 10;
      } else {
        this.currentY += 5;
      }
      
      if (university.programs && university.programs.length > 0) {
        this.addFormattedSection('Available Programs', university.programs.join(', '));
      }
      
      if (university.school_scholarships?.merit_scholarships && university.school_scholarships.merit_scholarships.length > 0) {
        this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'bold');
        this.doc.text('Scholarships Available:', this.leftMargin, this.currentY);
        this.currentY += 8;
        
        university.school_scholarships.merit_scholarships.slice(0, 3).forEach((scholarship: any) => {
          this.addBulletPoint(`${scholarship.name} — ${scholarship.amount} (${scholarship.eligibility})`);
        });
        this.currentY += 2;
      }
      
      if (university.personalized_summary) {
        this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'bold');
        this.doc.text('Why This School Matches You:', this.leftMargin, this.currentY);
        this.currentY += 8;
        
        this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'normal');
        const quotedSummary = `"${this.processRichText(university.personalized_summary)}"`;
        const splitSummary = this.doc.splitTextToSize(quotedSummary, this.rightMargin - this.leftMargin);
        this.doc.text(splitSummary, this.leftMargin, this.currentY);
        this.currentY += (splitSummary.length * (TYPOGRAPHY.BODY_SIZE * TYPOGRAPHY.LINE_SPACING)) + 5;
      }
      
      if (university.description) {
        this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'bold');
        this.doc.text('Description:', this.leftMargin, this.currentY);
        this.currentY += 8;
        
        this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'normal');
        const cleanDesc = this.processRichText(university.description);
        const splitDesc = this.doc.splitTextToSize(cleanDesc, this.rightMargin - this.leftMargin);
        this.doc.text(splitDesc, this.leftMargin, this.currentY);
        this.currentY += (splitDesc.length * (TYPOGRAPHY.BODY_SIZE * TYPOGRAPHY.LINE_SPACING)) + 5;
      }
      
      if (university.website) {
        this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'normal');
        this.doc.setTextColor(0, 0, 255);
        const websiteText = `Website: ${university.website}`;
        try {
          this.doc.textWithLink(websiteText, this.leftMargin, this.currentY, { url: university.website });
        } catch {
          this.doc.text(websiteText, this.leftMargin, this.currentY);
        }
        this.doc.setTextColor(0, 0, 0);
        this.currentY += 10;
      }
      
      this.doc.setLineWidth(0.5);
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.leftMargin, this.currentY + 5, this.rightMargin, this.currentY + 5);
      this.currentY += 20;

      if ((university as any).detailed_info) {
        const info = (university as any).detailed_info;
        this.addText('Academic Details:', TYPOGRAPHY.BODY_SIZE, 'bold');
        if (info.student_faculty_ratio) {
          this.addBulletPoint(`Student-Faculty Ratio: ${info.student_faculty_ratio}`);
        }
        if (info.retention_rate) {
          this.addBulletPoint(`Retention Rate: ${info.retention_rate}`);
        }
        if (info.graduation_rate) {
          this.addBulletPoint(`Graduation Rate: ${info.graduation_rate}`);
        }
        
        if (info.facilities && info.facilities.length > 0) {
          this.addText('Key Facilities:', TYPOGRAPHY.BODY_SIZE, 'bold');
          info.facilities.slice(0, 5).forEach((facility: string) => {
            this.addBulletPoint(facility);
          });
        }

        if (info.research_opportunities) {
          this.addText('Research Opportunities:', TYPOGRAPHY.BODY_SIZE, 'bold');
          this.addText(info.research_opportunities);
        }

        if (info.career_services) {
          this.addText('Career Services:', TYPOGRAPHY.BODY_SIZE, 'bold');
          this.addText(info.career_services);
        }

        if (info.notable_alumni && info.notable_alumni.length > 0) {
          this.addText('Notable Alumni:', TYPOGRAPHY.BODY_SIZE, 'bold');
          info.notable_alumni.slice(0, 3).forEach((alumni: string) => {
            this.addBulletPoint(alumni);
          });
        }
      }

      if ((university as any).school_scholarships) {
        const scholarships = (university as any).school_scholarships;
        this.addText('Available Scholarships:', TYPOGRAPHY.BODY_SIZE, 'bold');
        
        if (scholarships.merit_scholarships && scholarships.merit_scholarships.length > 0) {
          this.addText('Merit-Based Scholarships:', TYPOGRAPHY.BODY_SIZE, 'bold');
          scholarships.merit_scholarships.slice(0, 3).forEach((scholarship: any) => {
            this.addBulletPoint(`${scholarship.name}: ${scholarship.amount} - ${scholarship.eligibility}`);
            if (scholarship.deadline) {
              this.addText(`   Deadline: ${scholarship.deadline}`, 9);
            }
          });
        }

        if (scholarships.need_based && scholarships.need_based.length > 0) {
          this.addText('Need-Based Scholarships:', TYPOGRAPHY.BODY_SIZE, 'bold');
          scholarships.need_based.slice(0, 2).forEach((scholarship: any) => {
            this.addBulletPoint(`${scholarship.name}: ${scholarship.amount} - ${scholarship.eligibility}`);
          });
        }

        if (scholarships.program_specific && scholarships.program_specific.length > 0) {
          this.addText('Program-Specific Scholarships:', TYPOGRAPHY.BODY_SIZE, 'bold');
          scholarships.program_specific.slice(0, 2).forEach((scholarship: any) => {
            this.addBulletPoint(`${scholarship.name}: ${scholarship.amount} - ${scholarship.eligibility}`);
          });
        }
      }
      
      if (university.requirements && university.requirements.length > 0) {
        this.addText('Application Requirements:', TYPOGRAPHY.BODY_SIZE, 'bold');
        university.requirements.slice(0, 8).forEach((req: string) => {
          this.addBulletPoint(req);
        });
      }
      
      if (university.application_deadline) {
        this.addText(`Application Deadline: ${university.application_deadline}`, TYPOGRAPHY.BODY_SIZE, 'bold');
      }
      
      if (university.website) {
        this.addText(`Website: ${university.website}`);
      }
      
      this.currentY += 15;
    });
    
    this.addSubtitle('Important Information');
    this.addBulletPoint('This report is generated by AI based on your preferences and responses.');
    this.addBulletPoint('Please verify all information on official university websites before making decisions.');
    this.addBulletPoint('Tuition costs, acceptance rates, and other data may have changed since generation.');
    this.addBulletPoint('Contact university admissions offices directly for the most current information.');
    this.addBulletPoint('Scholarship availability and requirements may vary by academic year.');
    
    this.addFooter();
    return this.doc;
  }

  generateScholarshipPDF(data: any, userAnswers?: any, userProfile?: any) {
    this.addTitle('Your Scholarship Opportunities Report');
    
    this.doc.setFontSize(12);
    this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'italic');
    const subtitle = 'Personalized scholarship matches based on your academic profile and achievements';
    const splitSubtitle = this.doc.splitTextToSize(subtitle, this.rightMargin - this.leftMargin);
    this.doc.text(splitSubtitle, this.leftMargin, this.currentY);
    this.currentY += (splitSubtitle.length * 7) + 5;
    
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    this.doc.setFontSize(TYPOGRAPHY.BODY_SIZE);
    this.doc.setFont(TYPOGRAPHY.FONT_FAMILY, 'normal');
    this.doc.text(`Generated on: ${today}`, this.leftMargin, this.currentY);
    this.currentY += 8;
    
    const userName = userProfile?.display_name || 
                    userProfile?.username || 
                    userAnswers?.name || 
                    userAnswers?.user_name || 
                    data?.user_name;
    if (userName) {
      this.doc.text(`Prepared for: ${userName}`, this.leftMargin, this.currentY);
      this.currentY += 8;
    }
    
    this.currentY += 10;
    
    if (userAnswers) {
      this.addSubtitle('Your Profile');
      this.addText(`Academic Level: ${userAnswers.academic_level || 'Not specified'}`);
      this.addText(`GPA: ${userAnswers.gpa || 'Not specified'}`);
      this.addText(`Field of Study: ${userAnswers.field_of_study || 'Not specified'}`);
      this.addText(`Financial Need: ${userAnswers.financial_need || 'Not specified'}`);
      this.addText(`Extracurricular Activities: ${userAnswers.extracurriculars || 'Not specified'}`);
      this.addText(`Awards/Honors: ${userAnswers.awards || 'Not specified'}`);
      this.currentY += 5;
    }
    
    if (data.scholarships && data.scholarships.length > 0) {
      this.addSubtitle('Scholarship Opportunity Summary');
      const totalAmount = data.scholarships.reduce((sum: number, s: ScholarshipMatch) => {
        const amount = s.amount.replace(/[^\d]/g, '');
        return sum + (parseInt(amount) || 0);
      }, 0);
      
      this.addText(`Total Scholarships Found: ${data.scholarships.length}`);
      if (totalAmount > 0) {
        this.addText(`Total Potential Value: $${totalAmount.toLocaleString()}`);
      }
      
      const avgMatch = data.scholarships.reduce((sum: number, s: ScholarshipMatch) => sum + s.match_score, 0) / data.scholarships.length;
      this.addText(`Average Match Score: ${avgMatch.toFixed(1)}%`);
      this.currentY += 5;
      
      this.addSubtitle('Scholarship Match Overview');
      this.addScoreChart(data.scholarships.map((s: ScholarshipMatch) => ({
        name: s.name,
        match_score: s.match_score
      })));
    }
    
    this.addSubtitle('Your Scholarship Matches');
    
    data.scholarships?.forEach((scholarship: ScholarshipMatch, index: number) => {
      this.checkPageBreak(50);
      
      this.addText(`${index + 1}. ${scholarship.name}`, TYPOGRAPHY.HEADER_SIZE, 'bold');
      this.addFormattedSection('Sponsor', scholarship.sponsor);
      this.addText(`Match Score: ${scholarship.match_score}% • Amount: ${scholarship.amount}`, TYPOGRAPHY.BODY_SIZE, 'normal');
      this.addText(`Deadline: ${scholarship.deadline}`, TYPOGRAPHY.BODY_SIZE, 'bold');
      this.addText(`Essays Required: ${scholarship.essays_required}`, TYPOGRAPHY.BODY_SIZE, 'normal');
      
      this.addText(`Difficulty Level: ${scholarship.difficulty}`, TYPOGRAPHY.BODY_SIZE, 'bold');
      
      if (scholarship.requirements && scholarship.requirements.length > 0) {
        this.addFormattedSection('Requirements', '', false);
        scholarship.requirements.forEach(req => {
          this.addBulletPoint(req);
        });
      }
      
      if (scholarship.tips) {
        this.addFormattedSection('Application Strategy', scholarship.tips);
      }
      
      const deadlineDate = new Date(scholarship.deadline);
      const today = new Date();
      const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      if (daysUntilDeadline > 0) {
        this.addText(`Days Until Deadline: ${daysUntilDeadline}`, TYPOGRAPHY.BODY_SIZE, 'bold');
        
        if (daysUntilDeadline <= 30) {
          this.addText('URGENT: Less than 30 days remaining!', TYPOGRAPHY.BODY_SIZE, 'bold');
        } else if (daysUntilDeadline <= 60) {
          this.addText('Important: Start preparing now - Less than 60 days remaining', TYPOGRAPHY.BODY_SIZE, 'bold');
        }
      }
      
      if (scholarship.application_link) {
        this.addClickableLink(`Application URL: ${scholarship.application_link}`, scholarship.application_link);
      }
      
      this.currentY += 12;
    });
    
    if (data.strategy) {
      this.addSubtitle('Comprehensive Application Strategy');
      if (typeof data.strategy === 'object') {
        Object.entries(data.strategy).forEach(([category, advice]: [string, any]) => {
          this.addText(category.replace(/_/g, ' ').toUpperCase(), TYPOGRAPHY.BODY_SIZE, 'bold');
          if (Array.isArray(advice)) {
            advice.forEach(item => this.addBulletPoint(item));
          } else if (typeof advice === 'string') {
            this.addText(advice);
          }
        });
      }
    }

    if (data.essay_guidance) {
      this.addSubtitle('Essay Writing Guidance');
      if (typeof data.essay_guidance === 'object') {
        Object.entries(data.essay_guidance).forEach(([section, guidance]: [string, any]) => {
          this.addText(section.replace(/_/g, ' ').toUpperCase(), TYPOGRAPHY.BODY_SIZE, 'bold');
          if (Array.isArray(guidance)) {
            guidance.forEach(tip => this.addBulletPoint(tip));
          } else if (typeof guidance === 'string') {
            this.addText(guidance);
          }
        });
      }
    }

    this.addSubtitle('General Scholarship Application Tips');
    this.addBulletPoint('Start applications early - many scholarships have rolling deadlines');
    this.addBulletPoint('Tailor each application to the specific scholarship requirements');
    this.addBulletPoint('Keep track of all deadlines using a calendar or spreadsheet');
    this.addBulletPoint('Request recommendation letters at least 4-6 weeks in advance');
    this.addBulletPoint('Proofread all materials multiple times before submitting');
    this.addBulletPoint('Apply to multiple scholarships to increase your chances');
    this.addBulletPoint('Follow up appropriately and express gratitude');
    
    this.addFooter();
    return this.doc;
  }

  generateHousingPDF(data: any, userAnswers?: any) {
    this.addTitle('Housing Recommendations Report');
    
    const isInternational = userAnswers?.international_student || 
      (typeof data.profile === 'string' && data.profile.toLowerCase().includes('international'));
    
    if (isInternational) {
      this.addSubtitle('Important Notice: Guarantor Requirements for International Students');
      this.addText('International students are generally required to have a guarantor for leases. A guarantor must have a valid US social security number and a good credit score to pass the credit check. Since international students may not have SSNs or US credit history, a guarantor is necessary for most leases.', TYPOGRAPHY.BODY_SIZE, 'bold');
      
      this.addText('Guarantor Alternatives:', TYPOGRAPHY.BODY_SIZE, 'bold');
      this.addBulletPoint('Third-party guarantor services (e.g., Insurent, TheGuarantors)');
      this.addBulletPoint('Graduate assistantships that may waive guarantor requirements');
      this.addBulletPoint('On-campus housing programs designed for international students');
      this.addBulletPoint('Security deposit alternatives (larger upfront payments)');
      this.currentY += 10;
    }
    
    if (userAnswers) {
      this.addSubtitle('Your Housing Preferences');
      this.addText(`Budget Range: ${userAnswers.budget || 'Not specified'}`);
      this.addText(`Preferred Location: ${userAnswers.location || userAnswers.city || 'Not specified'}`);
      this.addText(`Housing Type: ${userAnswers.housing_type || 'Not specified'}`);
      this.addText(`Roommate Preference: ${userAnswers.roommates || 'Not specified'}`);
      this.currentY += 5;
    }
    
    this.addSubtitle('Housing Recommendations');
    
    data.recommendations?.forEach((housing: HousingRecommendation, index: number) => {
      this.checkPageBreak(40);
      
      this.addText(`${index + 1}. ${housing.name}`, 12, 'bold');
      if (housing.address) {
        this.addText(`Address: ${housing.address}`);
      }
      this.addText(`Match Score: ${housing.match_score}% • Rent: ${housing.rent}/month`);
      this.addText(`Distance: ${housing.distance} • Type: ${housing.type}`);
      
      if (housing.rating) {
        this.addText(`Rating: ${housing.rating}/5`);
      }
      
      if (isInternational) {
        let guarantorStatus = '';
        if (housing.type === 'Dormitory' || housing.type === 'On-Campus') {
          guarantorStatus = 'No guarantor required - University housing';
        } else if (housing.type === 'Homestay') {
          guarantorStatus = 'Guarantor may be waived - Contact host family';
        } else {
          guarantorStatus = 'Guarantor required - Consider third-party services';
        }
        this.addText(`Guarantor Status: ${guarantorStatus}`, TYPOGRAPHY.BODY_SIZE, 'bold');
      }
      
      if (housing.amenities && housing.amenities.length > 0) {
        this.addText('Amenities:', TYPOGRAPHY.BODY_SIZE, 'bold');
        housing.amenities.slice(0, 8).forEach(amenity => {
          this.addBulletPoint(amenity);
        });
      }
      
      if (housing.pros && housing.pros.length > 0) {
        this.addText('Advantages:', TYPOGRAPHY.BODY_SIZE, 'bold');
        housing.pros.forEach(pro => {
          this.addBulletPoint(pro);
        });
      }
      
      if (housing.cons && housing.cons.length > 0) {
        this.addText('Disadvantages:', TYPOGRAPHY.BODY_SIZE, 'bold');
        housing.cons.forEach(con => {
          this.addBulletPoint(con);
        });
      }
      
      this.addText(`Contact: ${housing.contact}`);
      this.currentY += 8;
    });
    
    if (data.tips && data.tips.length > 0) {
      this.addSubtitle('Housing Tips');
      data.tips.forEach((tip: string) => {
        this.addBulletPoint(tip);
      });
    }
    
    if (data.budget_breakdown) {
      this.addSubtitle('Budget Considerations');
      if (typeof data.budget_breakdown === 'object') {
        Object.entries(data.budget_breakdown).forEach(([key, value]) => {
          this.addBulletPoint(`${key.replace(/_/g, ' ')}: $${value}`);
        });
      } else {
        this.addText(String(data.budget_breakdown));
      }
    }
    
    this.addFooter();
    return this.doc;
  }

  generateWellnessPDF(data: any, userAnswers?: any) {
    this.addTitle('Wellness Support Report');
    
    if (userAnswers) {
      this.addSubtitle('Your Wellness Profile');
      this.addText(`Support Type: ${userAnswers.support_type || 'Not specified'}`);
      this.addText(`Stress Level: ${userAnswers.stress_level || 'Not specified'}`);
      this.addText(`Preferred Support: ${userAnswers.preferred_support || 'Not specified'}`);
      this.currentY += 5;
    }
    
    this.addSubtitle('Your Wellness Journey');
    this.addText('Wellness Coins Earned: 0');
    this.addText('Games Completed: 0');
    this.addText('Current Streak: 0 days');
    this.addText('Badges Earned: None yet');
    this.currentY += 10;
    
    this.addSubtitle('Crisis Support Resources');
    this.addText('If you are experiencing a mental health crisis:', TYPOGRAPHY.BODY_SIZE, 'bold');
    this.addBulletPoint('National Suicide Prevention Lifeline: 988');
    this.addBulletPoint('Crisis Text Line: Text HOME to 741741');
    this.addBulletPoint('International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/');
    this.currentY += 10;
    
    this.addSubtitle('Support Resources');
    this.addBulletPoint('Campus Counseling Services');
    this.addBulletPoint('Student Health Centers');
    this.addBulletPoint('Peer Support Groups');
    this.addBulletPoint('Mental Health Apps and Online Resources');
    this.addBulletPoint('International Student Health Insurance: https://www.internationalstudentinsurance.com/contact/');
    this.currentY += 10;
    
    this.addSubtitle('Recommended Wellness Activities');
    this.addText('Complete these mini-games to earn Wellness Coins:', TYPOGRAPHY.BODY_SIZE, 'bold');
    this.addBulletPoint('Tic-Tac-Toe (vs AI) - Complete under 5 minutes = 1 Coin');
    this.addBulletPoint('Connect Four (vs AI) - Complete under 5 minutes = 1 Coin');
    this.addBulletPoint('Mini Sudoku (4x4) - Solve under 5 minutes = 1 Coin');
    this.addBulletPoint('Memory Match - Clear board under 5 minutes = 1 Coin');
    this.addBulletPoint('Checkers (vs AI) - Win under 5 minutes = 1 Coin');
    
    this.addText('Bonus: Complete 3 games consecutively = +1 extra Coin!', TYPOGRAPHY.BODY_SIZE, 'bold');
    
    this.addFooter();
    return this.doc;
  }

  generateVisaPDF(data: any, userAnswers?: any) {
    this.addTitle('Visa Preparation Guide');
    
    if (userAnswers) {
      this.addSubtitle('Your Visa Profile');
      this.addText(`Nationality: ${userAnswers.nationality || 'Not specified'}`);
      this.addText(`Visa Type: ${userAnswers.visa_type || 'Not specified'}`);
      this.addText(`University: ${userAnswers.university || 'Not specified'}`);
      this.addText(`Program Start Date: ${userAnswers.start_date || 'Not specified'}`);
      this.currentY += 5;
    }
    
    if (data.timeline && data.timeline.length > 0) {
      this.addSubtitle('Visa Application Timeline');
      data.timeline.forEach((phase: any, index: number) => {
        this.checkPageBreak(20);
        this.addText(`${index + 1}. ${phase.phase}`, TYPOGRAPHY.BODY_SIZE, 'bold');
        this.addText(`Duration: ${phase.duration}`);
        
        if (phase.tasks && phase.tasks.length > 0) {
          phase.tasks.forEach((task: string) => {
            this.addBulletPoint(task);
          });
        }
        this.currentY += 5;
      });
    }
    
    if (data.document_checklist && data.document_checklist.length > 0) {
      this.addSubtitle('Required Documents');
      data.document_checklist.forEach((doc: any) => {
        this.checkPageBreak(15);
        this.addText(`${doc.document}`, TYPOGRAPHY.BODY_SIZE, 'bold');
        this.addText(`Status: ${doc.status}`);
        this.addText(`Instructions: ${doc.instructions}`);
        this.currentY += 5;
      });
    }
    
    if (data.interview_prep) {
      this.addSubtitle('Interview Preparation');
      
      if (typeof data.interview_prep === 'object') {
        if (data.interview_prep.common_questions && Array.isArray(data.interview_prep.common_questions)) {
          this.addText('Common Questions:', TYPOGRAPHY.BODY_SIZE, 'bold');
          data.interview_prep.common_questions.forEach((q: string) => {
            this.addBulletPoint(q);
          });
          this.currentY += 5;
        }
        
        if (data.interview_prep.preparation_tips && Array.isArray(data.interview_prep.preparation_tips)) {
          this.addText('Preparation Tips:', TYPOGRAPHY.BODY_SIZE, 'bold');
          data.interview_prep.preparation_tips.forEach((tip: string) => {
            this.addBulletPoint(tip);
          });
          this.currentY += 5;
        }
      }
    }
    
    if (data.embassy_info) {
      this.addSubtitle('Embassy Information');
      
      if (typeof data.embassy_info === 'object') {
        if (data.embassy_info.location) {
          this.addText(`Location: ${data.embassy_info.location}`);
        }
        if (data.embassy_info.wait_times) {
          this.addText(`Wait Times: ${data.embassy_info.wait_times}`);
        }
        if (data.embassy_info.requirements && Array.isArray(data.embassy_info.requirements)) {
          this.addText('Specific Requirements:', TYPOGRAPHY.BODY_SIZE, 'bold');
          data.embassy_info.requirements.forEach((req: string) => {
            this.addBulletPoint(req);
          });
        }
        this.currentY += 5;
      }
    }
    
    if (data.fees) {
      this.addSubtitle('Visa Fees');
      
      if (typeof data.fees === 'object') {
        let total = 0;
        Object.entries(data.fees).forEach(([feeType, amount]) => {
          const feeLabel = feeType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          this.addBulletPoint(`${feeLabel}: $${amount}`);
          if (typeof amount === 'number') {
            total += amount;
          }
        });
        if (total > 0) {
          this.addText(`Total Estimated: $${total}`, TYPOGRAPHY.BODY_SIZE, 'bold');
        }
      }
    }
    
    this.addFooter();
    return this.doc;
  }
}

export const generateDynamicPDF = async (
  resultData: any, 
  resultType: 'university' | 'scholarship' | 'housing' | 'wellness' | 'visa',
  userAnswers?: any,
  title?: string,
  userProfile?: any
) => {
  const generator = new DynamicPDFGenerator();
  let doc: jsPDF;
  
  switch (resultType) {
    case 'university':
      doc = generator.generateUniversityPDF(resultData, userAnswers, userProfile);
      break;
    case 'scholarship':
      doc = generator.generateScholarshipPDF(resultData, userAnswers, userProfile);
      break;
    case 'housing':
      doc = generator.generateHousingPDF(resultData, userAnswers);
      break;
    case 'wellness':
      doc = generator.generateWellnessPDF(resultData, userAnswers);
      break;
    case 'visa':
      doc = generator.generateVisaPDF(resultData, userAnswers);
      break;
    default:
      throw new Error(`Unknown result type: ${resultType}`);
  }
  
  const fileName = title 
    ? `${title.replace(/\s+/g, '_')}.pdf`
    : `${resultType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
  
  doc.save(fileName);
  return doc;
};
