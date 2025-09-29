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

export class DynamicPDFGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 280;
  private leftMargin: number = 20;
  private rightMargin: number = 190;

  constructor() {
    this.doc = new jsPDF();
  }

  private addPage() {
    this.doc.addPage();
    this.currentY = 20;
  }

  private checkPageBreak(height: number = 10) {
    if (this.currentY + height > this.pageHeight) {
      this.addPage();
    }
  }

  private addTitle(title: string) {
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.leftMargin, this.currentY);
    this.currentY += 15;
    
    // Add a horizontal line
    this.doc.setLineWidth(0.5);
    this.doc.line(this.leftMargin, this.currentY, this.rightMargin, this.currentY);
    this.currentY += 10;
  }

  private addSubtitle(subtitle: string) {
    this.checkPageBreak(15);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(subtitle, this.leftMargin, this.currentY);
    this.currentY += 10;
  }

  private addText(text: string, fontSize: number = 10, style: 'normal' | 'bold' = 'normal') {
    this.checkPageBreak(8);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', style);
    
    const splitText = this.doc.splitTextToSize(text, this.rightMargin - this.leftMargin);
    this.doc.text(splitText, this.leftMargin, this.currentY);
    this.currentY += (splitText.length * 6) + 3;
  }

  private addBulletPoint(text: string) {
    this.checkPageBreak(8);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const splitText = this.doc.splitTextToSize(`• ${text}`, this.rightMargin - this.leftMargin - 5);
    this.doc.text(splitText, this.leftMargin + 5, this.currentY);
    this.currentY += (splitText.length * 6) + 2;
  }

  private addScoreChart(matches: Array<{name: string, match_score?: number, acceptance_rate?: string}>) {
    // Skip chart if no matches or insufficient data
    if (!matches || matches.length === 0) {
      return;
    }
    
    this.checkPageBreak(60);
    
    const chartX = this.leftMargin;
    const chartY = this.currentY;
    const chartWidth = 160;
    const chartHeight = Math.min(50, 10 + (matches.length * 10));
    
    // Only draw chart if we have valid dimensions
    if (chartWidth > 0 && chartHeight > 0) {
      this.doc.setLineWidth(1);
      this.doc.rect(chartX, chartY, chartWidth, chartHeight);
      
      const spacing = 8;
      
      matches.slice(0, 5).forEach((match, index) => {
        const itemY = chartY + 8 + (index * spacing);
        
        // Add name
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'normal');
        const shortName = match.name.length > 25 ? match.name.substring(0, 25) + '...' : match.name;
        this.doc.text(shortName, chartX + 5, itemY);
        
        // Add either match score or acceptance rate
        if (match.match_score !== undefined) {
          // For scholarships with match scores
          const barWidth = Math.max(1, (match.match_score / 100) * (chartWidth - 100));
          this.doc.setFillColor(59, 130, 246); // Blue
          this.doc.rect(chartX + 90, itemY - 2, barWidth, 4, 'F');
          this.doc.text(`${match.match_score}%`, chartX + 90 + barWidth + 5, itemY);
        } else if (match.acceptance_rate) {
          // For universities with acceptance rates
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
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Page ${i} of ${pageCount}`, this.rightMargin - 20, 290);
      
      // Enhanced disclaimer and branding
      const disclaimerY = 285;
      this.doc.text('Disclaimer: This report is generated by AI based on your preferences.', this.leftMargin, disclaimerY);
      this.doc.text('Please verify details on the official university websites.', this.leftMargin, disclaimerY + 5);
      this.doc.text(`Generated by StudySync • ${new Date().toLocaleDateString()}`, this.leftMargin, disclaimerY + 10);
    }
  }

  generateUniversityPDF(data: any, userAnswers?: any) {
    // Enhanced Header Section
    this.addTitle('Your Personalized University Matches');
    
    // Add subtitle
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Based on your preferences, here are universities that best fit your profile', this.leftMargin, this.currentY);
    this.currentY += 10;
    
    // Add generation date and user name
    const today = new Date().toLocaleDateString();
    this.doc.setFontSize(10);
    this.doc.text(`Generated on: ${today}`, this.leftMargin, this.currentY);
    this.currentY += 8;
    
    // Add user name if available (from userAnswers or data)
    const userName = userAnswers?.name || userAnswers?.user_name || data?.user_name;
    if (userName) {
      this.doc.text(`Prepared for: ${userName}`, this.leftMargin, this.currentY);
      this.currentY += 8;
    }
    
    this.currentY += 10;
    
    // User Profile Summary
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
    
    // Match Score Chart
    if (data.matches && data.matches.length > 0) {
      this.addSubtitle('Match Score Overview');
      this.addScoreChart(data.matches);
    }
    
    // University Cards Layout
    this.addSubtitle('Your University Matches');
    
    data.matches?.slice(0, 10).forEach((university: any, index: number) => {
      this.checkPageBreak(80);
      
      // University Name (bold, larger font)
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${university.name}`, this.leftMargin, this.currentY);
      this.currentY += 12;
      
      // Location & Ranking on same line
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      let locationRankingLine = `📍 Location: ${university.location}`;
      if (university.ranking) {
        locationRankingLine += ` 🏅 Ranking: ${university.ranking}`;
      }
      this.doc.text(locationRankingLine, this.leftMargin, this.currentY);
      this.currentY += 8;
      
      // Tuition & Acceptance Rate with difficulty
      const tuitionAcceptanceLine = `💲 Tuition: ${university.tuition} 📊 Acceptance Rate: ${university.acceptance_rate} (Difficulty: ${university.difficulty})`;
      this.doc.text(tuitionAcceptanceLine, this.leftMargin, this.currentY);
      this.currentY += 8;
      
      // Student Body count
      if (university.student_body) {
        this.doc.text(`👩‍🎓 Students: ${university.student_body.toLocaleString()}`, this.leftMargin, this.currentY);
        this.currentY += 8;
      }
      
      // Available Programs as comma-separated list
      if (university.programs && university.programs.length > 0) {
        this.doc.text(`Available Programs: ${university.programs.join(', ')}`, this.leftMargin, this.currentY);
        this.currentY += 8;
      }
      
      // Scholarships Available section with bullet points
      if (university.school_scholarships?.merit_scholarships) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Scholarships Available:', this.leftMargin, this.currentY);
        this.currentY += 6;
        this.doc.setFont('helvetica', 'normal');
        
        university.school_scholarships.merit_scholarships.slice(0, 3).forEach((scholarship: any) => {
          this.addBulletPoint(`${scholarship.name} — ${scholarship.amount} (${scholarship.eligibility})`);
        });
      }
      
      // Why This School Matches You (highlighted section)
      if (university.personalized_summary) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Why This School Matches You:', this.leftMargin, this.currentY);
        this.currentY += 6;
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`"${university.personalized_summary}"`, this.leftMargin, this.currentY);
        this.currentY += 8;
      }
      
      // Description section
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Description:', this.leftMargin, this.currentY);
      this.currentY += 6;
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(university.description, this.leftMargin, this.currentY);
      this.currentY += 8;
      
      // Website with link formatting
      if (university.website) {
        this.doc.text(`🔗 Website: ${university.website}`, this.leftMargin, this.currentY);
        this.currentY += 8;
      }
      
      // Add separator line between universities
      this.doc.setLineWidth(0.3);
      this.doc.line(this.leftMargin, this.currentY + 2, this.rightMargin, this.currentY + 2);
      this.currentY += 15;

      // Detailed Information
      if ((university as any).detailed_info) {
        const info = (university as any).detailed_info;
        this.addText('📊 Academic Details:', 11, 'bold');
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
          this.addText('🏢 Key Facilities:', 11, 'bold');
          info.facilities.slice(0, 5).forEach((facility: string) => {
            this.addBulletPoint(facility);
          });
        }

        if (info.research_opportunities) {
          this.addText('🔬 Research Opportunities:', 11, 'bold');
          this.addText(info.research_opportunities);
        }

        if (info.career_services) {
          this.addText('💼 Career Services:', 11, 'bold');
          this.addText(info.career_services);
        }

        if (info.notable_alumni && info.notable_alumni.length > 0) {
          this.addText('🌟 Notable Alumni:', 11, 'bold');
          info.notable_alumni.slice(0, 3).forEach((alumni: string) => {
            this.addBulletPoint(alumni);
          });
        }
      }

      // School Scholarships
      if ((university as any).school_scholarships) {
        const scholarships = (university as any).school_scholarships;
        this.addText('💰 Available Scholarships:', 11, 'bold');
        
        if (scholarships.merit_scholarships && scholarships.merit_scholarships.length > 0) {
          this.addText('Merit-Based Scholarships:', 10, 'bold');
          scholarships.merit_scholarships.slice(0, 3).forEach((scholarship: any) => {
            this.addBulletPoint(`${scholarship.name}: ${scholarship.amount} - ${scholarship.eligibility}`);
            if (scholarship.deadline) {
              this.addText(`   Deadline: ${scholarship.deadline}`, 9);
            }
          });
        }

        if (scholarships.need_based && scholarships.need_based.length > 0) {
          this.addText('Need-Based Scholarships:', 10, 'bold');
          scholarships.need_based.slice(0, 2).forEach((scholarship: any) => {
            this.addBulletPoint(`${scholarship.name}: ${scholarship.amount} - ${scholarship.eligibility}`);
          });
        }

        if (scholarships.program_specific && scholarships.program_specific.length > 0) {
          this.addText('Program-Specific Scholarships:', 10, 'bold');
          scholarships.program_specific.slice(0, 2).forEach((scholarship: any) => {
            this.addBulletPoint(`${scholarship.name}: ${scholarship.amount} - ${scholarship.eligibility}`);
          });
        }
      }
      
      // Requirements
      if (university.requirements && university.requirements.length > 0) {
        this.addText('📋 Application Requirements:', 11, 'bold');
        university.requirements.slice(0, 8).forEach(req => {
          this.addBulletPoint(req);
        });
      }
      
      this.addText(`📅 Application Deadline: ${university.application_deadline}`, 10, 'bold');
      
      if (university.website) {
        this.addText(`🌐 Website: ${university.website}`);
      }
      
      this.currentY += 15;
    });
    
    // Enhanced disclaimer and footer
    this.addSubtitle('Important Information');
    this.addText('• This report is generated by AI based on your preferences and responses.');
    this.addText('• Please verify all information on official university websites before making decisions.');
    this.addText('• Tuition costs, acceptance rates, and other data may have changed since generation.');
    this.addText('• Contact university admissions offices directly for the most current information.');
    this.addText('• Scholarship availability and requirements may vary by academic year.');
    
    this.addFooter();
    return this.doc;
  }

  generateScholarshipPDF(data: any, userAnswers?: any) {
    this.addTitle('Scholarship Opportunities Report');
    
    // User Profile
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
    
    // Summary Statistics
    if (data.scholarships && data.scholarships.length > 0) {
      this.addSubtitle('Scholarship Opportunity Summary');
      const totalAmount = data.scholarships.reduce((sum: number, s: ScholarshipMatch) => {
        const amount = s.amount.replace(/[^\d]/g, '');
        return sum + (parseInt(amount) || 0);
      }, 0);
      
      this.addText(`🎯 Total Scholarships Found: ${data.scholarships.length}`);
      if (totalAmount > 0) {
        this.addText(`💰 Total Potential Value: $${totalAmount.toLocaleString()}`);
      }
      
      const avgMatch = data.scholarships.reduce((sum: number, s: ScholarshipMatch) => sum + s.match_score, 0) / data.scholarships.length;
      this.addText(`📊 Average Match Score: ${avgMatch.toFixed(1)}%`);
      this.currentY += 5;
      
      // Match Score Chart
      this.addSubtitle('Scholarship Match Overview');
      this.addScoreChart(data.scholarships.map((s: ScholarshipMatch) => ({
        name: s.name,
        match_score: s.match_score
      })));
    }
    
    // Scholarships
    this.addSubtitle('Your Scholarship Matches');
    
    data.scholarships?.forEach((scholarship: ScholarshipMatch, index: number) => {
      this.checkPageBreak(50);
      
      this.addText(`${index + 1}. ${scholarship.name}`, 14, 'bold');
      this.addText(`🏢 Sponsor: ${scholarship.sponsor}`);
      this.addText(`🎯 ${scholarship.match_score}% Match • 💰 ${scholarship.amount}`);
      this.addText(`📅 Deadline: ${scholarship.deadline}`, 10, 'bold');
      this.addText(`📝 Essays Required: ${scholarship.essays_required}`);
      
      // Difficulty badge
      const difficultyEmoji = scholarship.difficulty === 'Low' ? '🟢' : 
                            scholarship.difficulty === 'Medium' ? '🟡' : '🔴';
      this.addText(`${difficultyEmoji} Difficulty: ${scholarship.difficulty}`, 10, 'bold');
      
      // Requirements
      if (scholarship.requirements && scholarship.requirements.length > 0) {
        this.addText('📋 Requirements:', 11, 'bold');
        scholarship.requirements.forEach(req => {
          this.addBulletPoint(req);
        });
      }
      
      // Application Strategy
      this.addText('💡 Application Strategy:', 11, 'bold');
      this.addText(scholarship.tips);
      
      // Application timeline
      const deadlineDate = new Date(scholarship.deadline);
      const today = new Date();
      const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      if (daysUntilDeadline > 0) {
        this.addText(`⏰ Days Until Deadline: ${daysUntilDeadline}`, 10, 'bold');
        
        if (daysUntilDeadline <= 30) {
          this.addText('🚨 URGENT: Less than 30 days remaining!', 10, 'bold');
        } else if (daysUntilDeadline <= 60) {
          this.addText('⚠️ Start preparing now - Less than 60 days remaining!', 10, 'bold');
        }
      }
      
      if (scholarship.application_link) {
        this.addText(`🔗 Apply at: ${scholarship.application_link}`);
      }
      
      this.currentY += 12;
    });
    
    // Application Strategy Section
    if (data.strategy) {
      this.addSubtitle('Comprehensive Application Strategy');
      if (typeof data.strategy === 'object') {
        Object.entries(data.strategy).forEach(([category, advice]: [string, any]) => {
          this.addText(category.replace(/_/g, ' ').toUpperCase(), 11, 'bold');
          if (Array.isArray(advice)) {
            advice.forEach(item => this.addBulletPoint(item));
          } else if (typeof advice === 'string') {
            this.addText(advice);
          }
        });
      }
    }

    // Essay Guidance
    if (data.essay_guidance) {
      this.addSubtitle('Essay Writing Guidance');
      if (typeof data.essay_guidance === 'object') {
        Object.entries(data.essay_guidance).forEach(([section, guidance]: [string, any]) => {
          this.addText(section.replace(/_/g, ' ').toUpperCase(), 11, 'bold');
          if (Array.isArray(guidance)) {
            guidance.forEach(tip => this.addBulletPoint(tip));
          } else if (typeof guidance === 'string') {
            this.addText(guidance);
          }
        });
      }
    }

    // General Tips
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
    
    // International Student Disclaimer
    const isInternational = userAnswers?.international_student || 
      (typeof data.profile === 'string' && data.profile.toLowerCase().includes('international'));
    
    if (isInternational) {
      this.addSubtitle('⚠️ Important: Guarantor Requirements for International Students');
      this.addText('International students are generally required to have a guarantor for leases. A guarantor must have a valid US social security number and a good credit score to pass the credit check. Since international students may not have SSNs or US credit history, a guarantor is necessary for most leases.', 10, 'bold');
      
      this.addText('Guarantor Alternatives:', 10, 'bold');
      this.addBulletPoint('Third-party guarantor services (e.g., Insurent, TheGuarantors)');
      this.addBulletPoint('Graduate assistantships that may waive guarantor requirements');
      this.addBulletPoint('On-campus housing programs designed for international students');
      this.addBulletPoint('Security deposit alternatives (larger upfront payments)');
      this.currentY += 10;
    }
    
    // User Profile
    if (userAnswers) {
      this.addSubtitle('Your Housing Preferences');
      this.addText(`Budget Range: ${userAnswers.budget || 'Not specified'}`);
      this.addText(`Preferred Location: ${userAnswers.location || userAnswers.city || 'Not specified'}`);
      this.addText(`Housing Type: ${userAnswers.housing_type || 'Not specified'}`);
      this.addText(`Roommate Preference: ${userAnswers.roommates || 'Not specified'}`);
      this.currentY += 5;
    }
    
    // Housing Recommendations
    this.addSubtitle('Housing Recommendations');
    
    data.recommendations?.forEach((housing: HousingRecommendation, index: number) => {
      this.checkPageBreak(40);
      
      this.addText(`${index + 1}. ${housing.name}`, 12, 'bold');
      if (housing.address) {
        this.addText(`📍 ${housing.address}`);
      }
      this.addText(`🎯 ${housing.match_score}% Match • 💰 ${housing.rent}/month`);
      this.addText(`📏 Distance: ${housing.distance} • 🏠 Type: ${housing.type}`);
      
      if (housing.rating) {
        this.addText(`⭐ Rating: ${housing.rating}/5`);
      }
      
      // Guarantor Status for International Students
      if (isInternational) {
        let guarantorStatus = '';
        if (housing.type === 'Dormitory' || housing.type === 'On-Campus') {
          guarantorStatus = '✅ No guarantor required - University housing';
        } else if (housing.type === 'Homestay') {
          guarantorStatus = '⚠️ Guarantor may be waived - Contact host family';
        } else {
          guarantorStatus = '❗ Guarantor required - Consider third-party services';
        }
        this.addText(`Guarantor Status: ${guarantorStatus}`, 10, 'bold');
      }
      
      // Amenities
      if (housing.amenities && housing.amenities.length > 0) {
        this.addText('Amenities:', 10, 'bold');
        housing.amenities.slice(0, 8).forEach(amenity => {
          this.addBulletPoint(amenity);
        });
      }
      
      // Pros and Cons
      if (housing.pros && housing.pros.length > 0) {
        this.addText('Pros:', 10, 'bold');
        housing.pros.forEach(pro => {
          this.addBulletPoint(`✅ ${pro}`);
        });
      }
      
      if (housing.cons && housing.cons.length > 0) {
        this.addText('Cons:', 10, 'bold');
        housing.cons.forEach(con => {
          this.addBulletPoint(`❌ ${con}`);
        });
      }
      
      this.addText(`Contact: ${housing.contact}`);
      this.currentY += 8;
    });
    
    // Tips
    if (data.tips && data.tips.length > 0) {
      this.addSubtitle('Housing Tips');
      data.tips.forEach((tip: string) => {
        this.addBulletPoint(tip);
      });
    }
    
    // Budget Breakdown
    if (data.budget_breakdown) {
      this.addSubtitle('Budget Considerations');
      this.addText(JSON.stringify(data.budget_breakdown));
    }
    
    this.addFooter();
    return this.doc;
  }

  generateWellnessPDF(data: any, userAnswers?: any) {
    this.addTitle('Wellness Support Report');
    
    // User Wellness Profile
    if (userAnswers) {
      this.addSubtitle('Your Wellness Profile');
      this.addText(`Support Type: ${userAnswers.support_type || 'Not specified'}`);
      this.addText(`Stress Level: ${userAnswers.stress_level || 'Not specified'}`);
      this.addText(`Preferred Support: ${userAnswers.preferred_support || 'Not specified'}`);
      this.currentY += 5;
    }
    
    // Wellness Stats (if available from useWellnessData)
    this.addSubtitle('Your Wellness Journey');
    this.addText('Wellness Coins Earned: 0'); // This would come from actual data
    this.addText('Games Completed: 0');
    this.addText('Current Streak: 0 days');
    this.addText('Badges Earned: None yet');
    this.currentY += 10;
    
    // Crisis Resources
    this.addSubtitle('🚨 Crisis Support Resources');
    this.addText('If you are experiencing a mental health crisis:', 10, 'bold');
    this.addBulletPoint('National Suicide Prevention Lifeline: 988');
    this.addBulletPoint('Crisis Text Line: Text HOME to 741741');
    this.addBulletPoint('International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/');
    this.currentY += 10;
    
    // Support Resources
    this.addSubtitle('Support Resources');
    this.addBulletPoint('Campus Counseling Services');
    this.addBulletPoint('Student Health Centers');
    this.addBulletPoint('Peer Support Groups');
    this.addBulletPoint('Mental Health Apps and Online Resources');
    this.addBulletPoint('International Student Health Insurance: https://www.internationalstudentinsurance.com/contact/');
    this.currentY += 10;
    
    // Wellness Games
    this.addSubtitle('Recommended Wellness Activities');
    this.addText('Complete these mini-games to earn Wellness Coins:', 10, 'bold');
    this.addBulletPoint('Tic-Tac-Toe (vs AI) - Complete under 5 minutes = 1 Coin');
    this.addBulletPoint('Connect Four (vs AI) - Complete under 5 minutes = 1 Coin');
    this.addBulletPoint('Mini Sudoku (4x4) - Solve under 5 minutes = 1 Coin');
    this.addBulletPoint('Memory Match - Clear board under 5 minutes = 1 Coin');
    this.addBulletPoint('Checkers (vs AI) - Win under 5 minutes = 1 Coin');
    
    this.addText('Bonus: Complete 3 games consecutively = +1 extra Coin!', 10, 'bold');
    
    this.addFooter();
    return this.doc;
  }

  generateVisaPDF(data: any, userAnswers?: any) {
    this.addTitle('Visa Preparation Guide');
    
    // User Profile
    if (userAnswers) {
      this.addSubtitle('Your Visa Profile');
      this.addText(`Nationality: ${userAnswers.nationality || 'Not specified'}`);
      this.addText(`Visa Type: ${userAnswers.visa_type || 'Not specified'}`);
      this.addText(`University: ${userAnswers.university || 'Not specified'}`);
      this.addText(`Program Start Date: ${userAnswers.start_date || 'Not specified'}`);
      this.currentY += 5;
    }
    
    // Timeline
    if (data.timeline && data.timeline.length > 0) {
      this.addSubtitle('Visa Application Timeline');
      data.timeline.forEach((phase: any, index: number) => {
        this.checkPageBreak(20);
        this.addText(`Phase ${index + 1}: ${phase.phase}`, 11, 'bold');
        this.addText(`Duration: ${phase.duration}`);
        
        if (phase.tasks && phase.tasks.length > 0) {
          phase.tasks.forEach((task: string) => {
            this.addBulletPoint(task);
          });
        }
        this.currentY += 5;
      });
    }
    
    // Document Checklist
    if (data.document_checklist && data.document_checklist.length > 0) {
      this.addSubtitle('Required Documents');
      data.document_checklist.forEach((doc: any) => {
        this.checkPageBreak(15);
        this.addText(`${doc.document}`, 11, 'bold');
        this.addText(`Status: ${doc.status}`);
        this.addText(`Instructions: ${doc.instructions}`);
        this.currentY += 5;
      });
    }
    
    // Interview Preparation
    if (data.interview_prep) {
      this.addSubtitle('Interview Preparation');
      this.addText(JSON.stringify(data.interview_prep));
    }
    
    // Embassy Information
    if (data.embassy_info) {
      this.addSubtitle('Embassy Information');
      this.addText(JSON.stringify(data.embassy_info));
    }
    
    // Fees
    if (data.fees) {
      this.addSubtitle('Visa Fees');
      this.addText(JSON.stringify(data.fees));
    }
    
    this.addFooter();
    return this.doc;
  }
}

export const generateDynamicPDF = async (
  resultData: any, 
  resultType: 'university' | 'scholarship' | 'housing' | 'wellness' | 'visa',
  userAnswers?: any,
  title?: string
) => {
  const generator = new DynamicPDFGenerator();
  let doc: jsPDF;
  
  switch (resultType) {
    case 'university':
      doc = generator.generateUniversityPDF(resultData, userAnswers);
      break;
    case 'scholarship':
      doc = generator.generateScholarshipPDF(resultData, userAnswers);
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